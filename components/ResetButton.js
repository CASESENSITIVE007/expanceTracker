'use client';

import { clearAllExpenses } from "../app/actions";

export default function ResetButton() {
  return (
    <form action={async () => {
      if (confirm("Reset all expense data? Users and Groups will be kept.")) {
        await clearAllExpenses();
      }
    }}>
      <button 
        type="submit"
        className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg border border-red-200 text-sm font-bold transition-all shadow-sm"
      >
        🗑️ Clear Database
      </button>
    </form>
  );
}