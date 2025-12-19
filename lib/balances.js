export function simplifyDebts(splits) {
  const netBalances = {};

  splits.forEach((split) => {
    const paidBy = split.expense.paidById;
    const debtor = split.userId;
    const amount = split.amount;

    if (paidBy !== debtor) {
      netBalances[paidBy] = (netBalances[paidBy] || 0) + amount;
      netBalances[debtor] = (netBalances[debtor] || 0) - amount;
    }
  });

  const creditors = Object.keys(netBalances)
    .filter((id) => netBalances[id] > 0)
    .sort((a, b) => netBalances[b] - netBalances[a]);

  const debtors = Object.keys(netBalances)
    .filter((id) => netBalances[id] < 0)
    .sort((a, b) => netBalances[a] - netBalances[b]);

  const results = [];
  let i = 0, j = 0;

  while (i < creditors.length && j < debtors.length) {
    const payAmount = Math.min(netBalances[creditors[i]], -netBalances[debtors[j]]);
    results.push({ from: debtors[j], to: creditors[i], amount: payAmount });

    netBalances[creditors[i]] -= payAmount;
    netBalances[debtors[j]] += payAmount;

    if (netBalances[creditors[i]] === 0) i++;
    if (netBalances[debtors[j]] === 0) j++;
  }
  return results;
}