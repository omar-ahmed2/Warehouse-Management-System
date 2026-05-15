/**
 * computeStats.ts
 *
 * Single Source of Truth للإحصائيات المالية للعملاء والموردين.
 * كل أرقام الديون والمبيعات تتحسب من الأوامر مباشرةً
 * بدل ما تكون محفوظة في كائن العميل/المورد (اللي كان بيسبب تضارب البيانات).
 */

import { OutgoingOrder, IncomingOrder } from '../types/inventory.types';

//  العميل 
export interface CustomerStats {

  /** إجمالي قيمة كل الفواتير الصادرة لهذا العميل */
  totalPurchases: number;

  /** إجمالي ما تم تحصيله فعلاً من هذا العميل */
  totalPaid: number;

  /** إجمالي المبلغ المتبقي (الدين الحالي) */
  totalDebt: number;

  /** عدد الفواتير المرتبطة بهذا العميل */
  ordersCount: number;
}

/**
 * يحسب إحصائيات عميل معين من قائمة أوامر الصادر.
 * الناتج دائماً متزامن مع آخر حالة للأوامر.
 */
export function computeCustomerStats(
  customerId: string,
  outgoingOrders: OutgoingOrder[]
): CustomerStats {
  const customerOrders = outgoingOrders.filter(o => o.customerId === customerId);

  const totalPurchases = customerOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalPaid = customerOrders.reduce((s, o) => s + o.amountCollected, 0);
  const totalDebt = customerOrders.reduce((s, o) => s + o.amountRemaining, 0);

  return {
    totalPurchases,
    totalPaid,
    totalDebt,
    ordersCount: customerOrders.length,
  };
}

/**
 * يحسب إجمالي مديونيات **كل** العملاء دفعة واحدة.
 */
export function computeAllCustomersDebt(outgoingOrders: OutgoingOrder[]): number {
  return outgoingOrders.reduce((s, o) => s + o.amountRemaining, 0);
}

/**
 * يحسب إجمالي مبيعات **كل** العملاء دفعة واحدة.
 */
export function computeAllCustomersSales(outgoingOrders: OutgoingOrder[]): number {
  return outgoingOrders.reduce((s, o) => s + o.totalAmount, 0);
}


//  المورد

export interface SupplierStats {
  /** إجمالي قيمة كل فواتير التوريد من هذا المورد */
  totalSourcing: number;
  /** إجمالي ما تم دفعه لهذا المورد فعلاً */
  totalPaid: number;
  /** إجمالي المبلغ المتبقي (علينا للمورد) */
  totalDebt: number;
  /** عدد فواتير التوريد المرتبطة بهذا المورد */
  ordersCount: number;
}

/**
 * يحسب إحصائيات مورد معين من قائمة أوامر الوارد.
 * الناتج دائماً متزامن مع آخر حالة للأوامر.
 */
export function computeSupplierStats(
  supplierId: string,
  incomingOrders: IncomingOrder[]
): SupplierStats {
  const supplierOrders = incomingOrders.filter(o => o.supplierId === supplierId);

  const totalSourcing = supplierOrders.reduce((s, o) => s + o.totalAmount, 0);
  const totalPaid = supplierOrders.reduce((s, o) => s + o.amountPaid, 0);
  const totalDebt = supplierOrders.reduce((s, o) => s + o.amountDue, 0);

  return {
    totalSourcing,
    totalPaid,
    totalDebt,
    ordersCount: supplierOrders.length,
  };
}

/**
 * يحسب إجمالي مديونيات **كل** الموردين دفعة واحدة.
 */
export function computeAllSuppliersDebt(incomingOrders: IncomingOrder[]): number {
  return incomingOrders.reduce((s, o) => s + o.amountDue, 0);
}

/**
 * يحسب إجمالي مشتريات **كل** الموردين دفعة واحدة.
 */
export function computeAllSuppliersSourcing(incomingOrders: IncomingOrder[]): number {
  return incomingOrders.reduce((s, o) => s + o.totalAmount, 0);
}
