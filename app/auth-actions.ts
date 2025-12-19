"use server";
import prisma from "../lib/prisma";
import { hashPassword, verifyPassword, setUserCookie, clearUserCookie, getUserFromCookie } from "../lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function registerUser(data: { name: string; email: string; password: string }) {
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { success: false, error: "User with this email already exists" };
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
      },
    });

    await setUserCookie(user.id);
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Registration failed" };
  }
}

export async function loginUser(data: { email: string; password: string }) {
  try {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const passwordMatch = await verifyPassword(data.password, user.password);

    if (!passwordMatch) {
      return { success: false, error: "Invalid password" };
    }

    await setUserCookie(user.id);
    revalidatePath("/");
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Login failed" };
  }
}

export async function logoutUser() {
  await clearUserCookie();
  revalidatePath("/");
  redirect("/login");
}

export async function getCurrentUser() {
  const userId = await getUserFromCookie();
  if (!userId) return null;

  return prisma.user.findUnique({
    where: { id: userId },
    include: { groups: { include: { group: { include: { members: true } } } } },
  });
}
