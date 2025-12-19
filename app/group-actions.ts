"use server";
import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";

export async function createGroup(data: { name: string; createdById: string }) {
  try {
    // Generate a unique 6-character code for joining
    const joinCode = nanoid(6).toUpperCase();

    const group = await prisma.group.create({
      data: {
        name: data.name,
        createdById: data.createdById,
        joinCode: joinCode,
        members: {
          create: {
            userId: data.createdById,
          },
        },
      },
      include: { members: true },
    });

    revalidatePath("/");
    return { success: true, group, joinCode };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to create group" };
  }
}

export async function joinGroupByCode(data: { joinCode: string; userId: string }) {
  try {
    // Find group by join code
    const group = await prisma.group.findUnique({
      where: { joinCode: data.joinCode },
    });

    if (!group) {
      return { success: false, error: "Invalid join code. Group not found." };
    }

    // Check if user already in group
    const existing = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: data.userId,
        },
      },
    });

    if (existing) {
      return { success: false, error: "You are already a member of this group" };
    }

    const member = await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId: data.userId,
      },
    });

    revalidatePath("/");
    return { success: true, member, groupName: group.name };
  } catch (error: any) {
    return { success: false, error: error?.message || "Failed to join group" };
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
