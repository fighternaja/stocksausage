# 📦 ระบบจัดการสต๊อกสินค้า (Stock Management System)

เว็บแอปพลิเคชันจัดการสต๊อกสินค้าแบบง่าย สำหรับใช้งานภายในบ้าน ร้านค้าขนาดเล็ก หรือธุรกิจขนาดย่อม (SME) ออกแบบด้วยดีไซน์ที่ทันสมัย ใช้งานง่าย มีความยืดหยุ่น และรองรับการทำงานทั้งบน Desktop, Tablet และ Mobile

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

### 🖥️ Frontend
- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS (v4) + tw-animate-css
- **UI Components:** shadcn/ui + Base UI
- **Icons:** Lucide React
- **Forms & Validation:** React Hook Form + Zod
- **API Client:** Axios (JWT Interceptors)
- **Charts:** Recharts
- **Notifications:** Sonner Toast

### ⚙️ Backend
- **Runtime & Framework:** Node.js + Express.js
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (JSON Web Tokens) + bcryptjs
- **Security:** Helmet, CORS, Express Rate Limit
- **Validation:** Zod Schema Validation

---

## 🌟 ฟีเจอร์หลัก (Key Features)

1. **📊 หน้าแดชบอร์ด (Dashboard)**
   - สรุปตัวเลขสำคัญ: สินค้าทั้งหมด, ยอดสต๊อกคงเหลือรวม, สินค้าใกล้หมดสต๊อก, สินค้าหมดสต๊อก
   - คำนวณมูลค่ารวม: มูลค่าสต๊อกสินค้าคงคลัง (ราคาทุน) และมูลค่าขายปลีก (ราคาขาย)
   - กราฟแท่งแสดงแนวโน้มการเคลื่อนไหวสต๊อก (รับเข้า / เบิกออก / ปรับยอด) ย้อนหลัง 7, 30 และ 90 วัน
   - การแจ้งเตือนสินค้าใกล้หมดสต๊อก และฟีดรายการเคลื่อนไหวสต๊อกล่าสุดแบบ Real-time

2. **📦 จัดการสินค้า (Product Management)**
   - ค้นหาสินค้าตามชื่อ และรหัส SKU
   - กรองตามหมวดหมู่ และสถานะสต๊อก (ปกติ / ใกล้หมด / หมด)
   - เพิ่ม แก้ไข และลบสินค้า (เฉพาะ ADMIN)
   - ปุ่มทำรายการสต๊อกด่วนในตาราง:
     - 📥 **รับเข้า (Stock In):** รับสินค้าเพิ่มเข้าคลัง
     - 📤 **เบิกออก (Stock Out):** เบิกจ่ายสินค้าออกจากคลัง
     - ⚙️ **ปรับยอด (Stock Adjust):** ปรับยอดสินค้าให้ตรงกับการตรวจนับจริง
   - ดูรายละเอียดสเปกสินค้าและประวัติการเคลื่อนไหวเฉพาะสินค้านั้นๆ (Timeline History)
   - ป้ายกำกับแจ้งเตือนสถานะคงเหลือเทียบกับจุดสั่งซื้อขั้นต่ำ (Minimum Stock Alert)

3. **🏷️ จัดการหมวดหมู่ (Category Management)**
   - จัดหมวดหมู่สินค้า เช่น อาหาร, เครื่องดื่ม, เครื่องเขียน, อุปกรณ์สำนักงาน
   - แสดงจำนวนสินค้าที่ผูกอยู่ในแต่ละหมวดหมู่
   - เพิ่ม แก้ไข และลบหมวดหมู่ พร้อมระบบเตือนความปลอดภัยหากมีสินค้าอยู่ในหมวดหมู่นั้น

4. **📜 ประวัติการเคลื่อนไหวสต๊อก (Stock Movement History)**
   - บันทึกทุกความเคลื่อนไหว: วัน-เวลา, สินค้า, จำนวน, ยอดสต๊อกก่อนหน้าและยอดใหม่, เหตุผล/หมายเหตุ และชื่อผู้ทำรายการ
   - กรองตามประเภทรายการ (รับเข้า / เบิกออก / ปรับยอด)
   - กรองตามสินค้าเฉพาะรายการ และกรองตามช่วงวันที่ (Date Range)
   - ป้ายระบุสีและสัญลักษณ์ชัดเจน

5. **👥 จัดการผู้ใช้งาน (User & Role Management - เฉพาะ ADMIN)**
   - แบ่งระดับสิทธิ์การใช้งาน 2 ระดับ:
     - **ADMIN:** สิทธิ์เต็มรูปแบบ เพิ่ม/แก้ไข/ลบสินค้า หมวดหมู่ ปรับยอดสต๊อก และจัดการผู้ใช้
     - **STAFF:** สิทธิ์ทำรายการรับเข้าและเบิกจ่ายสินค้า ดูข้อมูลสต๊อกและประวัติ
   - จัดการเปิด/ระงับการใช้งานบัญชี (ACTIVE / DISABLED)
   - ระบบป้องกันไม่ให้ลบบัญชีตนเอง

---

## 🚀 เริ่มต้นใช้งานด่วนด้วย Docker (Quick Start)

รันคำสั่งเดียว ระบบจะเริ่มการทำงานของ PostgreSQL, Backend API และ Frontend พร้อม Seed ข้อมูลทดสอบให้อัตโนมัติ:

```bash
docker compose up --build
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:4000](http://localhost:4000)
- **API Health Check:** [http://localhost:4000/health](http://localhost:4000/health)

---

## 🔑 บัญชีผู้ใช้สำหรับทดสอบ (Default Accounts)

ระบบมาพร้อมข้อมูลตัวอย่างและบัญชีผู้ใช้เริ่มต้น:

| Role | อีเมล (Email) | รหัสผ่าน (Password) | สิทธิ์การเข้าถึง |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@example.com` | `Admin123!` | สิทธิ์เต็มทุกหน้าและฟังก์ชัน |
| **STAFF** | `staff@example.com` | `Staff123!` | รับเข้า/เบิกจ่ายสินค้า, ดูสต๊อกและรายงาน |

---

## 💻 การติดตั้งและรันแบบ Local (Manual Setup)

### 1. ฐานข้อมูล PostgreSQL
สร้างฐานข้อมูลชื่อ `inventory` บน PostgreSQL (Port 5432)

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```
Backend API จะทำงานที่พอร์ต `http://localhost:4000`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend Web Application จะทำงานที่พอร์ต `http://localhost:3000`

---

## 📡 API Endpoints Overview

| Method | Endpoint | Description | Role Required |
|:---|:---|:---|:---|
| `POST` | `/api/auth/login` | เข้าสู่ระบบ (รับ JWT Token) | Public |
| `GET` | `/api/auth/me` | ดึงข้อมูลผู้ใช้ปัจจุบัน | Auth |
| `GET` | `/api/products` | ดึงรายการสินค้า (ค้นหา, กรอง, แบ่งหน้า) | Auth |
| `POST` | `/api/products` | เพิ่มสินค้าใหม่ | ADMIN |
| `PUT` | `/api/products/:id` | แก้ไขข้อมูลสินค้า | ADMIN |
| `DELETE` | `/api/products/:id` | ลบสินค้า | ADMIN |
| `POST` | `/api/stock/in` | รับสินค้าเข้าสต๊อก | Auth |
| `POST` | `/api/stock/out` | เบิกสินค้าออกจากสต๊อก | Auth |
| `POST` | `/api/stock/adjust` | ปรับยอดสินค้า | ADMIN |
| `GET` | `/api/stock/movements` | ดึงประวัติการเคลื่อนไหวสต๊อก | Auth |
| `GET` | `/api/categories` | ดึงรายการหมวดหมู่ | Auth |
| `POST` | `/api/categories` | เพิ่มหมวดหมู่ | ADMIN |
| `PUT` | `/api/categories/:id` | แก้ไขหมวดหมู่ | ADMIN |
| `DELETE` | `/api/categories/:id` | ลบหมวดหมู่ | ADMIN |
| `GET` | `/api/users` | ดึงรายการผู้ใช้ | ADMIN |
| `POST` | `/api/users` | เพิ่มผู้ใช้ใหม่ | ADMIN |
| `PUT` | `/api/users/:id` | แก้ไขสถานะและสิทธิ์ผู้ใช้ | ADMIN |
| `DELETE` | `/api/users/:id` | ลบผู้ใช้ | ADMIN |
| `GET` | `/api/dashboard/stats` | สรุปสถิติแดชบอร์ด | Auth |
| `GET` | `/api/dashboard/chart` | ข้อมูลกราฟการเคลื่อนไหวสต๊อก | Auth |

---

## 📁 โครงสร้างโปรเจกต์ (Project Structure)

```
stock/
├── docker-compose.yml       # จัดการ multi-container (DB, Backend, Frontend)
├── README.md                # คู่มือและเอกสารการใช้งานระบบ
├── backend/
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma    # โมเดล User, Product, Category, StockMovement
│   │   └── seed.ts          # ข้อมูลตั้งต้นสำหรับทดสอบ
│   └── src/
│       ├── config/          # การตั้งค่า Environment & JWT
│       ├── controllers/     # Controller แยกตามโมดูล
│       ├── middleware/      # Auth (JWT), Role guard, Validation, RateLimit
│       ├── routes/          # Express API route mapping
│       ├── services/        # Business logic & Prisma queries
│       └── server.ts        # Express entry point
└── frontend/
    ├── Dockerfile
    ├── app/
    │   ├── (app)/           # Protected Route Layout พร้อม Sidebar
    │   │   ├── dashboard/   # หน้าแดชบอร์ดสรุปผล & กราฟ
    │   │   ├── products/    # หน้าจัดการสินค้า & สต๊อก
    │   │   ├── categories/  # หน้าจัดการหมวดหมู่
    │   │   ├── stock-history/# หน้าประวัติการเคลื่อนไหวสต๊อก
    │   │   └── users/       # หน้าจัดการผู้ใช้ (Admin only)
    │   ├── login/           # หน้าเข้าสู่ระบบ
    │   └── globals.css      # Custom UI theme & CSS tokens
    ├── components/ui/       # shadcn/ui components
    ├── lib/                 # Auth context, Axios API client
    └── types/               # TypeScript interfaces
```
"# stocksausage" 
