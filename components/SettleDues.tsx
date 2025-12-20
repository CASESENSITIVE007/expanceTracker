'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { settleDebt } from '../app/actions';

interface Transaction {
  from: string;
  to: string;
  amount: number;
  id?: string;
  isSettled?: boolean;
}

export default function SettleDues({
  transactions,
  groupUsers,
  groupId,
}: {
  transactions: Transaction[];
  groupUsers: any[];
  groupId: string;
}) {
  const [showConfirm, setShowConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [settledIds, setSettledIds] = useState<Set<string>>(new Set());

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

  const handleSettleDebt = async (transactionId: string) => {
    const transaction = transactions.find((t) => t.id === transactionId);
    if (!transaction) return;
    
    setLoading(true);
    try {
      await settleDebt(transaction.from, transaction.to, transaction.amount, groupId);

      // Optimistically update UI
      setSettledIds(prev => new Set([...prev, transactionId]));
      setShowConfirm(null);
    } catch (error) {
      console.error('Failed to settle debt:', error);
      alert('Failed to settle debt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId: string) => {
    return userMap[userId] || 'Unknown';
  };

  const pendingTransactions = transactions.filter(
    (t) => !settledIds.has(t.id || '')
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="bg-gray-900 p-6 rounded-2xl shadow-xl border-2 border-green-500"
    >
      <h2 className="text-2xl font-black text-green-400 mb-6">🤝 Settle Dues</h2>

      {pendingTransactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-8"
        >
          <p className="text-green-400 font-bold text-lg">All settled!</p>
          <p className="text-green-400 text-sm mt-2">
            Everyone is even - no dues remaining
          </p>
        </motion.div>
      ) : (
        <motion.div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {pendingTransactions.map((transaction, index) => {
              const transactionId = transaction.id || String(index);

              return (
                <motion.div
                  key={transactionId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 bg-green-50 dark:bg-gray-800 rounded-lg dark:border-2 dark:border-green-500"
                >
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    Record <strong className="text-blue-600 dark:text-blue-400">{getUserName(transaction.from)}</strong> paying{' '}
                    <strong className="text-green-600 dark:text-green-400">{getUserName(transaction.to)}</strong>
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowConfirm(transactionId)}
                    disabled={loading}
                    className="bg-green-600 dark:bg-green-600 hover:bg-green-700 dark:hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap"
                  >
                    {loading ? '...' : `Settle ₹${transaction.amount.toFixed(2)}`}
                  </motion.button>

                  {/* Confirmation Dialog */}
                  <AnimatePresence>
                    {showConfirm === transactionId && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                        onClick={() => setShowConfirm(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0.9 }}
                          className="bg-gray-900 p-6 rounded-lg border-2 border-green-500 text-center max-w-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className="text-gray-200 font-bold mb-6 text-base">
                            Confirm payment of <span className="text-green-400">₹{transaction.amount.toFixed(2)}</span>?
                          </p>
                          <div className="flex gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleSettleDebt(transactionId)}
                              disabled={loading}
                              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded font-bold transition-all"
                            >
                              {loading ? '...' : 'Confirm'}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowConfirm(null)}
                              disabled={loading}
                              className="flex-1 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-500 text-white px-4 py-2 rounded font-bold transition-all"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
