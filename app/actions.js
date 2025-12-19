"use server";
import prisma from "../lib/prisma";
import { revalidatePath } from "next/cache";

export async function addExpense(data) {
  const { description, totalAmount, paidById, groupId, splitType, shares } = data;

  if (splitType === "PERCENTAGE") {
    const totalPercent = shares.reduce((sum, s) => sum + s.value, 0);
    if (Math.abs(totalPercent - 100) > 0.01) throw new Error("Total must be 100%");
  }
  if (splitType === "EXACT") {
    const sumOfShares = shares.reduce((acc, s) => acc + s.value, 0);
    
    // We use a small tolerance (0.01) to handle floating point math issues
    if (Math.abs(sumOfShares - totalAmount) > 0.01) {
      throw new Error(`The sum of individual shares (₹${sumOfShares}) must equal the total amount (₹${totalAmount}).`);
    }
  }

  await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: { description, amount: totalAmount, paidById, groupId, splitType },
    });

    const splitRecords = shares.map((s) => ({
      expenseId: expense.id,
      userId: s.userId,
      amount: splitType === "EQUAL" ? totalAmount / shares.length 
             : splitType === "PERCENTAGE" ? (totalAmount * s.value) / 100 
             : s.value,
    }));

    await tx.expenseSplit.createMany({ data: splitRecords });
  });

  revalidatePath("/");
}
// ... existing addExpense code ...

export async function clearAllExpenses() {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete all individual splits first
      await tx.expenseSplit.deleteMany({});
      // 2. Then delete the parent expenses
      await tx.expense.deleteMany({});
    });

    // Refresh the UI to show zero balances
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to clear expenses:", error);
    throw new Error("Could not reset data. Please try again.");
  }
}

