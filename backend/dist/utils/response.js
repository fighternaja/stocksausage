"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
exports.sendError = sendError;
exports.sendPaginated = sendPaginated;
function sendSuccess(res, data, message = 'Success', statusCode = 200) {
    const response = {
        success: true,
        message,
        data,
    };
    return res.status(statusCode).json(response);
}
function sendError(res, message, error, statusCode = 400) {
    const response = {
        success: false,
        message,
        error,
    };
    return res.status(statusCode).json(response);
}
function sendPaginated(res, items, total, page, limit, message = 'Success') {
    return res.status(200).json({
        success: true,
        message,
        data: {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    });
}
//# sourceMappingURL=response.js.map