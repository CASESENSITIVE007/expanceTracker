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

export async function settleDue(data) {
  try {
    const { expenseId, groupId } = data;

    await prisma.expense.update({
      where: { id: expenseId },
      data: { isSettled: true },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to settle due:", error);
    throw new Error(error instanceof Error ? error.message : "Could not settle due. Please try again.");
  }
}

export async function unsettleDue(data) {
  try {
    const { expenseId, groupId } = data;

    await prisma.expense.update({
      where: { id: expenseId },
      data: { isSettled: false },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to unsettle due:", error);
    throw new Error(error instanceof Error ? error.message : "Could not unsettle due. Please try again.");
  }
}

export async function settleDebt(fromId, toId, amount, groupId) {
  try {
    await prisma.$transaction(async (tx) => {
      // Record a "Settlement" expense
      const expense = await tx.expense.create({
        data: {
          description: "Debt Settlement",
          amount: amount,
          paidById: fromId, // The person who owed the money pays
          groupId: groupId,
          splitType: "EXACT",
        },
      });

      // Create a split where the receiver is the only one "assigned" the value
      // This effectively moves the balance back to zero
      await tx.expenseSplit.create({
        data: {
          expenseId: expense.id,
          userId: toId,
          amount: amount,
        },
      });
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to settle debt:", error);
    throw new Error(error instanceof Error ? error.message : "Could not settle debt. Please try again.");
  }
}

