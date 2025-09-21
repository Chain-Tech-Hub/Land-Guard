const Joi = require('joi');

const userSchema = Joi.object({
  uid: Joi.string().optional(),
  fullName: Joi.string().min(2).max(120).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(6).max(24).required(),
  nationalId: Joi.string().min(4).max(64).required(),
  address: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  pubKey: Joi.string().optional(),
  // Store privateKey encrypted only
  encPrivKey: Joi.string().min(16).required(),
  role: Joi.string().valid('citizen', 'admin', 'resolver').default('citizen')
});

const landEventSchema = Joi.object({
  txHash: Joi.string().required(),
  blockNumber: Joi.number().required(),
  eventName: Joi.string().required(),
  payload: Joi.object().required(),
  contract: Joi.string().required(),
  createdAt: Joi.date().default(() => new Date())
});

const landSchema = Joi.object({
  landId: Joi.string().required(),
  owner: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  coords: Joi.array().items(Joi.array().items(Joi.number()).length(2)).min(3).optional(),
  meta: Joi.object().optional(),
  updatedAt: Joi.date().default(() => new Date()),
});

module.exports = { userSchema, landEventSchema, landSchema };
