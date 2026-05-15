export interface Contact {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
  notes?: string;
  createdAt: string;
}

export interface Customer extends Contact {
  totalPurchases: number;
  totalPaid: number;
  totalDebt: number;
}

export interface Supplier extends Contact {
  totalSourcing: number;
  totalPaid: number;
  totalDebt: number;
}
