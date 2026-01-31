import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/errors';

export const getAllStaff = asyncHandler(async (req: Request, res: Response) => {
    const staff = await prisma.staff.findMany({
        include: { cruise: true }
    });
    res.json(staff);
});

export const createStaff = asyncHandler(async (req: Request, res: Response) => {
    const staff = await prisma.staff.create({
        data: req.body
    });
    res.json(staff);
});

export const removeStaff = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.staff.delete({ where: { id } });
    res.json({ message: 'Staff removed' });
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const staff = await prisma.staff.update({
        where: { id },
        data: req.body
    });
    res.json(staff);
});
