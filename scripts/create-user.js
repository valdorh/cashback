const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser(email, password) {
  // Проверка существования пользователя
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.error(`Ошибка: Пользователь с email "${email}" уже существует`);
    await prisma.$disconnect();
    process.exit(1);
  }

  // Хеширование пароля
  const passwordHash = await bcrypt.hash(password, 10);

  // Создание пользователя
  await prisma.user.create({
    data: { email, passwordHash },
  });

  console.log(`✅ Пользователь создан: ${email}`);
  await prisma.$disconnect();
}

// Парсинг аргументов командной строки
const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.log('❌ Использование: node scripts/create-user.js <email> <password>');
  console.log('');
  console.log('Пример:');
  console.log('  node scripts/create-user.js admin@example.com MySecurePassword123');
  process.exit(1);
}

// Валидация email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Ошибка: Неверный формат email');
  process.exit(1);
}

// Валидация пароля
if (password.length < 6) {
  console.error('❌ Ошибка: Пароль должен быть не менее 6 символов');
  process.exit(1);
}

createUser(email, password).catch((err) => {
  console.error('❌ Ошибка при создании пользователя:', err.message);
  process.exit(1);
});
