import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/errors';

export const getAllStaff = asyncHandler(async (req: Request, res: Response) => {
    const staff = await prisma.staff.findMany({
        include: { cruises: true }
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
    const { id } = req.params as { id: string };
    await prisma.staff.delete({ where: { id } });
    res.json({ message: 'Staff removed' });
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const staff = await prisma.staff.update({
        where: { id },
        data: req.body
    });
    res.json(staff);
});
