const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const todaysNotifs = await prisma.notification.findMany({
    where: { 
      createdAt: { gte: today }
    },
    orderBy: { createdAt: 'desc' },
    select: { 
      id: true, 
      receiverId: true, 
      receiverRole: true, 
      title: true,
      createdAt: true
    }
  });
  console.log('Notifications created today:');
  console.dir(todaysNotifs);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
