import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/errors';

export const getAllActivities = asyncHandler(async (req: Request, res: Response) => {
    const activities = await prisma.activity.findMany();
    res.json(activities);
});

export const createActivity = asyncHandler(async (req: Request, res: Response) => {
    const activity = await prisma.activity.create({
        data: req.body
    });
    res.json(activity);
});

export const updateActivity = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const activity = await prisma.activity.update({
        where: { id },
        data: req.body
    });
    res.json(activity);
});

export const deleteActivity = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    await prisma.activity.delete({ where: { id } });
    res.json({ message: 'Activity deleted' });
});
