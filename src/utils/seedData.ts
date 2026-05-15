import { User } from '../types/user.types';
import { Product } from '../types/product.types';
import { InventoryItem, IncomingOrder, OutgoingOrder } from '../types/inventory.types';
import { FinanceEntry } from '../types/finance.types';
import { Customer, Supplier } from '../types/contact.types';

export const STORAGE_KEY = 'makhzan_data';

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
    name: 'المدير العام',
    email: 'makhzan@gmail.com',
    password: 'makhzan@2026',
    role: 'manager',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'المشرف الأول',
    email: 'supervisor@makhzan.com',
    password: '123456',
    role: 'supervisor',
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'أمين المخزن',
    email: 'keeper@makhzan.com',
    password: '123456',
    role: 'warehouse_keeper',
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

export const SEED_DATA: AppData = {
  users: DEFAULT_USERS,
  products: [
    { id: 'p1', name: 'جهاز لابتوب ديل', code: 'PRD-001', category: 'إلكترونيات', unit: 'قطعة', buyPrice: 15000, sellPrice: 18000, minStock: 5, createdAt: new Date().toISOString() },
    { id: 'p2', name: 'شاشة سامسونج 24', code: 'PRD-002', category: 'إلكترونيات', unit: 'قطعة', buyPrice: 3000, sellPrice: 4500, minStock: 10, createdAt: new Date().toISOString() },
    { id: 'p3', name: 'طابعة اتش بي', code: 'PRD-003', category: 'معدات مكتبية', unit: 'قطعة', buyPrice: 4000, sellPrice: 5500, minStock: 3, createdAt: new Date().toISOString() },
    { id: 'p4', name: 'لوحة مفاتيح لاسلكية', code: 'PRD-004', category: 'إكسسوارات', unit: 'قطعة', buyPrice: 500, sellPrice: 850, minStock: 20, createdAt: new Date().toISOString() },
    { id: 'p5', name: 'فأرة لاسلكية', code: 'PRD-005', category: 'إكسسوارات', unit: 'قطعة', buyPrice: 300, sellPrice: 550, minStock: 15, createdAt: new Date().toISOString() },
  ],
  customers: [
    { id: 'c1', name: 'شركة التقنية الحديثة', phone: '01002233445', address: 'القاهرة، المعادي', totalPurchases: 54000, totalPaid: 50000, totalDebt: 4000, createdAt: new Date().toISOString() },
    { id: 'c2', name: 'مكتبة الأمل', phone: '01122334455', address: 'الجيزة، فيصل', totalPurchases: 12000, totalPaid: 12000, totalDebt: 0, createdAt: new Date().toISOString() },
  ],
  suppliers: [
    { id: 's1', name: 'يونيفرسال للتوريدات', phone: '01223344556', address: 'وسط البلد، القاهرة', totalSourcing: 45000, totalPaid: 40000, totalDebt: 5000, createdAt: new Date().toISOString() },
  ],
  inventory: [
    { productId: 'p1', currentQty: 10, lastUpdated: new Date().toISOString() },
    { productId: 'p2', currentQty: 25, lastUpdated: new Date().toISOString() },
    { productId: 'p3', currentQty: 5, lastUpdated: new Date().toISOString() },
    { productId: 'p4', currentQty: 50, lastUpdated: new Date().toISOString() },
    { productId: 'p5', currentQty: 4, lastUpdated: new Date().toISOString() }, // Low stock example
  ],
  incomingOrders: [],
  outgoingOrders: [],
  financeEntries: [
    {
      id: 'f1',
      type: 'capital_deposit',
      amount: 100000,
      description: 'إيداع رأس مال تأسيسي',
      referenceId: null,
      referenceType: null,
      createdAt: new Date().toISOString(),
      createdBy: '1',
    },
  ],
  settings: {
    companyName: 'مخزن المستقبل',
    address: 'القاهرة - مصر',
    currency: 'ج.م',
  },
};
