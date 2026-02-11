import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ROOM_CATEGORIES = [
    {
        name: 'Deluxe',
        capacity: 6,
        price: 35000,
        features: ['Ocean View', 'King Size Bed', 'Private Balcony', 'Jacuzzi', '24/7 Butler Service', 'Free Champagne'],
        images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=2070', 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&q=80&w=2074']
    },
    {
        name: 'Premium Gold',
        capacity: 4,
        price: 30000,
        features: ['Ocean View', 'Queen Size Bed', 'Mini Bar', 'Spacious Suite', 'Priority Boarding'],
        images: ['https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&q=80&w=2070', 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=2074']
    },
    {
        name: 'Premium Silver',
        capacity: 2,
        price: 27000,
        features: ['Partial Ocean View', 'Double Bed', 'TV', 'Ensuite Bathroom', 'Room Service'],
        images: ['https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&q=80&w=2074', 'https://images.unsplash.com/photo-1512918760532-3ed64bc80414?auto=format&fit=crop&q=80&w=2076']
    },
    {
        name: 'Normal',
        capacity: 2,
        price: 23000,
        features: ['Interior Room', 'Two Single Beds', 'Compact Design', 'Economy Choice'],
        images: ['https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=2070', 'https://images.unsplash.com/photo-1505693314120-0d443867891e?auto=format&fit=crop&q=80&w=2191']
    }
];

async function main() {
    console.log('Start seeding room categories and rooms...');

    for (const cat of ROOM_CATEGORIES) {
        // 1. Upsert Category
        const category = await prisma.roomCategory.upsert({
            where: { name: cat.name },
            update: {}, // Don't overwrite if exists, or maybe update features? Let's keep it safe.
            create: {
                name: cat.name,
                capacity: cat.capacity,
                price: cat.price,
                features: cat.features,
                images: cat.images
            }
        });

        console.log(`Upserted category: ${category.name}`);

        // 2. Count existing rooms in this category
        const existingCount = await prisma.room.count({
            where: { categoryId: category.id }
        });

        console.log(`Found ${existingCount} rooms for ${category.name}`);

        // 3. Create missing rooms if < 25
        if (existingCount < 25) {
            const needed = 25 - existingCount;
            console.log(`Creating ${needed} rooms for ${category.name}...`);

            const prefix = category.name === 'Deluxe' ? 'D' :
                category.name === 'Premium Gold' ? 'PG' :
                    category.name === 'Premium Silver' ? 'PS' : 'N';

            const roomsData = [];
            for (let i = 1; i <= needed; i++) {
                const roomNum = await getNextRoomNumber(prefix, existingCount + i);
                roomsData.push({
                    number: roomNum,
                    type: category.name,
                    price: category.price,
                    capacity: category.capacity,
                    status: 'AVAILABLE',
                    categoryId: category.id
                });
            }

            await prisma.room.createMany({
                data: roomsData
            });
            console.log(`Created ${needed} rooms.`);
        }
    }

    console.log('Seeding finished.');
}

async function getNextRoomNumber(prefix: string, index: number) {
    // Simple generation logic, e.g., D101, D102...
    return `${prefix}${100 + index}`;
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
