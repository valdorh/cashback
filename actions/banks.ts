"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function createBank(monthId: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Verify month belongs to user
  const month = await prisma.month.findUnique({ where: { id: monthId, userId: session.user.id }});
  if (!month) throw new Error("Unauthorized");

  return prisma.bank.create({
    data: { monthId, name }
  });
}

export async function updateBank(id: string, name: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.bank.update({
    where: { id },
    data: { name }
  });
}

export async function deleteBank(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return prisma.bank.delete({
    where: { id }
  });
}
