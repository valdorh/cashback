"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function exportUserData() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const data = await prisma.month.findMany({
    where: { userId: session.user.id },
    include: {
      banks: {
        include: {
          cards: {
            include: {
              categories: {
                include: {
                  userCategory: true
                }
              }
            }
          }
        }
      }
    }
  });

  return JSON.stringify(data, null, 2);
}

export async function importUserData(jsonData: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  let parsed: any[];
  try {
    parsed = JSON.parse(jsonData);
    if (!Array.isArray(parsed)) throw new Error("Root element must be an array of months");
  } catch (e) {
    return { error: "Invalid JSON format" };
  }

  const userId = session.user.id;

  try {
    // Collect all unique category names from import
    const catNames = new Set<string>();
    parsed.forEach(m => 
      m.banks?.forEach((b: any) => 
        b.cards?.forEach((c: any) => 
          c.categories?.forEach((cat: any) => {
            const name = cat.name || cat.userCategory?.name;
            if (name) catNames.add(name);
          })
        )
      )
    );

    // Upsert dictionary
    await prisma.userCategory.createMany({
      data: Array.from(catNames).map(name => ({ userId, name })),
      skipDuplicates: true
    });
    
    const catDictList = await prisma.userCategory.findMany({ where: { userId } });
    const catId = (name: string) => catDictList.find(c => c.name === name)!.id;

    await prisma.$transaction(async (tx: any) => {
      // Clean start for the user
      await tx.month.deleteMany({
        where: { userId }
      });

      for (const month of parsed) {
        await tx.month.create({
          data: {
            userId,
            key: month.key,
            label: month.label,
            createdAt: month.createdAt ? new Date(month.createdAt) : undefined,
            banks: {
              create: month.banks?.map((bank: any) => ({
                name: bank.name,
                position: bank.position,
                createdAt: bank.createdAt ? new Date(bank.createdAt) : undefined,
                cards: {
                  create: bank.cards?.map((card: any) => ({
                    name: card.name,
                    type: card.type,
                    note: card.note,
                    position: card.position,
                    createdAt: card.createdAt ? new Date(card.createdAt) : undefined,
                    categories: {
                      create: card.categories?.map((cat: any) => {
                        const name = cat.name || cat.userCategory?.name;
                        return {
                          userCategoryId: name ? catId(name) : undefined,
                          percent: cat.percent,
                          limit: cat.limit,
                          comment: cat.comment,
                          isPromoted: cat.isPromoted,
                          position: cat.position,
                          createdAt: cat.createdAt ? new Date(cat.createdAt) : undefined,
                        };
                      }).filter((cat: any) => cat.userCategoryId) || []
                    }
                  })) || []
                }
              })) || []
            }
          }
        });
      }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error("Import error:", error);
    return { error: error.message || "Failed to import data" };
  }
}
