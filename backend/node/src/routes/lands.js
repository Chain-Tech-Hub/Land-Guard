const express = require('express');
const { landSchema } = require('../models/schemas');
const repo = require('../repositories/firestore');

const router = express.Router();

router.put('/:landId', async (req, res) => {
  const body = { ...req.body, landId: req.params.landId };
  const { error, value } = landSchema.validate(body, { abortEarly: false });
  if (error) return res.status(400).json({ error: true, details: error.details });
  value.owner = value.owner.toLowerCase();
  const saved = await repo.upsertLand(value.landId, value);
  res.json(saved);
});

router.get('/:landId', async (req, res) => {
  const land = await repo.getLand(req.params.landId);
  if (!land) return res.status(404).json({ error: true, message: 'Land not found' });
  res.json(land);
});

module.exports = router;
