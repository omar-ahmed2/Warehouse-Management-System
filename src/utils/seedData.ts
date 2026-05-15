import { User } from '../types/user.types';
import { Product } from '../types/product.types';
import { InventoryItem, IncomingOrder, OutgoingOrder } from '../types/inventory.types';
import { FinanceEntry } from '../types/finance.types';
import { Customer, Supplier } from '../types/contact.types';

export const STORAGE_KEY = 'makhzan_v1';

export interface AppData {
  users: User[];
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  inventory: InventoryItem[];
  incomingOrders: IncomingOrder[];
  outgoingOrders: OutgoingOrder[];
  financeEntries: FinanceEntry[];
  settings: {
    companyName: string;
    address: string;
    currency: string;
  };
}

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    name: 'Admin',
    email: 'makhzan@gmail.com',
    password: 'makhzan@2026',
    role: 'manager',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_DATA: AppData = {
  users: DEFAULT_USERS,
  products: [],
  customers: [],
  suppliers: [],
  inventory: [],
  incomingOrders: [],
  outgoingOrders: [],
  financeEntries: [],
  settings: {
    companyName: 'مخزني',
    address: 'إضافة العنوان...',
    currency: 'ج.م',
  },
};