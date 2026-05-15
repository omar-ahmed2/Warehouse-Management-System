import { FinanceEntry } from '../types/finance.types';

export const calculateFinanceTotals = (entries: FinanceEntry[]) => {
  const totalCapital = entries
    .filter((e) => e.type === 'capital_deposit')
    .reduce((s, e) => s + e.amount, 0);

  const totalRevenue = entries
    .filter((e) => e.type === 'revenue_deposit' || e.type === 'outgoing_collection')
    .reduce((s, e) => s + Math.max(0, e.amount), 0);

  const totalExpenses = entries
    .filter((e) => e.type === 'company_expense')
    .reduce((s, e) => s + Math.abs(e.amount), 0);

  const totalOutgoingPayments = entries
    .filter((e) => e.type === 'incoming_payment')
    .reduce((s, e) => s + Math.abs(e.amount), 0);

  const netBalance = totalCapital + totalRevenue - totalExpenses - totalOutgoingPayments;

  return {
    totalCapital,
    totalRevenue,
    totalExpenses,
    totalOutgoingPayments,
    netBalance,
  };
};
