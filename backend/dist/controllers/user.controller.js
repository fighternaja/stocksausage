"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const response_1 = require("../utils/response");
class UserController {
    async list(_req, res) {
        try {
            const users = await user_service_1.userService.list();
            (0, response_1.sendSuccess)(res, users);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async create(req, res) {
        try {
            const { name, email, password, role } = req.body;
            const user = await user_service_1.userService.create(name, email, password, role);
            (0, response_1.sendSuccess)(res, user, 'เพิ่มผู้ใช้เรียบร้อยแล้ว', 201);
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async update(req, res) {
        try {
            const user = await user_service_1.userService.update(req.params.id, req.body);
            (0, response_1.sendSuccess)(res, user, 'แก้ไขผู้ใช้เรียบร้อยแล้ว');
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
    async delete(req, res) {
        try {
            const result = await user_service_1.userService.delete(req.params.id, req.user.userId);
            (0, response_1.sendSuccess)(res, result, 'ลบผู้ใช้เรียบร้อยแล้ว');
        }
        catch (err) {
            (0, response_1.sendError)(res, err.message || 'เกิดข้อผิดพลาด', err.error, err.status || 500);
        }
    }
}
exports.UserController = UserController;
exports.userController = new UserController();
//# sourceMappingURL=user.controller.js.map