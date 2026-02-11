import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/errors';

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


export const getAllCategories = asyncHandler(async (req: Request, res: Response) => {
    const categories = await prisma.roomCategory.findMany({
        include: {
            rooms: {
                orderBy: { number: 'asc' }
            }
        },
        orderBy: { price: 'desc' }
    });
    res.json(categories);
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const { images, features, price, capacity } = req.body;

    const category = await prisma.roomCategory.update({
        where: { id },
        data: {
            images,
            features,
            price: price !== undefined ? Number(price) : undefined,
            capacity: capacity !== undefined ? Number(capacity) : undefined
        },
        include: {
            rooms: {
                orderBy: { number: 'asc' }
            }
        }
    });

    res.json(category);
});

export const createRoom = asyncHandler(async (req: Request, res: Response) => {
    const { categoryId, number, status, description, price, capacity } = req.body;

    let finalPrice = price;
    let finalCapacity = capacity;
    let finalType = '';

    if (categoryId) {
        const category = await prisma.roomCategory.findUnique({
            where: { id: categoryId }
        });
        if (category) {
            finalPrice = price || category.price;
            finalCapacity = capacity || category.capacity;
            finalType = category.name;
        }
    }

    const room = await prisma.room.create({
        data: {
            number,
            status: status || 'AVAILABLE',
            description,
            price: Number(finalPrice || 0),
            capacity: Number(finalCapacity || 0),
            categoryId,
            type: finalType
        }
    });

    res.json(room);
});

export const deleteRoom = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };


    const bookings = await prisma.roomBooking.findMany({
        where: { roomId: id }
    });

    if (bookings.length > 0) {
        
        
        
        
        
        
        await prisma.roomBooking.deleteMany({ where: { roomId: id } });
    }

    await prisma.room.delete({ where: { id } });
    res.json({ message: 'Room deleted' });
});
