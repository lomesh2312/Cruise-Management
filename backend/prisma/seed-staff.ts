import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding staff data...');

    // Delete existing staff
    await prisma.staff.deleteMany({});

    // Food Staff
    const foodStaff = [
        { name: 'Rahul Verma', role: 'FOOD', designation: 'Head Chef', salary: 180000 },
        { name: 'Maria Lopez', role: 'FOOD', designation: 'Sous Chef', salary: 120000 },
        { name: 'Arjun Patel', role: 'FOOD', designation: 'Pastry Chef', salary: 95000 },
        { name: 'Emily Watson', role: 'FOOD', designation: 'Restaurant Manager', salary: 140000 },
        { name: 'Sunil Kumar', role: 'FOOD', designation: 'Senior Cook', salary: 85000 },
        { name: 'Ayesha Khan', role: 'FOOD', designation: 'Beverage Supervisor', salary: 75000 },
        { name: 'Rohan Mehta', role: 'FOOD', designation: 'Steward', salary: 45000 },
        { name: 'John Miller', role: 'FOOD', designation: 'Bartender', salary: 65000 },
    ];

    // Cleaning Staff
    const cleaningStaff = [
        { name: 'Suresh Yadav', role: 'CLEANING', designation: 'Housekeeping Manager', salary: 110000 },
        { name: 'Anita Sharma', role: 'CLEANING', designation: 'Floor Supervisor', salary: 70000 },
        { name: 'Vikram Singh', role: 'CLEANING', designation: 'Senior Cleaner', salary: 55000 },
        { name: 'Neha Verma', role: 'CLEANING', designation: 'Cabin Cleaning Supervisor', salary: 80000 },
        { name: 'Deepak Kumar', role: 'CLEANING', designation: 'Laundry Manager', salary: 90000 },
        { name: 'Pooja Patel', role: 'CLEANING', designation: 'Laundry Assistant', salary: 48000 },
        { name: 'Ramesh Lal', role: 'CLEANING', designation: 'General Cleaner', salary: 35000 },
        { name: 'Manpreet Kaur', role: 'CLEANING', designation: 'Night Shift Cleaner', salary: 40000 },
    ];

    // Create all staff
    for (const staff of [...foodStaff, ...cleaningStaff]) {
        await prisma.staff.create({ data: staff });
    }

    console.log('✅ Seeded 16 staff members (8 Food, 8 Cleaning)');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
