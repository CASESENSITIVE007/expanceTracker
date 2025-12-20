'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface BalanceData {
  userId: string;
  userName: string;
  totalPaid: number;
  totalOwes: number;
  netBalance: number;
}

interface ExpenseDetail {
  description: string;
  amount: number;
  paidBy: string;
  paidByName: string;
  splits: Array<{
    userName: string;
    amount: number;
  }>;
  date: string;
}

export default function TrackBalances({
  expenses,
  groupUsers,
  groupId,
}: {
  expenses: any[];
  groupUsers: any[];
  groupId: string;
}) {
  // Create a memoized user map for fast lookups
  const userMap = useMemo(() => {
    const map: { [key: string]: string } = {};
    groupUsers.forEach((user: any) => {
      if (user && user.id && user.name) {
        map[user.id] = user.name;
      }
    });
    return map;
  }, [groupUsers]);

  // Calculate detailed balances
  const calculateBalances = () => {
    const balances: { [key: string]: BalanceData } = {};

    groupUsers.forEach((user) => {
      balances[user.id] = {
        userId: user.id,
        userName: user.name,
        totalPaid: 0,
        totalOwes: 0,
        netBalance: 0,
      };
    });

    expenses.forEach((expense) => {
      // Add to payer's totalPaid
      if (balances[expense.paidById]) {
        balances[expense.paidById].totalPaid += expense.amount;
      }

      // Add to each split user's totalOwes
      expense.splits.forEach((split: any) => {
        if (balances[split.userId]) {
          balances[split.userId].totalOwes += split.amount;
        }
      });
    });

    // Calculate net balance
    Object.keys(balances).forEach((userId) => {
      balances[userId].netBalance =
        balances[userId].totalPaid - balances[userId].totalOwes;
    });

    return Object.values(balances).sort(
      (a, b) => Math.abs(b.netBalance) - Math.abs(a.netBalance)
    );
  };

  const balances = calculateBalances();

  const creditors = balances.filter((b) => b.netBalance > 0);
  const debtors = balances.filter((b) => b.netBalance < 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className="bg-gray-900 p-6 rounded-2xl shadow-xl border-2 border-purple-500"
    >
      <h2 className="text-2xl font-black mb-6 text-purple-400">Track Balances</h2>

      {expenses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <p className="text-purple-400 font-bold text-lg">No expenses yet</p>
          <p className="text-purple-400 text-sm mt-2">
            Add expenses to see balance details
          </p>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {/* Creditors Section */}
          {creditors.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-green-400 mb-4">To Receive</h3>
              <motion.div className="space-y-3">
                {creditors.map((balance, i) => (
                  <motion.div
                    key={balance.userId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 bg-gray-800 rounded-xl border-l-4 border-green-500 shadow-md hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-100">
                        {balance.userName}
                      </span>
                      <span className="text-lg font-black text-green-400">
                        +₹{balance.netBalance.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Paid: ₹{balance.totalPaid.toFixed(2)}</p>
                      <p>Share: ₹{balance.totalOwes.toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* Debtors Section */}
          {debtors.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-red-400 mb-4">To Pay</h3>
              <motion.div className="space-y-3">
                {debtors.map((balance, i) => (
                  <motion.div
                    key={balance.userId}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 bg-gray-800 rounded-xl border-l-4 border-red-500 shadow-md hover:shadow-lg transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-100">
                        {balance.userName}
                      </span>
                      <span className="text-lg font-black text-red-400">
                        -₹{Math.abs(balance.netBalance).toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <p>Paid: ₹{balance.totalPaid.toFixed(2)}</p>
                      <p>Share: ₹{balance.totalOwes.toFixed(2)}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          )}

          {/* All Users Summary */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-lg font-bold text-blue-400 mb-4">Summary</h3>
            <motion.div className="space-y-2">
              {balances.map((balance, i) => (
                <motion.div
                  key={balance.userId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex justify-between items-center p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition"
                >
                  <span className="text-gray-300 font-semibold">
                    {balance.userName}
                  </span>
                  <div className="flex gap-4 text-sm">
                    <span className="text-gray-400">
                      Paid: <span className="text-blue-400 font-bold">₹{balance.totalPaid.toFixed(2)}</span>
                    </span>
                    <span className="text-gray-400">
                      Owes: <span className="text-orange-400 font-bold">₹{balance.totalOwes.toFixed(2)}</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
