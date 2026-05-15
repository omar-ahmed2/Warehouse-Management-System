export interface InventoryItem {
  productId: string;
  currentQty: number;
  lastUpdated: string;
}

export type OrderStatus = 'pending' | 'partial' | 'completed';

export interface IncomingOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: { productId: string; productName: string; qty: number; unitPrice: number }[];
  totalAmount: number;
  amountPaid: number;
  amountDue: number;
  status: OrderStatus;
  notes: string;
  createdAt: string;
  createdBy: string;
}

export interface OutgoingOrder {
  id: string;
  customerId: string;
  customerName: string;
  items: { productId: string; productName: string; qty: number; unitPrice: number }[];
  totalAmount: number;
  amountCollected: number;
  amountRemaining: number;
  status: OrderStatus;
  notes: string;
  createdAt: string;
  createdBy: string;
}
