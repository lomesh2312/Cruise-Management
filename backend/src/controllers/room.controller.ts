import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler, AppError } from '../utils/errors';

export const getAllRooms = asyncHandler(async (req: Request, res: Response) => {
    const rooms = await prisma.room.findMany();
    res.json(rooms);
});

export const updateRoom = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const data = req.body;
    const room = await prisma.room.update({
        where: { id },
        data
    });
    res.json(room);
});

export const createRoom = asyncHandler(async (req: Request, res: Response) => {
    const room = await prisma.room.create({
        data: req.body
    });
    res.json(room);
});
