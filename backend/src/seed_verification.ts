
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    
    const categories = [
        { name: 'Deluxe', price: 200, capacity: 2 },
        { name: 'Premium Gold', price: 350, capacity: 3 },
        { name: 'Premium Silver', price: 300, capacity: 3 },
        { name: 'Normal', price: 100, capacity: 2 },
    ];

    for (const cat of categories) {
        await prisma.roomCategory.upsert({
            where: { name: cat.name },
            update: {},
            create: cat,
        });
    }

    
    
    const deluxe = await prisma.roomCategory.findUnique({ where: { name: 'Deluxe' } });
    const gold = await prisma.roomCategory.findUnique({ where: { name: 'Premium Gold' } });
    const silver = await prisma.roomCategory.findUnique({ where: { name: 'Premium Silver' } });
    const normal = await prisma.roomCategory.findUnique({ where: { name: 'Normal' } });

    if (!deluxe || !gold || !silver || !normal) {
        console.error('Categories not found');
        return;
    }

    
    const createRooms = async (
        catId: string,
        prefix: string,
        count: number,
        catDetails: { name: string, price: number, capacity: number }
    ) => {
        for (let i = 1; i <= count; i++) {
            const roomNumber = `${prefix}${100 + i}`;
            
            const exists = await prisma.room.findFirst({ where: { number: roomNumber } });
            if (!exists) {
                await prisma.room.create({
                    data: {
                        number: roomNumber,
                        categoryId: catId,
                        status: 'Available',
                        type: catDetails.name,
                        price: catDetails.price,
                        capacity: catDetails.capacity
                    }
                });
            }
        }
    };

    await createRooms(deluxe.id, 'D', 20, deluxe);
    await createRooms(gold.id, 'G', 10, gold);
    await createRooms(silver.id, 'S', 10, silver);
    await createRooms(normal.id, 'N', 30, normal);

    
    const staffMembers = [
        { name: 'John Doe', role: 'CLEANING', designation: 'Cleaner', salary: 3000 },
        { name: 'Jane Smith', role: 'FOOD', designation: 'Chef', salary: 5000 },
        { name: 'Mike Johnson', role: 'EVENT', designation: 'Manager', salary: 8000 },
        { name: 'Sarah Connor', role: 'CLEANING', designation: 'Head Housekeeper', salary: 4500 },
        { name: 'Gordon Ramsay', role: 'FOOD', designation: 'Head Chef', salary: 12000 },
    ];

    for (const s of staffMembers) {
        const exists = await prisma.staff.findFirst({ where: { name: s.name } });
        if (!exists) {
            await prisma.staff.create({ data: s });
        }
    }

    
    const activities = [
        { name: 'Live Music', description: 'Evening band', cost: 500, type: 'Group', managerName: 'Alice', managerContact: '123' },
        { name: 'Magic Show', description: 'Afternoon show', cost: 300, type: 'Solo', managerName: 'Bob', managerContact: '456' },
    ];

    for (const act of activities) {
        const exists = await prisma.activity.findFirst({ where: { name: act.name } });
        if (!exists) {
            await prisma.activity.create({
                data: {
                    name: act.name,
                    description: act.description,
                    type: act.type,
                    managerName: act.managerName,
                    managerContact: act.managerContact,
                    cost: act.cost
                }
            });
        }
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
