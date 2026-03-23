"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function seedDemoData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const userId = session.user.id;
  
  // Format current month Key
  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const monthLabel = now.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });

  // Capitalize month label
  const finalLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

  // Check if month already exists
  const existing = await prisma.month.findUnique({
    where: { userId_key: { userId, key: monthKey } }
  });

  if (existing) {
    return { error: "Месяц уже существует" };
  }

  // Pre-seed categories
  const catNames = [
    "Супермаркеты", "Аптеки", "Рестораны", "Яндекс.Маркет", 
    "Авиабилеты", "Отели", "Заправки (АЗС)", "Одежда и обувь", 
    "Фастфуд", "СберМаркет", "Такси"
  ];
  
  await prisma.userCategory.createMany({
    data: catNames.map(name => ({ userId, name })),
    skipDuplicates: true
  });

  const catDictList = await prisma.userCategory.findMany({ where: { userId } });
  const catId = (name: string) => catDictList.find(c => c.name === name)!.id;

  // Create full structure
  await prisma.month.create({
    data: {
      userId,
      key: monthKey,
      label: finalLabel,
      banks: {
        create: [
          {
            name: "Т-Банк",
            position: 0,
            cards: {
              create: [
                {
                  name: "Tinkoff Black",
                  type: "Дебетовая",
                  position: 0,
                  categories: {
                    create: [
                      { userCategoryId: catId("Супермаркеты"), percent: 5 },
                      { userCategoryId: catId("Аптеки"), percent: 5 },
                      { userCategoryId: catId("Рестораны"), percent: 7, isPromoted: true },
                      { userCategoryId: catId("Яндекс.Маркет"), percent: 10 }
                    ]
                  }
                },
                {
                  name: "All Airlines",
                  type: "Кредитная",
                  position: 1,
                  categories: {
                    create: [
                      { userCategoryId: catId("Авиабилеты"), percent: 7 },
                      { userCategoryId: catId("Отели"), percent: 10 }
                    ]
                  }
                }
              ]
            }
          },
          {
            name: "Альфа-Банк",
            position: 1,
            cards: {
              create: [
                {
                  name: "Альфа-Карта",
                  type: "Дебетовая",
                  position: 0,
                  categories: {
                    create: [
                      { userCategoryId: catId("Заправки (АЗС)"), percent: 10 },
                      { userCategoryId: catId("Одежда и обувь"), percent: 5 },
                      { userCategoryId: catId("Фастфуд"), percent: 5 }
                    ]
                  }
                }
              ]
            }
          },
          {
            name: "Сбербанк",
            position: 2,
            cards: {
              create: [
                {
                  name: "СберКарта",
                  type: "Дебетовая",
                  position: 0,
                  categories: {
                    create: [
                      { userCategoryId: catId("СберМаркет"), percent: 10 },
                      { userCategoryId: catId("Такси"), percent: 3 }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  });

  return { success: true };
}
