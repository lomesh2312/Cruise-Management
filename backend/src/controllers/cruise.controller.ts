import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import prisma from '../utils/prisma';
import { asyncHandler, AppError } from '../utils/errors';

export const getAllCruiseTrips = asyncHandler(async (req: Request, res: Response) => {
    const { isArchived } = req.query;

    const where: Prisma.CruiseWhereInput = {};
    if (isArchived !== undefined) {
        where.isArchived = isArchived === 'true';
    }

    const cruises = await prisma.cruise.findMany({
        where,
        include: {
            revenue: true,
            staff: true,
            activities: { include: { activity: true } }
        },
        orderBy: { startDate: 'desc' }
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
                create: (activities || []).map((act: { activityId: string; day: number }) => ({
                    activityId: act.activityId,
                    day: act.day
                }))
            }
        }
    });

    res.json(cruise);
});


interface TripFinancialInput {
    startDate: string | Date;
    endDate: string | Date;
    passengersDeluxe: number;
    passengersPremiumGold: number;
    passengersPremiumSilver: number;
    passengersNormal: number;
    roomsBookedDeluxe: number;
    roomsBookedPremiumGold: number;
    roomsBookedPremiumSilver: number;
    roomsBookedNormal: number;
    selectedStaffIds: string[];
    selectedActivityIds: string[];
}

const calculateTripFinancials = async (data: TripFinancialInput) => {
    const {
        roomsBookedDeluxe, roomsBookedPremiumGold, roomsBookedPremiumSilver, roomsBookedNormal,
        selectedStaffIds, selectedActivityIds
    } = data;


    const categories = await prisma.roomCategory.findMany();
    const categoryMap = categories.reduce((acc, cat) => {
        acc[cat.name] = cat.price;
        return acc;
    }, {} as Record<string, number>);

    const priceDeluxe = categoryMap['Deluxe'] || 35000;
    const pricePremiumGold = categoryMap['Premium Gold'] || 30000;
    const pricePremiumSilver = categoryMap['Premium Silver'] || 27000;
    const priceNormal = categoryMap['Normal'] || 23000;

    const revenueDeluxe = Number(roomsBookedDeluxe) * priceDeluxe;
    const revenuePremiumSilver = Number(roomsBookedPremiumSilver) * pricePremiumSilver;
    const revenuePremiumGold = Number(roomsBookedPremiumGold) * pricePremiumGold;
    const revenueNormal = Number(roomsBookedNormal) * priceNormal;

    const totalTicketRevenue = revenueDeluxe + revenuePremiumSilver + revenuePremiumGold + revenueNormal;

    const staffMembers = await prisma.staff.findMany({
        where: { id: { in: selectedStaffIds || [] } }
    });

    const cleaningStaffCost = staffMembers
        .filter(s => s.role === 'CLEANING')
        .reduce((acc, s) => acc + s.salary, 0);

    const foodStaffCost = staffMembers
        .filter(s => s.role === 'FOOD')
        .reduce((acc, s) => acc + s.salary, 0);

    const eventStaffCost = staffMembers
        .filter(s => s.role === 'EVENT')
        .reduce((acc, s) => acc + s.salary, 0);

    const activities = await prisma.activity.findMany({
        where: { id: { in: selectedActivityIds || [] } }
    });

    const externalActivityCost = activities.reduce((acc, act) => acc + act.cost, 0);
    const totalExpenses = (cleaningStaffCost + foodStaffCost + eventStaffCost) + externalActivityCost;

    return {
        totalTicketRevenue,
        cleaningStaffCost,
        foodStaffCost,
        eventStaffCost,
        externalActivityCost,
        totalExpenses,
        cleaningStaffCount: staffMembers.filter(s => s.role === 'CLEANING').length,
        foodStaffCount: staffMembers.filter(s => s.role === 'FOOD').length,
        eventStaffCount: staffMembers.filter(s => s.role === 'EVENT').length
    };
};

const safeNumber = (val: unknown) => Number(val) || 0;

export const createCruiseHistory = asyncHandler(async (req: Request, res: Response) => {
    const {
        name, startDate, endDate, boardingLocation, destination, totalPassengers,
        passengersDeluxe, passengersPremiumGold, passengersPremiumSilver, passengersNormal,
        roomsBookedDeluxe, roomsBookedPremiumGold, roomsBookedPremiumSilver, roomsBookedNormal,
        selectedStaffIds, selectedActivityIds
    } = req.body;
    const sumPassengers =
        safeNumber(passengersDeluxe) +
        safeNumber(passengersPremiumGold) +
        safeNumber(passengersPremiumSilver) +
        safeNumber(passengersNormal);

    if (sumPassengers !== safeNumber(totalPassengers)) {
        throw new AppError(`Passenger mismatch! Total: ${totalPassengers}, Breakdown Sum: ${sumPassengers}`, 400);
    }
    const roomCategories = await prisma.roomCategory.findMany({
        include: { rooms: { where: { status: 'AVAILABLE' } } }
    });

    const availabilityMap = roomCategories.reduce((acc, cat) => {
        acc[cat.name] = cat.rooms.length;
        return acc;
    }, {} as Record<string, number>);

    const checkCapacity = (name: string, requested: number) => {
        const available = availabilityMap[name] || 0;
        if (requested > available) {
            throw new AppError(`Capacity exceeded for ${name} category. Available: ${available}, Requested: ${requested}`, 400);
        }
    };

    checkCapacity('Deluxe', safeNumber(roomsBookedDeluxe));
    checkCapacity('Premium Gold', safeNumber(roomsBookedPremiumGold));
    checkCapacity('Premium Silver', safeNumber(roomsBookedPremiumSilver));
    checkCapacity('Normal', safeNumber(roomsBookedNormal));

    const financials = await calculateTripFinancials(req.body);

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new AppError('Invalid date provided. Start and end dates are required and must be valid.', 400);
    }
    const cruiseData: Prisma.CruiseCreateInput = {
        name,
        startDate: start,
        endDate: end,
        boardingLocation,
        destination,
        maxCapacity: safeNumber(totalPassengers),
        registered: safeNumber(totalPassengers),
        totalPassengers: safeNumber(totalPassengers),
        status: end < new Date() ? 'COMPLETED' : start > new Date() ? 'UPCOMING' : 'ONGOING',
        isArchived: false,
        passengersDeluxe: safeNumber(passengersDeluxe),
        passengersPremiumGold: safeNumber(passengersPremiumGold),
        passengersPremiumSilver: safeNumber(passengersPremiumSilver),
        passengersNormal: safeNumber(passengersNormal),
        roomsBookedDeluxe: safeNumber(roomsBookedDeluxe),
        roomsBookedPremiumGold: safeNumber(roomsBookedPremiumGold),
        roomsBookedPremiumSilver: safeNumber(roomsBookedPremiumSilver),
        roomsBookedNormal: safeNumber(roomsBookedNormal),
        cleaningStaffCount: financials.cleaningStaffCount,
        foodStaffCount: financials.foodStaffCount,
        eventStaffCount: financials.eventStaffCount,
        revenue: {
            create: {
                totalRevenue: financials.totalTicketRevenue,
                foodRevenue: 0,
                extraRevenue: 0,
                cleaningStaffCost: financials.cleaningStaffCost,
                foodStaffCost: financials.foodStaffCost,
                // @ts-expect-error: Missing in generated type
                eventStaffCost: financials.eventStaffCost,
                externalActivityCost: financials.externalActivityCost,
                totalExpenses: financials.totalExpenses
            }
        },
        staff: {
            connect: (selectedStaffIds || []).map((id: string) => ({ id }))
        },
        activities: {
            create: (selectedActivityIds || []).map((id: string) => ({
                activityId: id,
                day: 1
            }))
        }
    };

    const cruise = await prisma.cruise.create({ data: cruiseData });
    res.json(cruise);
});

export const updateCruiseHistory = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        name, startDate, endDate, boardingLocation, destination, totalPassengers,
        passengersDeluxe, passengersPremiumGold, passengersPremiumSilver, passengersNormal,
        roomsBookedDeluxe, roomsBookedPremiumGold, roomsBookedPremiumSilver, roomsBookedNormal,
        selectedStaffIds, selectedActivityIds
    } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);

    const financials = await calculateTripFinancials(req.body);

    try {
        const updatedCruise = await prisma.$transaction(async (tx) => {
            const cruise = await tx.cruise.update({
                where: { id: id as string },
                data: {
                    name,
                    startDate: start,
                    endDate: end,
                    boardingLocation,
                    destination,
                    maxCapacity: safeNumber(totalPassengers),
                    registered: safeNumber(totalPassengers),
                    totalPassengers: safeNumber(totalPassengers),
                    status: end < new Date() ? 'COMPLETED' : start > new Date() ? 'UPCOMING' : 'ONGOING',
                    passengersDeluxe: safeNumber(passengersDeluxe),
                    passengersPremiumGold: safeNumber(passengersPremiumGold),
                    passengersPremiumSilver: safeNumber(passengersPremiumSilver),
                    passengersNormal: safeNumber(passengersNormal),
                    roomsBookedDeluxe: safeNumber(roomsBookedDeluxe),
                    roomsBookedPremiumGold: safeNumber(roomsBookedPremiumGold),
                    roomsBookedPremiumSilver: safeNumber(roomsBookedPremiumSilver),
                    roomsBookedNormal: safeNumber(roomsBookedNormal),
                    cleaningStaffCount: financials.cleaningStaffCount,
                    foodStaffCount: financials.foodStaffCount,
                    // @ts-expect-error: Missing in generated type
                    eventStaffCount: financials.eventStaffCount,
                    staff: {
                        set: [],
                        connect: (selectedStaffIds || []).map((sid: string) => ({ id: sid }))
                    }
                }
            });
            await tx.tripRevenue.update({
                where: { cruiseId: id as string },
                data: {
                    totalRevenue: financials.totalTicketRevenue,
                    cleaningStaffCost: financials.cleaningStaffCost,
                    foodStaffCost: financials.foodStaffCost,
                    // @ts-expect-error: Missing in generated type
                    eventStaffCost: financials.eventStaffCost,
                    externalActivityCost: financials.externalActivityCost,
                    totalExpenses: financials.totalExpenses
                }
            });
            await tx.activityAssignment.deleteMany({ where: { cruiseId: id as string } });
            await tx.activityAssignment.createMany({
                data: selectedActivityIds.map((aid: string) => ({
                    cruiseId: id as string,
                    activityId: aid,
                    day: 1
                }))
            });


            return cruise;
        }, {
            maxWait: 5000,
            timeout: 10000
        });

        res.json(updatedCruise);
    } catch (error: unknown) {
        console.error('Error in updateCruiseHistory:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new AppError(`Update failed: ${errorMessage}`, 500);
    }
});

export const archiveCruise = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const cruise = await prisma.cruise.findUnique({ where: { id } });

    if (!cruise) throw new AppError('Cruise not found', 404);

    const updated = await prisma.cruise.update({
        where: { id },
        data: { isArchived: true, status: 'COMPLETED' }
    });

    res.json(updated);
});

export const deleteCruise = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };

    const cruise = await prisma.cruise.findUnique({ where: { id } });
    if (!cruise) throw new AppError('Cruise not found', 404);

    await prisma.$transaction(async (tx) => {
        await tx.tripRevenue.deleteMany({
            where: { cruiseId: id }
        });

        await tx.roomBooking.deleteMany({
            where: { cruiseId: id }
        });

        await tx.activityAssignment.deleteMany({
            where: { cruiseId: id }
        });

        await tx.room.updateMany({
            where: { cruiseId: id },
            data: { cruiseId: null }
        });

        await tx.cruise.delete({
            where: { id }
        });
    });

    res.json({ message: 'Cruise deleted successfully' });
});
