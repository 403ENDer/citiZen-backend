"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateConstituencySchema = exports.updatePanchayatSchema = exports.bulkConstituencySchema = exports.constituencySchema = exports.bulkPanchayatSchema = exports.panchayatSchema = exports.wardSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Ward validation schema
exports.wardSchema = joi_1.default.object({
    ward_id: joi_1.default.string().required().min(1).max(50),
    ward_name: joi_1.default.string().required().min(2).max(100),
});
// Panchayat validation schema
exports.panchayatSchema = joi_1.default.object({
    name: joi_1.default.string().required().min(2).max(100),
    panchayat_id: joi_1.default.string().required().min(1).max(50),
    constituency_id: joi_1.default.string().required(),
    ward_list: joi_1.default.array().items(exports.wardSchema).min(1).required(),
});
// Bulk panchayat validation schema
exports.bulkPanchayatSchema = joi_1.default.object({
    panchayats: joi_1.default.array().items(exports.panchayatSchema).min(1).required(),
});
// Constituency validation schema
exports.constituencySchema = joi_1.default.object({
    name: joi_1.default.string().required().min(2).max(100),
    constituency_id: joi_1.default.string().required().min(1).max(50),
    mla_id: joi_1.default.string().required(),
    panchayats: joi_1.default.array().items(joi_1.default.string()),
});
// Bulk constituency validation schema
exports.bulkConstituencySchema = joi_1.default.object({
    constituencies: joi_1.default.array().items(exports.constituencySchema).min(1).required(),
});
// Update schemas (without required fields)
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
