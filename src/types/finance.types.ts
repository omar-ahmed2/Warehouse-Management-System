export type EntryType = 'capital_deposit' | 'revenue_deposit' | 'company_expense' | 'incoming_payment' | 'outgoing_collection';

export interface FinanceEntry {
  id: string;
  type: EntryType;
  amount: number;
  description: string;
  referenceId: string | null;   // linked order ID if auto-generated
  referenceType: 'incoming' | 'outgoing' | null;
  createdAt: string;
  createdBy: string;
}
