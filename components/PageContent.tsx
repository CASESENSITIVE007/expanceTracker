'use client';

import { motion } from 'framer-motion';
import { logoutUser } from '../app/auth-actions';
import GroupManager from './GroupManager';
import GroupSelector from './GroupSelector';
import AddExpenseForm from './AddExpenseForm';

export default function PageContent({
  currentUser,
  userGroups,
  activeGroupId,
  activeGroupData,
  groupUsers,
  transactions,
}: any) {
  const handleLogout = async () => {
    await logoutUser();
  };
  return (
    <main className="min-h-screen bg-gray-950 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-2">
              Expense Tracker
            </h1>
            <p className="text-gray-400 text-lg">
              Welcome, <span className="font-bold text-blue-400">{currentUser.name}</span>!
            </p>
          </div>
          <motion.form
            action={handleLogout}
            className="inline"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg"
            >
              Logout
            </motion.button>
          </motion.form>
        </motion.div>

        {/* Group Manager */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8"
        >
          <GroupManager userId={currentUser.id} userGroups={userGroups} />
        </motion.div>

        {activeGroupData ? (
          <>
            {/* Active Group Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-8 p-6 bg-gray-900 rounded-2xl shadow-2xl border-2 border-blue-500"
            >
              <h2 className="text-4xl font-black text-white mb-4">{activeGroupData.name}</h2>
              <div className="flex flex-wrap gap-3">
                {groupUsers.map((user: any, index: number) => (
                  <motion.span
                    key={user.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-bold"
                  >
                    <span className="h-6 w-6 flex items-center justify-center rounded-full bg-white text-blue-600 text-xs font-black">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    {user.name}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Add Expense Form */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <AddExpenseForm users={groupUsers} groupId={activeGroupId} />
              </motion.div>

              {/* Simplified Balances */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-gray-900 p-6 rounded-2xl shadow-xl border-2 border-green-500"
              >
                <h2 className="text-2xl font-black mb-6 text-green-400">Simplified Balances</h2>
                {transactions.length > 0 ? (
                  <motion.div className="space-y-3">
                    {transactions.map((t: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-gray-800 rounded-xl border-l-4 border-orange-500 shadow-md hover:shadow-lg transition"
                      >
                        <p className="text-gray-200">
                          <span className="font-bold text-blue-400">
                            {groupUsers.find((u: any) => u.id === t.from)?.name || 'Unknown'}
                          </span>
                          {' '} owes {' '}
                          <span className="font-bold text-green-400">
                            {groupUsers.find((u: any) => u.id === t.to)?.name || 'Unknown'}
                          </span>
                        </p>
                        <p className="text-2xl font-black text-orange-500 mt-2">₹{t.amount.toFixed(2)}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <p className="text-green-400 font-bold text-lg">All balances settled!</p>
                    <p className="text-green-400 text-sm mt-2">Everyone is even</p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 p-12 rounded-2xl shadow-xl text-center border-2 border-blue-500"
          >
            <p className="text-gray-200 font-bold text-xl mb-2">No group selected</p>
            <p className="text-gray-400">Create or join a group to get started tracking expenses!</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
