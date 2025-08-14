import Joi from "joi";

export const wardSchema = Joi.object({
  ward_id: Joi.string().required().min(1).max(50),
  ward_name: Joi.string().required().min(2).max(100),
});

export const panchayatSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  panchayat_id: Joi.string().required().min(1).max(50),
  constituency_id: Joi.string().required(),
  ward_list: Joi.array().items(wardSchema).min(1).required(),
});

export const bulkPanchayatSchema = Joi.object({
  panchayats: Joi.array().items(panchayatSchema).min(1).required(),
});

// Basic constituency schema (without panchayats)
export const constituencySchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  constituency_id: Joi.string().required().min(1).max(50),
  mla_id: Joi.string().required(),
});

// Constituency with panchayats schema
export const constituencyWithPanchayatsSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  constituency_id: Joi.string().required().min(1).max(50),
  mla_id: Joi.string().required(),
  panchayats: Joi.array().items(panchayatSchema).min(1).required(),
});

export const bulkConstituencySchema = Joi.object({
  constituencies: Joi.array().items(constituencySchema).min(1).required(),
});

export const bulkConstituencyWithPanchayatsSchema = Joi.object({
  constituencies: Joi.array()
    .items(constituencyWithPanchayatsSchema)
    .min(1)
    .required(),
});

// User Details schemas
export const userDetailsSchema = Joi.object({
  userId: Joi.string().required(),
  constituency_id: Joi.string().required(),
  panchayat_id: Joi.string().required(),
  ward_no: Joi.string().required().min(1).max(50),
});

export const bulkUserDetailsSchema = Joi.object({
  userDetails: Joi.array().items(userDetailsSchema).min(1).required(),
});

export const updateUserDetailsSchema = Joi.object({
  constituency_id: Joi.string(),
  panchayat_id: Joi.string(),
  ward_no: Joi.string().min(1).max(50),
});

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

export const addWardsSchema = Joi.object({
  ward_list: Joi.array().items(wardSchema).min(1).required(),
});
