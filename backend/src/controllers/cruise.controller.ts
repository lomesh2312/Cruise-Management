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

export const createCruiseHistory = asyncHandler(async (req: Request, res: Response) => {
    const {
        name, startDate, endDate, totalPassengers,
        passengersDeluxe, passengersPremiumGold, passengersPremiumSilver, passengersNormal,
        roomsBookedDeluxe, roomsBookedPremiumGold, roomsBookedPremiumSilver, roomsBookedNormal,
        cleaningStaffCost, foodStaffCost, externalActivityCost
    } = req.body;

    // 1. Validation: Passenger Count
    const sumPassengers =
        Number(passengersDeluxe) +
        Number(passengersPremiumGold) +
        Number(passengersPremiumSilver) +
        Number(passengersNormal);

    if (sumPassengers !== Number(totalPassengers)) {
        throw new AppError(`Passenger mismatch! Total: ${totalPassengers}, Breakdown Sum: ${sumPassengers}`, 400);
    }

    // 2. Revenue Calculation (Per Room Rates)
    // Deluxe: 35k, Premium Silver: 27k, Premium Gold: 30k, Normal: 23k
    const revenueDeluxe = Number(roomsBookedDeluxe) * 35000;
    const revenuePremiumSilver = Number(roomsBookedPremiumSilver) * 27000;
    const revenuePremiumGold = Number(roomsBookedPremiumGold) * 30000;
    const revenueNormal = Number(roomsBookedNormal) * 23000;

    // We can assume user might enter other revenues, but requirement implies calculating it from rooms.
    // "add revenue according to it"

    const totalTicketRevenue = revenueDeluxe + revenuePremiumSilver + revenuePremiumGold + revenueNormal;

    // 3. Expense Calculation
    const expenses = Number(cleaningStaffCost) + Number(foodStaffCost) + Number(externalActivityCost);

    const cruise = await prisma.cruise.create({
        data: {
            name,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            maxCapacity: Number(totalPassengers), // Historical data assumes capability met
            registered: Number(totalPassengers),
            status: 'COMPLETED',
            passengersDeluxe: Number(passengersDeluxe),
            passengersPremiumGold: Number(passengersPremiumGold),
            passengersPremiumSilver: Number(passengersPremiumSilver),
            passengersNormal: Number(passengersNormal),
            revenue: {
                create: {
                    totalRevenue: totalTicketRevenue,
                    foodRevenue: 0, // Placeholder
                    extraRevenue: 0, // Placeholder
                    cleaningStaffCost: Number(cleaningStaffCost),
                    foodStaffCost: Number(foodStaffCost),
                    externalActivityCost: Number(externalActivityCost),
                    totalExpenses: expenses
                }
            }
        }
    });

    res.json(cruise);
});
