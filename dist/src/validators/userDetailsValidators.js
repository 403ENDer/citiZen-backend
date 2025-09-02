"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWardsSchema = exports.updateConstituencySchema = exports.updatePanchayatSchema = exports.updateUserDetailsSchema = exports.bulkUserDetailsSchema = exports.userDetailsSchema = exports.bulkConstituencyWithPanchayatsSchema = exports.bulkConstituencySchema = exports.constituencyWithPanchayatsSchema = exports.constituencySchema = exports.bulkPanchayatSchema = exports.panchayatSchema = exports.wardSchema = void 0;
const joi_1 = __importDefault(require("joi"));
exports.wardSchema = joi_1.default.object({
    ward_id: joi_1.default.string().required().min(1).max(50),
    ward_name: joi_1.default.string().required().min(2).max(100),
});
exports.panchayatSchema = joi_1.default.object({
    name: joi_1.default.string().required().min(2).max(100),
    panchayat_id: joi_1.default.string().required().min(1).max(50),
    constituency_id: joi_1.default.string().required(),
    ward_list: joi_1.default.array().items(exports.wardSchema).min(1).required(),
});
exports.bulkPanchayatSchema = joi_1.default.object({
    panchayats: joi_1.default.array().items(exports.panchayatSchema).min(1).required(),
});
// Basic constituency schema (without panchayats)
exports.constituencySchema = joi_1.default.object({
    name: joi_1.default.string().required().min(2).max(100),
    constituency_id: joi_1.default.string().required().min(1).max(50),
    mla_id: joi_1.default.string().required(),
});
// Constituency with panchayats schema
exports.constituencyWithPanchayatsSchema = joi_1.default.object({
    name: joi_1.default.string().required().min(2).max(100),
    constituency_id: joi_1.default.string().required().min(1).max(50),
    mla_id: joi_1.default.string().required(),
    panchayats: joi_1.default.array().items(exports.panchayatSchema).min(1).required(),
});
exports.bulkConstituencySchema = joi_1.default.object({
    constituencies: joi_1.default.array().items(exports.constituencySchema).min(1).required(),
});
exports.bulkConstituencyWithPanchayatsSchema = joi_1.default.object({
    constituencies: joi_1.default.array()
        .items(exports.constituencyWithPanchayatsSchema)
        .min(1)
        .required(),
});
// User Details schemas
exports.userDetailsSchema = joi_1.default.object({
    userId: joi_1.default.string().required(),
    constituency_id: joi_1.default.string().required(),
    panchayat_id: joi_1.default.string().required(),
    ward_no: joi_1.default.string().required().min(1).max(50),
});
exports.bulkUserDetailsSchema = joi_1.default.object({
    userDetails: joi_1.default.array().items(exports.userDetailsSchema).min(1).required(),
});
exports.updateUserDetailsSchema = joi_1.default.object({
    constituency_id: joi_1.default.string(),
    panchayat_id: joi_1.default.string(),
    ward_no: joi_1.default.string().min(1).max(50),
});
exports.updatePanchayatSchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100),
    panchayat_id: joi_1.default.string().min(1).max(50),
    constituency_id: joi_1.default.string(),
    ward_list: joi_1.default.array().items(exports.wardSchema).min(1),
});
exports.updateConstituencySchema = joi_1.default.object({
    name: joi_1.default.string().min(2).max(100),
    constituency_id: joi_1.default.string().min(1).max(50),
    mla_id: joi_1.default.string(),
    panchayats: joi_1.default.array().items(joi_1.default.string()).min(1),
});
exports.addWardsSchema = joi_1.default.object({
    ward_list: joi_1.default.array().items(exports.wardSchema).min(1).required(),
});
