"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = require("./config");
const prisma_1 = __importDefault(require("./utils/prisma"));
async function main() {
    try {
        // Test database connection
        await prisma_1.default.$connect();
        console.log('✅ Database connected');
        app_1.default.listen(config_1.config.port, () => {
            console.log(`🚀 Server running on port ${config_1.config.port}`);
            console.log(`📍 API: http://localhost:${config_1.config.port}/api`);
            console.log(`❤️  Health: http://localhost:${config_1.config.port}/api/health`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        await prisma_1.default.$disconnect();
        process.exit(1);
    }
}
// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down...');
    await prisma_1.default.$disconnect();
    process.exit(0);
});
process.on('SIGTERM', async () => {
    console.log('\n🛑 Shutting down...');
    await prisma_1.default.$disconnect();
    process.exit(0);
});
main();
//# sourceMappingURL=server.js.map