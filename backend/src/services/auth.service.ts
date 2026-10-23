import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { config } from '../config';
import { JwtPayload } from '../types';

export class AuthService {
  async register(name: string, email: string, password: string, role: 'ADMIN' | 'STAFF' = 'STAFF') {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw { status: 409, message: 'อีเมลนี้ถูกใช้งานแล้ว', error: 'EMAIL_EXISTS' };
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });

    return user;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw { status: 401, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', error: 'INVALID_CREDENTIALS' };
    }

    if (user.status === 'DISABLED') {
      throw { status: 403, message: 'บัญชีนี้ถูกระงับการใช้งาน', error: 'ACCOUNT_DISABLED' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw { status: 401, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง', error: 'INVALID_CREDENTIALS' };
    }

    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
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

  async me(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, status: true, createdAt: true },
    });

    if (!user) {
      throw { status: 404, message: 'ไม่พบผู้ใช้', error: 'USER_NOT_FOUND' };
    }

    return user;
  }
}

export const authService = new AuthService();
