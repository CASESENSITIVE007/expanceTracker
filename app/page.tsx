
import prisma from "../lib/prisma";
import { getCurrentUser, logoutUser } from "./auth-actions";
import { redirect } from "next/navigation";
import { simplifyDebts } from "../lib/balances";
import AddExpenseForm from "../components/AddExpenseForm";
import ResetButton from "../components/ResetButton";
import GroupManager from "../components/GroupManager";
import GroupSelector from "../components/GroupSelector";
import PageContent from "../components/PageContent";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  // Get user's groups
  const userGroupIds = currentUser.groups.map((gm) => gm.groupId);
  const userGroups = currentUser.groups;

  // Get selected group from URL params or use first group
  const params = await searchParams;
  const selectedGroupId = params.group as string | undefined;
  const activeGroupId = selectedGroupId && userGroupIds.includes(selectedGroupId) 
    ? selectedGroupId 
    : userGroupIds[0];

  let activeGroupData = null;
  let transactions: any[] = [];
  let groupUsers: any[] = [];

  if (activeGroupId) {
    activeGroupData = await prisma.group.findUnique({
      where: { id: activeGroupId },
      include: {
        members: { include: { user: true } },
        expenses: { include: { splits: { include: { user: true } } } },
      },
    });

    if (activeGroupData) {
      groupUsers = activeGroupData.members.map((m) => m.user);
      const splits = await prisma.expenseSplit.findMany({
        where: {
          expense: {
            groupId: activeGroupId,
            isSettled: false,
          },
        },
        include: { expense: true },
      });
      
      // Add expense IDs to transactions for settlement tracking
      const baseTransactions = simplifyDebts(splits);
      
      // Map transactions to include their corresponding expense IDs
      transactions = baseTransactions.map((t: any) => ({
        ...t,
        id: undefined, // Will be populated based on the splits
      }));
      
      // Get all unsettled expenses to attach IDs
      const unsettledExpenses = await prisma.expense.findMany({
        where: {
          groupId: activeGroupId,
          isSettled: false,
        },
      });
      
      // Create a mapping of transactions to expense IDs
      transactions = transactions.map((t: any, idx: number) => ({
        ...t,
        id: unsettledExpenses[idx]?.id || String(idx),
      }));
    }
  }

  const LogoutButton = () => (
    <form
      action={async () => {
        "use server";
        await logoutUser();
      }}
      className="inline"
    >
      <button
        type="submit"
        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition"
      >
        Logout
      </button>
    </form>
  );

  return (
    <PageContent 
      currentUser={currentUser}
      userGroups={userGroups}
      activeGroupId={activeGroupId}
      activeGroupData={activeGroupData}
      groupUsers={groupUsers}
      transactions={transactions}
    />
  );
}