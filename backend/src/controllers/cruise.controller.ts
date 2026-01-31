import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler, AppError } from '../utils/errors';

export const getAllCruiseTrips = asyncHandler(async (req: Request, res: Response) => {
    const cruises = await prisma.cruise.findMany({
        include: { revenue: true }
    });
    res.json(cruises);
});

export const getCruiseDetails = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const cruise = await prisma.cruise.findUnique({
        where: { id },
        include: {
            rooms: true,
            staff: true,
            activities: { include: { activity: true } },
            revenue: true,
            bookings: { include: { room: true } }
        }
    });

    if (!cruise) throw new AppError('Cruise not found', 404);
    res.json(cruise);
});

export const createCruise = asyncHandler(async (req: Request, res: Response) => {
    const { rooms, staff, activities, ...cruiseData } = req.body;

    const cruise = await prisma.cruise.create({
        data: {
            ...cruiseData,
            startDate: new Date(cruiseData.startDate),
            endDate: new Date(cruiseData.endDate),
            rooms: { connect: (rooms || []).map((id: string) => ({ id })) },
            staff: { connect: (staff || []).map((id: string) => ({ id })) },
            activities: {
                create: (activities || []).map((act: any) => ({
                    activityId: act.activityId,
                    day: act.day
                }))
            }
        }
    });

    res.json(cruise);
});
