'use client';
import { useState } from 'react';
import { addExpense } from '../app/actions';

export default function AddExpenseForm({ users, groupId }) {
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState(0);
  const [type, setType] = useState('EQUAL');
  const [shares, setShares] = useState({});
const [paidBy, setPaidBy] = useState(users[0]?.id || "");
const currentTotal = Object.values(shares).reduce((a, b) => a + b, 0);
const remaining = type === 'PERCENTAGE' ? 100 - currentTotal : amount - currentTotal;
  const handleSubmit = async (e) => {
    e.preventDefault();

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
    alert("Expense Added!");
  };

  return (
 <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow space-y-4 text-black">
      <h2 className="text-lg font-bold">Add New Bill</h2>

      {/* Description Input */}
      <input 
        type="text" 
        placeholder="What was this for?" 
        onChange={e => setDesc(e.target.value)} 
        className="w-full border p-2 rounded" 
        required
      />

      {/* Amount Input */}
      <input 
        type="number" 
        placeholder="Total Amount" 
        onChange={e => setAmount(Number(e.target.value))} 
        className="w-full border p-2 rounded" 
        required
      />

      {/* NEW: Paid By Selection */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-600">Who Paid?</label>
        <select 
          value={paidBy}
          onChange={e => setPaidBy(e.target.value)} 
          className="w-full border p-2 rounded bg-gray-50"
        >
          {users.map(u => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Split Type Selection */}
      <div className="space-y-1">
        <label className="text-sm font-semibold text-gray-600">Split Method</label>
        <select onChange={e => setType(e.target.value)} className="w-full border p-2 rounded bg-gray-50">
          <option value="EQUAL">Split Equally</option>
          <option value="EXACT">Exact Amounts</option>
          <option value="PERCENTAGE">Percentage Split</option>
        </select>
      </div>

      {/* Dynamic Inputs for Exact/Percentage */}
    {type !== 'EQUAL' && (
  <div className="border-t pt-2 space-y-2">
    <p className="text-xs text-gray-500 italic">
      Enter {type === 'PERCENTAGE' ? 'percent' : 'amount'} for each:
    </p>
    
    {users.map(u => (
      <div key={u.id} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
        <span className="text-black font-medium">{u.name}</span>
        <div className="flex items-center gap-1">
          <input 
            type="number" 
            value={shares[u.id] || ''} 
            onChange={e => {
              const val = e.target.value === '' ? 0 : Number(e.target.value);
              setShares({ ...shares, [u.id]: val });
            }} 
            className="border p-1 w-24 text-right rounded text-black outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="0"
          />
          <span className="text-gray-500 font-bold w-4">
            {type === 'PERCENTAGE' ? '%' : '₹'}
          </span>
        </div>
      </div>
    ))}

    {/* --- NEW VALIDATION MESSAGES --- */}
    <div className={`mt-3 p-3 rounded-lg border transition-all duration-300 ${
      remaining === 0 
        ? 'bg-green-50 border-green-200 text-green-700' 
        : remaining < 0 
          ? 'bg-orange-100 border-orange-300 text-orange-700 animate-pulse' 
          : 'bg-blue-50 border-blue-200 text-blue-700'
    }`}>
      <p className="text-sm font-bold text-center">
        {/* Case 1: Perfect Match */}
        {remaining === 0 && (
          <span>Great! The total matches 100% exactly ✅</span>
        )}

        {/* Case 2: Under 100% (Incomplete) */}
        {remaining > 0 && (
          <span>
            {type === 'PERCENTAGE' 
              ? `Incomplete: Add ${remaining.toFixed(2)}% more to make it full 100% ⏳` 
              : `Incomplete: ₹${remaining.toFixed(2)} remaining to reach the total amount.`
            }
          </span>
        )}

        {/* Case 3: Over 100% (Overflow) */}
        {remaining < 0 && (
          <span>
            ⚠️ Error: You are {Math.abs(remaining).toFixed(2)}{type === 'PERCENTAGE' ? '%' : '₹'} over the limit!
          </span>
        )}
      </p>
    </div>
  </div>
)}

      {type === 'EXACT' && (
      <div className={`p-2 rounded ${remaining === 0 ? 'bg-green-100' : 'bg-red-100'}`}>
        <p className="text-sm font-bold">
          {remaining === 0 
            ? "Balances Match! ✅" 
            : `Remaining to assign: ₹${remaining.toFixed(2)} ❌`}
        </p>
      </div>
    )}

      <button 
  // The button is disabled if the split isn't EQUAL AND the remaining balance isn't zero
  disabled={type !== 'EQUAL' && Math.abs(remaining) > 0.01} 
  type="submit" 
  className={`w-full font-bold p-3 rounded transition-all duration-200 ${
    (type !== 'EQUAL' && Math.abs(remaining) > 0.01) 
      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' // Disabled style
      : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-md' // Active style
  }`}
>
  {type !== 'EQUAL' && remaining > 0 
    ? `Finish Splitting (${type === 'PERCENTAGE' ? remaining.toFixed(0) + '%' : '₹' + remaining.toFixed(2)} left)` 
    : 'Save Expense'}
</button>

    </form>
    
  );
}