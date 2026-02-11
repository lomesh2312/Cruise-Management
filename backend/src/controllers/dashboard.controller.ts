import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../utils/errors';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const now = new Date();

    const totalActivities = await prisma.activity.count();
    const foodStaffCount = await prisma.staff.count({ where: { role: 'FOOD' } });
    const cleaningStaffCount = await prisma.staff.count({ where: { role: 'CLEANING' } });
    const eventStaffCount = await prisma.staff.count({ where: { role: 'EVENT' } });

    const tripsCompleted = await prisma.cruise.count({ where: { status: 'COMPLETED' } });
    const upcomingTrips = await prisma.cruise.count({ where: { startDate: { gt: now } } });
    const activeCruises = await prisma.cruise.count({ where: { status: 'ACTIVE' } });

    const allRevenue = await prisma.tripRevenue.findMany({
        include: { cruise: true }
    });

    let totalProfit = 0;
    let totalLoss = 0;
    const lossMakingTrips: { id: string; name: string; loss: number }[] = [];

    allRevenue.forEach(rev => {
        const profit = rev.totalRevenue - rev.totalExpenses;
        if (profit >= 0) {
            totalProfit += profit;
        } else {
            totalLoss += Math.abs(profit);
            lossMakingTrips.push({
                id: rev.cruiseId,
                name: rev.cruise.name,
                loss: Math.abs(profit)
            });
        }
    });

    const maintenanceRooms = await prisma.room.findMany({
        where: { status: 'MAINTENANCE' },
        select: { id: true, number: true, description: true }
    });

    const monthlyStats: { month: string; trips: number }[] = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = d.toLocaleString('default', { month: 'short' });
        const start = new Date(d.getFullYear(), d.getMonth(), 1);
        const end = new Date(d.getFullYear(), d.getMonth() + 1, 0);

        const count = await prisma.cruise.count({
            where: { startDate: { gte: start, lte: end } }
        });

        monthlyStats.push({ month: monthName, trips: count });
    }

    const revenuePerTrip = allRevenue.map(rev => ({
        name: rev.cruise.name,
        revenue: rev.totalRevenue,
        profit: rev.totalRevenue - rev.totalExpenses
    }));

    res.json({
        totalActivities,
        foodStaffCount,
        cleaningStaffCount,
        eventStaffCount,
        tripsCompleted,
        upcomingTrips,
        activeCruises,
        totalProfit,
        totalLoss,
        alerts: {
            maintenanceRooms,
            lossMakingTrips
        },
        tripsPerMonth: monthlyStats,
        revenuePerTrip
    });
});

export const getMonthlyRevenue = asyncHandler(async (req: Request, res: Response) => {
    const now = new Date();
    const data = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        data.push({ month: d.toLocaleString('default', { month: 'short' }), revenue: Math.floor(Math.random() * 500000) + 100000 });
    }
    res.json(data);
});
