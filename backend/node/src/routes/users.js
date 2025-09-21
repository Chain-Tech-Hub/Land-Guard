const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { userSchema } = require('../models/schemas');
const repo = require('../repositories/firestore');

const router = express.Router();

function sanitize(user) {
  if (!user) return user;
  const { encPrivKey, ...rest } = user;
  return { ...rest, hasEncPrivKey: Boolean(encPrivKey) };
}

router.post('/', async (req, res) => {
  const { error, value } = userSchema.validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ error: true, details: error.details });

  const payload = { ...value, address: value.address.toLowerCase(), uid: uuidv4() };
  const created = await repo.createUser(payload);
  res.status(201).json(sanitize(created));
});

router.get('/', async (req, res) => {
  const users = await repo.listUsers();
  res.json(users.map(sanitize));
});

router.get('/:id', async (req, res) => {
  const user = await repo.getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: true, message: 'User not found' });
  res.json(sanitize(user));
});

router.get('/by-address/:address', async (req, res) => {
  const user = await repo.getUserByAddress(req.params.address.toLowerCase());
  if (!user) return res.status(404).json({ error: true, message: 'User not found' });
  res.json(sanitize(user));
});

router.patch('/:id', async (req, res) => {
  const { error, value } = userSchema.fork(['fullName','email','phone','nationalId','address','pubKey','encPrivKey','role'], s => s.optional()).validate(req.body, { abortEarly: false });
  if (error) return res.status(400).json({ error: true, details: error.details });
  if (value.address) value.address = value.address.toLowerCase();
  const updated = await repo.updateUser(req.params.id, value);
  res.json(sanitize(updated));
});

router.delete('/:id', async (req, res) => {
  await repo.deleteUser(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
