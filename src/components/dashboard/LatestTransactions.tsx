import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Badge } from '../ui/Badge';
import { formatCurrency } from '../../utils/formatCurrency';
import { formatDate } from '../../utils/formatDate';

export const LatestTransactions: React.FC = () => {
  const { data } = useAppContext();
  
  // Combine incoming and outgoing orders for a unified activity list
  const activities = [
    ...data.incomingOrders.map(o => ({
      id: o.id,
      type: 'وارد',
      productId: o.items[0]?.productId || '', // Modern schema uses items array
      total: o.items.reduce((s, i) => s + i.qty, 0),
      createdAt: o.createdAt,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      dot: 'bg-emerald-500'
    })),
    ...data.outgoingOrders.map(o => ({
      id: o.id,
      type: 'صادر',
      productId: o.items[0]?.productId || '',
      total: o.items.reduce((s, i) => s + i.qty, 0),
      createdAt: o.createdAt,
      color: 'bg-blue-50 text-blue-600 border-blue-100',
      dot: 'bg-blue-500'
    }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
   .slice(0, 6);

  const getProductName = (id: string) => {
    const p = data.products.find(p => p.id === id);
    return p ? p.name : 'منتجات متعددة';
  };

  const getTimeAgo = (dateStr: string) => {
     const date = new Date(dateStr);
     const diff = new Date().getTime() - date.getTime();
     const minutes = Math.floor(diff / (1000 * 60));
     const hours = Math.floor(minutes / 60);
     
     if (minutes < 60) return `منذ ${minutes} دقيقة`;
     if (hours < 24) return `منذ ${hours} ساعة`;
     return `منذ ${Math.floor(hours / 24)} يوم`;
  };

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="text-[10px] font-black font-Cairo text-slate-400 uppercase tracking-widest border-b border-slate-50">
             <tr>
                <th className="pb-4 text-right pr-4">النوع</th>
                <th className="pb-4 text-right">المنتج الرئيسي</th>
                <th className="pb-4 text-center">الكمية</th>
                <th className="pb-4 text-center">التوقيت</th>
             </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
             {activities.length === 0 ? (
                <tr>
                   <td colSpan={4} className="py-12 text-center text-sm font-bold text-slate-300 font-Tajawal">لا توجد حركات مسجلة مؤخراً</td>
                </tr>
             ) : (
                activities.map((act) => (
                   <tr key={act.id} className="group hover:bg-slate-50 transition-all duration-300">
                      <td className="py-5 pr-4">
                         <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black font-Cairo border ${act.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${act.dot}`}></span>
                            {act.type}
                         </div>
                      </td>
                      <td className="py-5">
                         <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-800 font-Cairo tracking-tight">{getProductName(act.productId)}</span>
                            <span className="text-[10px] font-bold text-slate-400 font-mono opacity-60">#{act.id.slice(-6).toUpperCase()}</span>
                         </div>
                      </td>
                      <td className="py-5 text-center">
                        <span className="text-sm font-black text-slate-900 tabular-nums bg-slate-100/50 px-3 py-1 rounded-lg border border-slate-100">{act.total}</span>
                      </td>
                      <td className="py-5 text-center">
                         <span className="text-[10px] font-black text-slate-400 font-Tajawal bg-slate-50 px-3 py-1 rounded-full">{getTimeAgo(act.createdAt)}</span>
                      </td>
                   </tr>
                ))
             )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
