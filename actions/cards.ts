"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function createCard(bankId: string, name: string, type?: string, note?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const bank = await prisma.bank.findUnique({ where: { id: bankId }, include: { month: true } });
  if (!bank || bank.month.userId !== session.user.id) throw new Error("Unauthorized");

  return prisma.card.create({
    data: { bankId, name, type, note }
  });
}

export async function updateCard(id: string, name: string, type?: string, note?: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.card.update({
    where: { id },
    data: { name, type, note }
  });
}

export async function deleteCard(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.card.delete({
    where: { id }
  });
}
