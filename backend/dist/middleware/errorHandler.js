"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
exports.notFoundHandler = notFoundHandler;
function errorHandler(err, _req, res, _next) {
    console.error('Error:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({
        success: false,
        message: 'เกิดข้อผิดพลาดภายในระบบ',
        error: process.env.NODE_ENV === 'development' ? err.message : 'INTERNAL_SERVER_ERROR',
    });
}
function notFoundHandler(_req, res) {
    res.status(404).json({
        success: false,
        message: 'ไม่พบ API ที่ร้องขอ',
        error: 'NOT_FOUND',
    });
}
//# sourceMappingURL=errorHandler.js.map