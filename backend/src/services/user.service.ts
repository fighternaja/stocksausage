import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';

export class UserService {
  async list() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { stockMovements: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return users;
  }

  async create(name: string, email: string, password: string, role: 'ADMIN' | 'STAFF') {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw { status: 409, message: 'อีเมลนี้ถูกใช้งานแล้ว', error: 'EMAIL_EXISTS' };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });

    return user;
  }

  async update(id: string, data: { name?: string; email?: string; role?: 'ADMIN' | 'STAFF'; status?: 'ACTIVE' | 'DISABLED' }) {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw { status: 404, message: 'ไม่พบผู้ใช้', error: 'USER_NOT_FOUND' };
    }

    if (data.email && data.email !== user.email) {
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) {
        throw { status: 409, message: 'อีเมลนี้ถูกใช้งานแล้ว', error: 'EMAIL_EXISTS' };
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true, updatedAt: true },
    });

    return updated;
  }

  async delete(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw { status: 400, message: 'ไม่สามารถลบบัญชีตัวเองได้', error: 'CANNOT_DELETE_SELF' };
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: { _count: { select: { stockMovements: true } } },
    });
    if (!user) {
      throw { status: 404, message: 'ไม่พบผู้ใช้', error: 'USER_NOT_FOUND' };
    }

    if (user._count.stockMovements > 0) {
      throw {
        status: 400,
        message: 'ไม่สามารถลบผู้ใช้นี้ได้ เนื่องจากมีประวัติทำรายการสต๊อกในระบบ (แนะนำให้เปลี่ยนสถานะเป็นระงับการใช้งานแทน)',
        error: 'USER_HAS_MOVEMENTS',
      };
    }

    await prisma.user.delete({ where: { id } });
    return { id };
  }
}

export const userService = new UserService();
