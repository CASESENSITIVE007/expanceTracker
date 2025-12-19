
import prisma from "../lib/prisma";
import { getCurrentUser, logoutUser } from "./auth-actions";
import { redirect } from "next/navigation";
import { simplifyDebts } from "../lib/balances";
import AddExpenseForm from "../components/AddExpenseForm";
import ResetButton from "../components/ResetButton";
import GroupManager from "../components/GroupManager";
import GroupSelector from "../components/GroupSelector";

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
  const allGroups = await prisma.group.findMany({
    include: { members: true },
  });

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
          },
        },
        include: { expense: true },
      });
      transactions = simplifyDebts(splits);
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
    <main className="p-10 text-black bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">Expense Tracker</h1>
          <p className="text-gray-600">Logged in as: <span className="font-semibold">{currentUser.name}</span></p>
        </div>
        <LogoutButton />
      </div>

      {/* Group Manager */}
      <div className="mb-8">
        <GroupManager userId={currentUser.id} userGroups={userGroups} allGroups={allGroups} />
      </div>

      {/* Group Selector - for switching between groups */}
      {userGroups.length > 1 && (
        <GroupSelector userGroups={userGroups} activeGroupId={activeGroupId} />
      )}

      {activeGroupData ? (
        <>
          {/* Active Group Section */}
          <div className="mb-8 p-6 bg-white rounded-lg shadow">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{activeGroupData.name}</h2>
            <div className="flex flex-wrap gap-2">
              {groupUsers.map((user) => (
                <span
                  key={user.id}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  <span className="h-5 w-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                  {user.name}
                </span>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Add Expense Form */}
            <AddExpenseForm users={groupUsers} groupId={activeGroupId} />

            {/* Simplified Balances */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Simplified Balances</h2>
              {transactions.length > 0 ? (
                transactions.map((t, i) => (
                  <p key={i} className="border-b py-2 text-gray-700">
                    <strong>{groupUsers.find((u) => u.id === t.from)?.name || "Unknown"}</strong> owes{" "}
                    <strong>{groupUsers.find((u) => u.id === t.to)?.name || "Unknown"}</strong>
                    <span className="text-red-500 font-bold ml-2">₹{t.amount.toFixed(2)}</span>
                  </p>
                ))
              ) : (
                <p className="text-gray-500 italic">All balances settled! 🎉</p>
              )}
            </div>
          </div>

          {/* Reset Button */}
          <div className="flex justify-end mb-8">
            <ResetButton />
          </div>
        </>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600 mb-4">Create or join a group to get started</p>
        </div>
      )}
    </main>
  );
}