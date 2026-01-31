import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler, AppError } from '../utils/errors';

export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const tripsThisMonth = await prisma.cruise.count({
        where: { startDate: { gte: firstDayThisMonth } }
    });

    const tripsLastMonth = await prisma.cruise.count({
        where: {
            startDate: {
                gte: firstDayLastMonth,
                lte: lastDayLastMonth
            }
        }
    });

    const totalRevenueData = await prisma.tripRevenue.aggregate({
        _sum: { totalRevenue: true }
    });

    const activeCruises = await prisma.cruise.count({
        where: { status: 'ACTIVE' }
    });

    res.json({
        tripsThisMonth,
        tripsLastMonth,
        totalRevenue: totalRevenueData._sum.totalRevenue || 0,
        activeCruises
    });
});

export const getMonthlyRevenue = asyncHandler(async (req: Request, res: Response) => {
    // Simple mock for now as we don't have deep historical data management yet
    // In a real app, we'd group by month in SQL
    res.json([
        { month: 'Oct', trips: 4, revenue: 300000 },
        { month: 'Nov', trips: 6, revenue: 500000 },
        { month: 'Dec', trips: 8, revenue: 800000 },
        { month: 'Jan', trips: 10, revenue: 1000000 },
        { month: 'Feb', trips: 14, revenue: 1230800 },
    ]);
});
