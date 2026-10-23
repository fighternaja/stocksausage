"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = authenticate;
exports.authorize = authorize;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const response_1 = require("../utils/response");
function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        (0, response_1.sendError)(res, 'กรุณาเข้าสู่ระบบ', 'UNAUTHORIZED', 401);
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwt.secret);
        req.user = decoded;
        next();
    }
    catch {
        (0, response_1.sendError)(res, 'Token ไม่ถูกต้องหรือหมดอายุ', 'INVALID_TOKEN', 401);
    }
}
function authorize(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            (0, response_1.sendError)(res, 'กรุณาเข้าสู่ระบบ', 'UNAUTHORIZED', 401);
            return;
        }
        if (!roles.includes(req.user.role)) {
            (0, response_1.sendError)(res, 'คุณไม่มีสิทธิ์เข้าถึง', 'FORBIDDEN', 403);
            return;
        }
        next();
    };
}
//# sourceMappingURL=auth.js.map