import React from 'react';
import { createPortal } from 'react-dom';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

interface InvoicePrintProps {
  order: any;
  type: 'incoming' | 'outgoing';
  onClose?: () => void;
}

export const InvoicePrint: React.FC<InvoicePrintProps> = ({ order, type }) => {
  if (!order) return null;

  const isOutgoing = type === 'outgoing';
  const entityLabel = isOutgoing ? 'العميل' : 'المورد';
  const entityName = isOutgoing ? order.customerName : order.supplierName;
  const invoiceTitle = isOutgoing ? 'فاتورة مبيعات' : 'فاتورة مشتريات';
  
  // Format sequential ID if needed, though order.id is already formatted like IN-1234 or OUT-1234
  // We can prefix it with INV- if they specifically want INV-
  const invoiceId = `INF-${order.id.replace(/[^0-9]/g, '')}`;

  return createPortal(
    <div className="print-only fixed inset-0 bg-white z-[9999] text-black p-8 font-Cairo dir-rtl">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-200 pb-6 mb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 mb-2">المجد</h1>
          <p className="text-slate-500 font-Tajawal font-bold text-sm">لإدارة المخازن والتجارة العامة</p>
        </div>
        <div className="text-left">
          <h2 className="text-3xl font-black text-slate-800 mb-2">{invoiceTitle}</h2>
          <p className="text-slate-600 font-bold">رقم الفاتورة: <span className="text-black">{invoiceId}</span></p>
          <p className="text-slate-600 font-bold">التاريخ: <span className="text-black">{formatDate(order.createdAt)}</span></p>
        </div>
      </div>

      {/* Customer/Supplier Info */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-8 flex justify-between">
        <div>
          <p className="text-sm text-slate-500 font-bold mb-1">بيانات {entityLabel}</p>
          <p className="text-xl font-black text-slate-800">{entityName}</p>
        </div>
        <div className="text-left">
          <p className="text-sm text-slate-500 font-bold mb-1">حالة الفاتورة</p>
          <p className="text-xl font-black text-slate-800">
            {order.status === 'completed' ? 'مكتملة' : order.status === 'partial' ? 'سداد جزئي' : 'غير مسددة'}
          </p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-slate-100">
            <th className="py-3 px-4 text-right font-bold text-slate-700 border-b-2 border-slate-200">المنتج</th>
            <th className="py-3 px-4 text-center font-bold text-slate-700 border-b-2 border-slate-200">الكمية</th>
            <th className="py-3 px-4 text-left font-bold text-slate-700 border-b-2 border-slate-200">سعر الوحدة</th>
            <th className="py-3 px-4 text-left font-bold text-slate-700 border-b-2 border-slate-200">الإجمالي</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item: any, idx: number) => (
            <tr key={idx} className="border-b border-slate-100">
              <td className="py-4 px-4 text-right font-bold text-slate-800">{item.productName || item.productId}</td>
              <td className="py-4 px-4 text-center font-bold text-slate-800">{item.qty}</td>
              <td className="py-4 px-4 text-left font-bold text-slate-800 tabular-nums">{formatCurrency(item.unitPrice)}</td>
              <td className="py-4 px-4 text-left font-bold text-slate-800 tabular-nums">{formatCurrency(item.qty * item.unitPrice)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-12">
        <div className="w-1/2 bg-slate-50 p-6 rounded-xl border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-slate-600">إجمالي الفاتورة:</span>
            <span className="font-black text-xl text-slate-800 tabular-nums">{formatCurrency(order.totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
            <span className="font-bold text-slate-600">المدفوع / المحصل:</span>
            <span className="font-bold text-lg text-slate-800 tabular-nums">
              {formatCurrency(isOutgoing ? order.amountCollected : order.amountPaid)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-slate-600">المبلغ المتبقي:</span>
            <span className="font-black text-xl text-slate-800 tabular-nums">
              {formatCurrency(isOutgoing ? order.amountRemaining : order.amountDue)}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto border-t-2 border-slate-200 pt-6 flex justify-between items-center">
        <p className="text-slate-500 font-bold text-sm">تم إصدار هذه الفاتورة بواسطة نظام المجد لإدارة المخازن</p>
        <div className="flex gap-16">
          <div className="text-center">
            <p className="text-slate-400 font-bold text-sm mb-4">توقيع المستلم</p>
            <div className="w-32 border-b border-slate-300"></div>
          </div>
          <div className="text-center">
            <p className="text-slate-400 font-bold text-sm mb-4">توقيع المسئول</p>
            <div className="w-32 border-b border-slate-300"></div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
