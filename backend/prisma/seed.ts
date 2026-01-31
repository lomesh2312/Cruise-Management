import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import process from 'node:process';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    await prisma.admin.upsert({
        where: { email: 'admin@cruise.com' },
        update: {},
        create: {
            email: 'admin@cruise.com',
            password: hashedPassword,
        },
    });

    console.log('Admin seeded: admin@cruise.com / admin123');

    // Seed some rooms
    await prisma.room.createMany({
        data: [
            { type: 'Deluxe', price: 500, capacity: 2, status: 'AVAILABLE' },
            { type: 'Normal', price: 200, capacity: 4, status: 'AVAILABLE' },
            { type: 'Deluxe', price: 500, capacity: 2, status: 'MAINTENANCE', description: 'AC repair' },
        ]
    });

    // Seed some activities
    await prisma.activity.createMany({
        data: [
            { name: 'Magic Show', description: 'Grand magic performance', managerName: 'Houdini', managerContact: '1234567890', cost: 1000 },
            { name: 'Dance Night', description: 'Salsa and party', managerName: 'Shakira', managerContact: '0987654321', cost: 1500 },
        ]
    });

    // Seed some staff
    await prisma.staff.createMany({
        data: [
            { name: 'John Doe', role: 'CLEANING', salary: 2000 },
            { name: 'Jane Smith', role: 'FOOD', salary: 2500 },
        ]
    });

    console.log('Initial data seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
