"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    // Create users
    const adminPassword = await bcryptjs_1.default.hash('Admin123!', 12);
    const staffPassword = await bcryptjs_1.default.hash('Staff123!', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            name: 'ผู้ดูแลระบบ',
            email: 'admin@example.com',
            password: adminPassword,
            role: 'ADMIN',
            status: 'ACTIVE',
        },
    });
    const staff = await prisma.user.upsert({
        where: { email: 'staff@example.com' },
        update: {},
        create: {
            name: 'พนักงาน',
            email: 'staff@example.com',
            password: staffPassword,
            role: 'STAFF',
            status: 'ACTIVE',
        },
    });
    console.log('✅ Users created:', admin.email, staff.email);
    // Create categories
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { name: 'อาหาร' },
            update: {},
            create: { name: 'อาหาร', description: 'อาหารและขนม' },
        }),
        prisma.category.upsert({
            where: { name: 'เครื่องดื่ม' },
            update: {},
            create: { name: 'เครื่องดื่ม', description: 'น้ำดื่มและเครื่องดื่มต่างๆ' },
        }),
        prisma.category.upsert({
            where: { name: 'อุปกรณ์คอมพิวเตอร์' },
            update: {},
            create: { name: 'อุปกรณ์คอมพิวเตอร์', description: 'อุปกรณ์และอะไหล่คอมพิวเตอร์' },
        }),
        prisma.category.upsert({
            where: { name: 'อุปกรณ์สำนักงาน' },
            update: {},
            create: { name: 'อุปกรณ์สำนักงาน', description: 'เครื่องเขียนและอุปกรณ์สำนักงาน' },
        }),
        prisma.category.upsert({
            where: { name: 'ของใช้ทั่วไป' },
            update: {},
            create: { name: 'ของใช้ทั่วไป', description: 'ของใช้ภายในบ้านและทั่วไป' },
        }),
    ]);
    console.log('✅ Categories created:', categories.length);
    // Create products
    const products = [
        { sku: 'FOOD-001', name: 'ข้าวสาร 5 กก.', description: 'ข้าวหอมมะลิ ขนาด 5 กิโลกรัม', categoryId: categories[0].id, price: 189, cost: 140, stock: 25, minimumStock: 5, unit: 'ถุง' },
        { sku: 'FOOD-002', name: 'น้ำมันพืช 1 ลิตร', description: 'น้ำมันพืชสำหรับปรุงอาหาร', categoryId: categories[0].id, price: 55, cost: 38, stock: 15, minimumStock: 3, unit: 'ขวด' },
        { sku: 'FOOD-003', name: 'บะหมี่กึ่งสำเร็จรูป', description: 'บะหมี่กึ่งสำเร็จรูปรสต้มยำกุ้ง', categoryId: categories[0].id, price: 6, cost: 4, stock: 120, minimumStock: 20, unit: 'ซอง' },
        { sku: 'DRINK-001', name: 'น้ำดื่ม 600ml', description: 'น้ำดื่มบรรจุขวด 600ml', categoryId: categories[1].id, price: 7, cost: 3, stock: 200, minimumStock: 50, unit: 'ขวด' },
        { sku: 'DRINK-002', name: 'กาแฟสำเร็จรูป 3in1', description: 'กาแฟสำเร็จรูป 3in1 20 ซอง', categoryId: categories[1].id, price: 129, cost: 85, stock: 8, minimumStock: 5, unit: 'กล่อง' },
        { sku: 'COMP-001', name: 'เมาส์ไร้สาย', description: 'เมาส์ไร้สาย Bluetooth', categoryId: categories[2].id, price: 390, cost: 250, stock: 12, minimumStock: 3, unit: 'ชิ้น' },
        { sku: 'COMP-002', name: 'แฟลชไดรฟ์ 32GB', description: 'แฟลชไดรฟ์ USB 3.0 ขนาด 32GB', categoryId: categories[2].id, price: 199, cost: 120, stock: 0, minimumStock: 5, unit: 'ชิ้น' },
        { sku: 'OFFICE-001', name: 'กระดาษ A4', description: 'กระดาษ A4 80 แกรม 500 แผ่น', categoryId: categories[3].id, price: 139, cost: 95, stock: 30, minimumStock: 10, unit: 'รีม' },
        { sku: 'OFFICE-002', name: 'ปากกาลูกลื่น', description: 'ปากกาลูกลื่นสีน้ำเงิน', categoryId: categories[3].id, price: 12, cost: 5, stock: 2, minimumStock: 10, unit: 'ด้าม' },
        { sku: 'HOME-001', name: 'น้ำยาล้างจาน', description: 'น้ำยาล้างจาน 500ml', categoryId: categories[4].id, price: 35, cost: 22, stock: 18, minimumStock: 5, unit: 'ขวด' },
    ];
    for (const product of products) {
        await prisma.product.upsert({
            where: { sku: product.sku },
            update: {},
            create: product,
        });
    }
    console.log('✅ Products created:', products.length);
    // Create some stock movements
    const allProducts = await prisma.product.findMany();
    for (const product of allProducts.slice(0, 5)) {
        await prisma.stockMovement.create({
            data: {
                productId: product.id,
                userId: admin.id,
                type: 'IN',
                quantity: product.stock,
                previousStock: 0,
                newStock: product.stock,
                note: 'สต๊อกเริ่มต้น',
            },
        });
    }
    console.log('✅ Stock movements created');
    console.log('🎉 Seeding completed!');
}
main()
    .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map