"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const response_1 = require("../utils/response");
class AuthController {
    async register(req, res) {
        try {
            const { name, email, password, role } = req.body;
            const user = await auth_service_1.authService.register(name, email, password, role);
            (0, response_1.sendSuccess)(res, user, 'สร้างบัญชีเรียบร้อยแล้ว', 201);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await auth_service_1.authService.login(email, password);
            (0, response_1.sendSuccess)(res, result, 'เข้าสู่ระบบสำเร็จ');
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async logout(_req, res) {
        (0, response_1.sendSuccess)(res, null, 'ออกจากระบบสำเร็จ');
    }
    async me(req, res) {
        try {
            const user = await auth_service_1.authService.me(req.user.userId);
            (0, response_1.sendSuccess)(res, user);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
}
exports.AuthController = AuthController;
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map