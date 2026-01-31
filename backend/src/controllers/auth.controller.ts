import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { asyncHandler, AppError } from '../utils/errors';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_cruise_key_123';

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new AppError('Email and password are required', 400);
    }

    const admin = await prisma.admin.findUnique({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        throw new AppError('Invalid email or password', 401);
    }

    const token = jwt.sign({ adminId: admin.id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
        message: 'Login successful',
        token,
        admin: { id: admin.id, email: admin.email }
    });
});

export const getMe = asyncHandler(async (req: any, res: Response) => {
    const admin = await prisma.admin.findUnique({
        where: { id: req.adminId },
        select: { id: true, email: true }
    });

    if (!admin) {
        throw new AppError('Admin not found', 404);
    }

    res.json(admin);
});
