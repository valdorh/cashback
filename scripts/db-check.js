const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function runMigrations() {
  console.log('Starting migrations...');
  
  // Для этого проекта миграции применяются через prisma migrate deploy
  // Этот скрипт просто проверяет подключение к БД
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Проверка наличия таблиц
    const userCount = await prisma.user.count();
    console.log(`✅ Users table exists. Count: ${userCount}`);
    
    await prisma.$disconnect();
    console.log('✅ Database check completed');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

runMigrations();
