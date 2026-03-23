"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function createCategory(
  cardId: string, 
  name: string, 
  percent: number, 
  limit?: number, 
  comment?: string, 
  isPromoted: boolean = false
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const userId = session.user.id;

  const userCategory = await prisma.userCategory.upsert({
    where: { userId_name: { userId, name } },
    update: {},
    create: { userId, name }
  });

  return prisma.cashbackCategory.create({
    data: { cardId, userCategoryId: userCategory.id, percent, limit, comment, isPromoted }
  });
}

export async function updateCategory(
  id: string, 
  name: string, 
  percent: number, 
  limit?: number, 
  comment?: string, 
  isPromoted: boolean = false
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const userId = session.user.id;

  const userCategory = await prisma.userCategory.upsert({
    where: { userId_name: { userId, name } },
    update: {},
    create: { userId, name }
  });

  return prisma.cashbackCategory.update({
    where: { id },
    data: { userCategoryId: userCategory.id, percent, limit, comment, isPromoted }
  });
}

export async function getUserCategories() {
  const session = await auth();
  if (!session?.user?.id) return [];
  
  return prisma.userCategory.findMany({
    where: { userId: session.user.id },
    orderBy: { name: 'asc' }
  });
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.cashbackCategory.delete({
    where: { id }
  });
}
