"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getMonths() {
  const session = await auth();
  if (!session?.user?.id) return [];

  return prisma.month.findMany({
    where: { userId: session.user.id },
    orderBy: { key: 'desc' }
  });
}

export async function getMonthData(monthId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const month = await prisma.month.findUnique({
    where: { id: monthId, userId: session.user.id },
    include: {
      banks: {
        orderBy: { position: 'asc' },
        include: {
          cards: {
            orderBy: { position: 'asc' },
            include: {
              categories: {
                orderBy: { position: 'asc' },
                include: { userCategory: true }
              }
            }
          }
        }
      }
    }
  });

  return month;
}

export async function createMonthUnified(
  key: string, 
  label: string, 
  baseMonthId?: string | null,
  categorySourceMonthId?: string | null
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const sourceStructure = baseMonthId ? await prisma.month.findUnique({
    where: { id: baseMonthId, userId: session.user.id },
    include: {
      banks: {
        include: {
          cards: true
        }
      }
    }
  }) : null;

  const sourceCategoriesMonth = categorySourceMonthId ? await prisma.month.findUnique({
    where: { id: categorySourceMonthId, userId: session.user.id },
    include: {
      banks: {
        include: {
          cards: {
            include: {
              categories: true
            }
          }
        }
      }
    }
  }) : null;

  const banksPayload = sourceStructure?.banks.map((bank: any) => {
    return {
      name: bank.name,
      position: bank.position,
      cards: {
        create: bank.cards.map((card: any) => {
          let categoriesToCreate: any[] = [];
          if (sourceCategoriesMonth) {
            const matchingBank = sourceCategoriesMonth.banks.find((b: any) => b.name === bank.name);
            if (matchingBank) {
              const matchingCard = matchingBank.cards.find((c: any) => c.name === card.name);
              if (matchingCard && matchingCard.categories) {
                categoriesToCreate = matchingCard.categories.map((cat: any) => ({
                  userCategoryId: cat.userCategoryId,
                  percent: cat.percent,
                  limit: cat.limit,
                  comment: cat.comment,
                  isPromoted: cat.isPromoted,
                  position: cat.position
                }));
              }
            }
          }

          return {
            name: card.name,
            type: card.type,
            note: card.note,
            position: card.position,
            categories: {
              create: categoriesToCreate
            }
          };
        })
      }
    };
  }) || [];

  return prisma.month.create({
    data: {
      userId: session.user.id,
      key,
      label,
      banks: {
        create: banksPayload
      }
    }
  });
}

export async function deleteMonth(monthId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.month.delete({
    where: { id: monthId, userId: session.user.id }
  });
}
