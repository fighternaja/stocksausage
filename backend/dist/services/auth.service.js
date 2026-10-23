"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../utils/prisma"));
const config_1 = require("../config");
class AuthService {
    async register(name, email, password, role = 'STAFF') {
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            throw { status: 409, message: 'อีเมลนี้ถูกใช้งานแล้ว', error: 'EMAIL_EXISTS' };
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await prisma_1.default.user.create({
            data: { name, email, password: hashedPassword, role },
            select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
        });
        return user;
    }
    async login(email, password) {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user) {
            throw { status: 401, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', error: 'INVALID_CREDENTIALS' };
        }
        if (user.status === 'DISABLED') {
            throw { status: 403, message: 'บัญชีนี้ถูกระงับการใช้งาน', error: 'ACCOUNT_DISABLED' };
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            throw { status: 401, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', error: 'INVALID_CREDENTIALS' };
        }
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const token = jsonwebtoken_1.default.sign(payload, config_1.config.jwt.secret, {
            expiresIn: config_1.config.jwt.expiresIn,
        });
        return {
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        };
    }
    async me(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
        });
        if (!user) {
            throw { status: 404, message: 'ไม่พบผู้ใช้', error: 'USER_NOT_FOUND' };
        }
        return user;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map