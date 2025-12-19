'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { clearAllExpenses } from "../app/actions";

export default function ResetButton() {
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (confirm("🚨 Reset all expense data? Users and Groups will be kept.")) {
      setLoading(true);
      try {
        await clearAllExpenses();
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <form action={handleReset}>
      <motion.button
        type="submit"
        disabled={loading}
        whileHover={!loading ? { scale: 1.05 } : {}}
        whileTap={!loading ? { scale: 0.95 } : {}}
        className={`px-6 py-3 rounded-lg border-2 font-black transition-all shadow-lg flex items-center gap-2 ${
          loading
            ? 'bg-gray-300 text-gray-600 border-gray-400 cursor-wait'
            : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white border-red-600'
        }`}
      >
        {loading ? (
          <>
            <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
              ⏳
            </motion.span>
            Clearing...
          </>
        ) : (
          <>
            🗑️ Clear Database
          </>
        )}
      </motion.button>
    </form>
  );
}