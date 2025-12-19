
import prisma from "../lib/prisma";
import { simplifyDebts } from "../lib/balances";
import AddExpenseForm from "../components/AddExpenseForm";
// import { clearAllExpenses } from "../app/actions";
import ResetButton from "../components/ResetButton";
export default async function Home() {
  const users = await prisma.user.findMany();
  const groups = await prisma.group.findMany();
  const splits = await prisma.expenseSplit.findMany({ include: { expense: true } });

  const transactions = simplifyDebts(splits);

  return (
    <main className="p-10 text-black bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Expense Tracker</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AddExpenseForm users={users} groupId={groups[0]?.id} />
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-semibold mb-4">Simplified Balances</h2>
          {transactions.map((t, i) => ( 
            <p key={i} className="border-b py-2">
                <strong>
  {users.find((u) => u.id === t.from)?.name || "Unknown User"}
</strong> owes <strong>
  {users.find((u) => u.id === t.to)?.name || "Unknown User"}
</strong> 
              <span className="text-red-500 font-bold ml-2">₹{t.amount.toFixed(2)}</span>
            </p>
          ))}
        </div>
      </div>
      <h2 className="text-lg font-semibold mb-3 text-gray-800">
  Registered Users
</h2>
   <ul className="bg-white shadow-md rounded-xl p-4 max-w-sm space-y-2">
  {users.map((user) => (
    <li
      key={user.id}
      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition"
    >
      <span className="h-8 w-8 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
        {user.name.charAt(0).toUpperCase()}
      </span>

      <span className="text-gray-800 font-medium">
        {user.name}
      </span>
    </li>
  ))}
</ul>


<ResetButton/>

    </main>
  );
}