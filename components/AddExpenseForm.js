'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { addExpense } from '../app/actions';

export default function AddExpenseForm({ users, groupId }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState('EQUAL');
  const [shares, setShares] = useState({});
  const [paidBy, setPaidBy] = useState(users[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const currentTotal = Object.values(shares).reduce((a, b) => a + b, 0);
  const remaining = type === 'PERCENTAGE' ? 100 - currentTotal : amount - currentTotal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      //logic of shares array
      const sharesArray = users.map(u => ({ userId: u.id, value: shares[u.id] || 0 }));
      
      await addExpense({ 
        description: desc, 
        totalAmount: amount, 
        paidById: paidBy, 
        groupId, 
        splitType: type, 
        shares: sharesArray
      });

      // Reset form
      setDesc('');
      setAmount(0);
      setType('EQUAL');
      setShares({});
      setPaidBy(users[0]?.id || "");

      // Show success feedback
      setTimeout(() => {
        setError(null);
      }, 3000);
    } catch (err) {
      setError("Failed to add expense. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-gray-900 rounded-2xl shadow-xl border-2 border-blue-500 space-y-4 text-gray-100"
    >
      <motion.h2
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl font-black text-blue-400 mb-4"
      >
        Add New Expense
      </motion.h2>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-100 border-2 border-red-300 text-red-700 rounded-lg font-bold text-center"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Description Input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <label className="text-sm font-bold text-gray-300 mb-2 block">What was this for?</label>
        <motion.input
          type="text"
          placeholder="e.g., Dinner, Movie tickets..."
          value={desc}
          onChange={e => setDesc(e.target.value)}
          whileFocus={{ scale: 1.02 }}
          className="w-full border-2 border-blue-600 p-3 rounded-lg text-gray-100 placeholder-gray-400 bg-gray-800 focus:border-blue-400 focus:outline-none transition-all"
          required
        />
      </motion.div>

      {/* Amount Input */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <label className="text-sm font-bold text-gray-300 mb-2 block">Total Amount (₹)</label>
        <motion.input
          type="number"
          placeholder="0.00"
          value={amount || ''}
          onChange={e => setAmount(Number(e.target.value))}
          whileFocus={{ scale: 1.02 }}
          className={`w-full border-2 p-3 rounded-lg text-gray-100 placeholder-gray-400 bg-gray-800 focus:outline-none transition-all ${
            amount < 0 ? 'border-red-500 focus:border-red-400' : 'border-blue-600 focus:border-blue-400'
          }`}
          required
        />
      </motion.div>

      {/* Negative Amount Warning */}
      <AnimatePresence>
        {amount < 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-100 border-2 border-red-300 text-red-700 rounded-lg font-bold text-center"
          >
            Negative numbers are not valid. Please enter a positive amount.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paid By Selection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="space-y-1"
      >
        <label className="text-sm font-bold text-gray-300 mb-2 block">Who Paid?</label>
        <motion.select
          value={paidBy}
          onChange={e => setPaidBy(e.target.value)}
          whileFocus={{ scale: 1.02 }}
          className="w-full border-2 border-blue-200 p-3 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </motion.select>
      </motion.div>

      {/* Split Type Selection */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="space-y-1"
      >
        <label className="text-sm font-bold text-gray-300 mb-2 block">Split Method</label>
        <motion.select
          value={type}
          onChange={e => setType(e.target.value)}
          whileFocus={{ scale: 1.02 }}
          className="w-full border-2 border-blue-200 p-3 rounded-lg bg-white text-gray-900 focus:border-blue-500 focus:outline-none transition-all cursor-pointer"
        >
          <option value="EQUAL">Split Equally</option>
          <option value="EXACT">Exact Amounts</option>
          <option value="PERCENTAGE">Percentage Split</option>
        </motion.select>
      </motion.div>

      {/* Dynamic Inputs for Exact/Percentage */}
      <AnimatePresence>
        {type !== 'EQUAL' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t-2 border-blue-200 pt-4 space-y-3"
          >
            <p className="text-xs font-bold text-gray-600 italic">
              Enter {type === 'PERCENTAGE' ? 'percent' : 'amount'} for each person:
            </p>

            {users.map((u, index) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex justify-between items-center bg-gray-800 p-3 rounded-lg border-2 border-blue-600 hover:border-blue-400 transition"
              >
                <span className="text-gray-200 font-bold">{u.name}</span>
                <div className="flex items-center gap-2">
                  <motion.input
                    type="number"
                    value={shares[u.id] || ''}
                    onChange={e => {
                      const val = e.target.value === '' ? 0 : Number(e.target.value);
                      setShares({ ...shares, [u.id]: val });
                    }}
                    whileFocus={{ scale: 1.05 }}
                    className="border-2 border-blue-600 p-2 w-24 text-right rounded-lg text-gray-100 placeholder-gray-500 bg-gray-800 focus:border-blue-400 focus:outline-none"
                    placeholder="0"
                  />
                  <span className="text-gray-300 font-bold w-6">
                    {type === 'PERCENTAGE' ? '%' : '₹'}
                  </span>
                </div>
              </motion.div>
            ))}

            {/* Validation Messages */}
            <motion.div
              layout
              className={`mt-3 p-4 rounded-lg border-2 transition-all duration-300 font-bold text-center text-sm ${
                remaining === 0
                  ? 'bg-gray-800 border-green-500 text-green-400'
                  : remaining < 0
                  ? 'bg-gray-800 border-red-500 text-red-400 animate-pulse'
                  : 'bg-gray-800 border-yellow-500 text-yellow-400'
              }`}
            >
              {remaining === 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  Perfect! Total matches 100% exactly
                </motion.span>
              )}

              {remaining > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  Add {Math.abs(remaining).toFixed(2)}{type === 'PERCENTAGE' ? '%' : '₹'} more
                </motion.span>
              )}

              {remaining < 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  You are {Math.abs(remaining).toFixed(2)}{type === 'PERCENTAGE' ? '%' : '₹'} over!
                </motion.span>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={amount < 0 || (type !== 'EQUAL' && Math.abs(remaining) > 0.01) || loading}
        whileHover={!(amount < 0 || (type !== 'EQUAL' && Math.abs(remaining) > 0.01) || loading) ? { scale: 1.05 } : {}}
        whileTap={!(amount < 0 || (type !== 'EQUAL' && Math.abs(remaining) > 0.01) || loading) ? { scale: 0.95 } : {}}
        className={`w-full font-black p-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 text-lg ${
          amount < 0 || (type !== 'EQUAL' && Math.abs(remaining) > 0.01)
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : loading
            ? 'bg-blue-600 text-white cursor-wait'
            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
        }`}
      >
        {loading ? (
          <>
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
              ⏳
            </motion.span>
            Saving...
          </>
        ) : (
          <>
            Save Expense
          </>
        )}
      </motion.button>
    </motion.form>
  );
}