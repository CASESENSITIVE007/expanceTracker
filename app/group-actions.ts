"use server";
import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

export async function createGroup(data: { name: string; createdById: string }) {
  try {
    const group = await prisma.group.create({
      data: {
        name: data.name,
        createdById: data.createdById,
        members: {
          create: {
            userId: data.createdById,
          },
        },
      },
      include: { members: true },
    });

    revalidatePath("/");
    return group;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to create group");
  }
}

export async function joinGroup(data: { groupId: string; userId: string; joinCode?: string }) {
  try {
    // Check if user already in group
    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: data.groupId,
          userId: data.userId,
        },
      },
    });

    if (existing) {
      throw new Error("User already in this group");
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId: data.groupId,
        userId: data.userId,
      },
    });

    revalidatePath("/");
    return member;
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to join group");
  }
}

export async function leaveGroup(data: { groupId: string; userId: string }) {
  try {
    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId: data.groupId,
          userId: data.userId,
        },
      },
    });

    revalidatePath("/");
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed to leave group");
  }
}

export async function getUserGroups(userId: string) {
  return prisma.groupMember.findMany({
    where: { userId },
    include: {
      group: {
        include: {
          members: {
            include: { user: true },
          },
          expenses: true,
        },
      },
    },
  });
}

export async function getGroupDetails(groupId: string) {
  return prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        include: { user: true },
      },
      expenses: {
        include: {
          paidBy: true,
          splits: { include: { user: true } },
        },
      },
    },
  });
}
