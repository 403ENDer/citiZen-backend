import Joi from "joi";

// Ward validation schema
export const wardSchema = Joi.object({
  ward_id: Joi.string().required().min(1).max(50),
  ward_name: Joi.string().required().min(2).max(100),
});

// Panchayat validation schema
export const panchayatSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  panchayat_id: Joi.string().required().min(1).max(50),
  constituency_id: Joi.string().required(),
  ward_list: Joi.array().items(wardSchema).min(1).required(),
});

// Bulk panchayat validation schema
export const bulkPanchayatSchema = Joi.object({
  panchayats: Joi.array().items(panchayatSchema).min(1).required(),
});

// Constituency validation schema
export const constituencySchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  constituency_id: Joi.string().required().min(1).max(50),
  mla_id: Joi.string().required(),
  panchayats: Joi.array().items(Joi.string()),
});

// Bulk constituency validation schema
export const bulkConstituencySchema = Joi.object({
  constituencies: Joi.array().items(constituencySchema).min(1).required(),
});

// Update schemas (without required fields)
export const updatePanchayatSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  panchayat_id: Joi.string().min(1).max(50),
  constituency_id: Joi.string(),
  ward_list: Joi.array().items(wardSchema).min(1),
});

export const updateConstituencySchema = Joi.object({
  name: Joi.string().min(2).max(100),
  constituency_id: Joi.string().min(1).max(50),
  mla_id: Joi.string(),
  panchayats: Joi.array().items(Joi.string()).min(1),
});
