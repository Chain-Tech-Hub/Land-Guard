const express = require('express');
const { loadContract, getProvider } = require('../services/ethers');
const repo = require('../repositories/firestore');

const router = express.Router();

const LAST_KEY_REGISTRY = 'lastBlock_registry';
const LAST_KEY_TOKEN = 'lastBlock_token';

function serializeArgs(ev) {
  const obj = Object.fromEntries(
    Object.entries(ev.args || {})
      .filter(([k]) => isNaN(Number(k)))
      .map(([k, v]) => [k, typeof v === 'bigint' ? v.toString() : v])
  );
  return obj;
}

router.post('/run', async (req, res) => {
  const registryAddress = process.env.CONTRACT_LAND_REGISTRY;
  const tokenAddress = process.env.CONTRACT_LAND_TOKEN;
  if (!registryAddress || !tokenAddress) return res.status(400).json({ error: true, message: 'Missing contract addresses' });

  const provider = getProvider();
  const latest = await provider.getBlockNumber();

  const registry = loadContract('LandRegistry', registryAddress);
  const token = loadContract('LandToken', tokenAddress);

  const fromRegistry = (await repo.getSyncState(LAST_KEY_REGISTRY)) ?? Number(process.env.SYNC_FROM_BLOCK || 0);
  const fromToken = (await repo.getSyncState(LAST_KEY_TOKEN)) ?? Number(process.env.SYNC_FROM_BLOCK || 0);

  let processed = 0;

  // Sync LandRegistry events
  if (fromRegistry <= latest) {
    const regEvents = await registry.queryFilter('*', fromRegistry, latest);
    for (const ev of regEvents) {
      if (await repo.hasEvent(ev.transactionHash)) continue;
      const name = ev.eventName || ev.event;
      const args = serializeArgs(ev);
      await repo.addEvent({
        txHash: ev.transactionHash,
        blockNumber: ev.blockNumber,
        eventName: name,
        contract: registryAddress,
        payload: args,
      });

      if (name === 'ConflictFlagged') {
        const id = args.tokenId?.toString();
        if (id) await repo.upsertLand(id, { landId: id, meta: { conflict: true }, owner: undefined });
      }
      if (name === 'ConflictResolved') {
        const id = args.tokenId?.toString();
        const newOwner = args.newOwner?.toLowerCase();
        if (id && newOwner) await repo.upsertLand(id, { landId: id, owner: newOwner });
      }
      processed++;
    }
    await repo.setSyncState(LAST_KEY_REGISTRY, latest + 1);
  }

  // Sync LandToken events
  if (fromToken <= latest) {
    const tokEvents = await token.queryFilter('*', fromToken, latest);
    for (const ev of tokEvents) {
      if (await repo.hasEvent(ev.transactionHash)) continue;
      const name = ev.eventName || ev.event;
      const args = serializeArgs(ev);
      await repo.addEvent({
        txHash: ev.transactionHash,
        blockNumber: ev.blockNumber,
        eventName: name,
        contract: tokenAddress,
        payload: args,
      });

      if (name === 'LandMapCreated') {
        const id = args.landId?.toString();
        if (id) await repo.upsertLand(id, { landId: id });
      }
      if (name === 'LandPacelMinted') {
        const id = args.landId?.toString();
        const owner = args.currentLandOwner?.toLowerCase();
        if (id && owner) await repo.upsertLand(id, { landId: id, owner });
      }
      if (name === 'LandPacelListed') {
        const id = args.landId?.toString();
        const price = args.price?.toString();
        if (id) await repo.upsertLand(id, { landId: id, meta: { listed: true, price } });
      }
      if (name === 'LandPacelUnlisted') {
        const id = args.landId?.toString();
        if (id) await repo.upsertLand(id, { landId: id, meta: { listed: false } });
      }
      if (name === 'LandPacelTransfer') {
        const id = args.landId?.toString();
        const to = args.to?.toLowerCase();
        if (id && to) await repo.upsertLand(id, { landId: id, owner: to });
      }
      if (name === 'TitleDeedMinted') {
        const id = args.landId?.toString();
        const url = args.titleDeedUrl;
        if (id && url) await repo.upsertLand(id, { landId: id, meta: { titleDeedUrl: url } });
      }
      processed++;
    }
    await repo.setSyncState(LAST_KEY_TOKEN, latest + 1);
  }

  res.json({ processed, latest, fromRegistry, fromToken });
});

module.exports = router;
