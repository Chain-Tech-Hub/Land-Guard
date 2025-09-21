const { db } = require('../services/firebase');

const col = (name) => db().collection(name);

// Users
async function createUser(data) {
  const ref = await col('users').add({ ...data, createdAt: new Date() });
  const snap = await ref.get();
  return { id: ref.id, ...snap.data() };
}
async function getUserById(id) {
  const snap = await col('users').doc(id).get();
  return snap.exists ? { id, ...snap.data() } : null;
}
async function getUserByAddress(address) {
  const q = await col('users').where('address', '==', address.toLowerCase()).limit(1).get();
  if (q.empty) return null;
  const doc = q.docs[0];
  return { id: doc.id, ...doc.data() };
}
async function listUsers(limit = 50) {
  const q = await col('users').orderBy('createdAt', 'desc').limit(limit).get();
  return q.docs.map(d => ({ id: d.id, ...d.data() }));
}
async function updateUser(id, data) {
  await col('users').doc(id).set({ ...data, updatedAt: new Date() }, { merge: true });
  return getUserById(id);
}
async function deleteUser(id) { await col('users').doc(id).delete(); }

// Lands
async function upsertLand(landId, data) {
  const id = landId.toString();
  await col('lands').doc(id).set({ ...data, updatedAt: new Date() }, { merge: true });
  const snap = await col('lands').doc(id).get();
  return { id, ...snap.data() };
}
async function getLand(landId) {
  const id = landId.toString();
  const snap = await col('lands').doc(id).get();
  return snap.exists ? { id, ...snap.data() } : null;
}

// Events
async function addEvent(ev) {
  const ref = await col('events').add({ ...ev, createdAt: new Date() });
  return ref.id;
}
async function hasEvent(txHash) {
  const q = await col('events').where('txHash', '==', txHash).limit(1).get();
  return !q.empty;
}

async function getSyncState(key) {
  const snap = await col('meta').doc('sync').get();
  const data = snap.exists ? snap.data() : {};
  return data[key] || null;
}

async function setSyncState(key, value) {
  await col('meta').doc('sync').set({ [key]: value, updatedAt: new Date() }, { merge: true });
}

module.exports = {
  createUser, getUserById, getUserByAddress, listUsers, updateUser, deleteUser,
  upsertLand, getLand, addEvent, hasEvent,
  getSyncState, setSyncState,
};
