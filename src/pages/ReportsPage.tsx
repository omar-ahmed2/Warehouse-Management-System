import React, { useState, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatCurrency';
import { formatDate } from '../utils/formatDate';
import { Table } from '../components/ui/Table';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { exportToExcel } from '../utils/exportExcel';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart, 
  Pie,
  AreaChart,
  Area
} from 'recharts';

export const ReportsPage: React.FC = () => {
  const { data } = useAppContext();
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  const tabs = [
    { id: 'sales', label: 'المبيعات', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg> },
    { id: 'purchases', label: 'المشتريات', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg> },
    { id: 'inventory', label: 'المخزون', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg> },
    { id: 'finance', label: 'المالية', icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg> },
  ];

  // ✅ دالة مساعدة: تحول تاريخ النهاية لآخر اليوم (23:59:59.999) عشان يبقى شاملاً
  const toEndOfDay = (dateStr: string): Date => {
    const d = new Date(dateStr);
    d.setHours(23, 59, 59, 999);
    return d;
  };

  const filteredOutgoing = useMemo(() => data.outgoingOrders.filter(o => {
    if (!dateRange.from || !dateRange.to) return true;
    const date = new Date(o.createdAt);
    // ✅ محلول: تاريخ البداية = 00:00، تاريخ النهاية = 23:59:59.999
    return date >= new Date(dateRange.from) && date <= toEndOfDay(dateRange.to);
  }), [data.outgoingOrders, dateRange]);

  const filteredIncoming = useMemo(() => data.incomingOrders.filter(o => {
    if (!dateRange.from || !dateRange.to) return true;
    const date = new Date(o.createdAt);
    // ✅ محلول: تاريخ البداية = 00:00، تاريخ النهاية = 23:59:59.999
    return date >= new Date(dateRange.from) && date <= toEndOfDay(dateRange.to);
  }), [data.incomingOrders, dateRange]);

  // Chart Data: Top Sellers
  const salesByProduct = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredOutgoing.forEach(order => {
        order.items.forEach(item => {
            const product = data.products.find(p => p.id === item.productId);
            if (product) {
                counts[product.name] = (counts[product.name] || 0) + item.qty;
            }
        });
    });
    return Object.entries(counts)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 6);
  }, [filteredOutgoing, data.products]);

  // Chart Data: Finance trend
  const financeTrend = useMemo(() => {
    const entriesByDate: Record<string, number> = {};
    data.financeEntries.forEach(e => {
        const d = formatDate(e.createdAt);
        entriesByDate[d] = (entriesByDate[d] || 0) + e.amount;
    });
    return Object.entries(entriesByDate)
        .map(([name, balance]) => ({ name, balance }))
        .slice(-7);
  }, [data.financeEntries]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
                <h1 className="text-3xl font-black text-slate-800 font-Cairo tracking-tight">التقارير والتحليلات</h1>
                <p className="text-slate-500 mt-2 font-Tajawal font-medium">نظرة شاملة على أداء النشاط التجاري والمخزون</p>
            </div>
            
            <div className="flex items-center gap-3">
                <Button 
                    variant="outline" 
                    className="rounded-2xl border-slate-200 bg-white shadow-sm font-Cairo font-bold flex items-center gap-2 px-6 hover:bg-slate-50"
                    onClick={() => exportToExcel(reportType === 'sales' ? filteredOutgoing : filteredIncoming, `report_${reportType}`)}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>تصدير Excel</span>
                </Button>
            </div>
        </div>

        <div className="bg-white p-2 rounded-3xl border border-slate-200 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
            <div className="flex flex-1 p-1 bg-slate-50 rounded-2xl gap-1">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setReportType(tab.id)}
                        className={`
                            flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-Cairo font-black text-sm
                            ${reportType === tab.id 
                                ? 'bg-white text-accent-primary shadow-md shadow-accent-primary/10' 
                                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}
                        `}
                    >
                        {tab.icon}
                        <span className="hidden sm:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 px-2 lg:border-r border-slate-100">
                <div className="flex items-center gap-2 group w-full sm:w-auto">
                    <span className="text-[11px] font-black font-Cairo text-slate-400 whitespace-nowrap">من:</span>
                    <input 
                        type="date" 
                        value={dateRange.from}
                        onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 font-Tajawal focus:outline-none focus:ring-4 focus:ring-accent-primary/10 hover:border-accent-primary/30 transition-all w-full sm:w-40"
                    />
                </div>
                <div className="flex items-center gap-2 group w-full sm:w-auto">
                    <span className="text-[11px] font-black font-Cairo text-slate-400 whitespace-nowrap">إلى:</span>
                    <input 
                        type="date" 
                        value={dateRange.to}
                        onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm text-slate-800 font-Tajawal focus:outline-none focus:ring-4 focus:ring-accent-primary/10 hover:border-accent-primary/30 transition-all w-full sm:w-40"
                    />
                </div>
            </div>
        </div>

        {reportType === 'sales' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
                    <h3 className="text-xl font-black font-Cairo text-slate-800 mb-8 flex items-center gap-3">
                        <span className="p-2 bg-accent-primary/10 text-accent-primary rounded-xl">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m19 11-4-7"/><path d="M2 11h20"/><path d="m20.9 11-.3 1.1c-.2.8-.9 1.4-1.7 1.4H5.1c-.8 0-1.5-.6-1.7-1.4L3.1 11"/><path d="m5 11 4-7"/><path d="M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
                        </span>
                        الأصناف الأكثر طلباً
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesByProduct}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600, fontFamily: 'Cairo' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                                <Tooltip 
                                    cursor={{ fill: 'transparent' }} 
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 16px' }} 
                                />
                                <Bar dataKey="qty" radius={[8, 8, 0, 0]} barSize={40}>
                                    {salesByProduct.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[32px] text-white flex flex-col justify-between shadow-xl shadow-slate-900/20 relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                   <h3 className="text-xl font-bold font-Cairo mb-6 relative z-10">ملخص الفترة</h3>
                   
                   <div className="space-y-6 relative z-10">
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                         <p className="text-slate-400 text-xs font-bold font-Cairo uppercase tracking-widest">إجمالي المبيعات</p>
                         <p className="text-3xl font-black mt-2 tabular-nums">{formatCurrency(filteredOutgoing.reduce((s,o) => s + o.totalAmount, 0))}</p>
                      </div>
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                         <p className="text-slate-400 text-xs font-bold font-Cairo uppercase tracking-widest">المحصل نقداً</p>
                         <p className="text-2xl font-bold mt-2 tabular-nums text-accent-success">{formatCurrency(filteredOutgoing.reduce((s,o) => s + o.amountCollected, 0))}</p>
                      </div>
                      <div className="bg-white/5 p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                         <p className="text-slate-400 text-xs font-bold font-Cairo uppercase tracking-widest">عدد الفواتير</p>
                         <p className="text-2xl font-bold mt-2 tabular-nums">{filteredOutgoing.length.toLocaleString('ar-EG')} فاتورة</p>
                      </div>
                   </div>

                   <p className="text-[10px] text-slate-500 mt-8 text-center italic relative z-10 font-Tajawal tracking-wide">بيانات تقريبية بناءً على الفلاتر المختارة</p>
                </div>
             </div>

             <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <h3 className="text-xl font-black font-Cairo text-slate-800">تفاصيل فواتير المبيعات</h3>
                    <span className="bg-accent-primary/10 text-accent-primary px-4 py-1.5 rounded-full text-xs font-bold font-Tajawal">{filteredOutgoing.length} فاتورة</span>
                </div>
                <Table 
                    columns={[
                    { key: 'id', header: 'رقم الفاتورة', render: (o) => <span className="font-mono text-xs font-bold text-slate-400">#{o.id.slice(-6).toUpperCase()}</span> },
                    { key: 'customerName', header: 'العميل', render: (o) => <div className="font-bold text-slate-800">{o.customerName}</div> },
                    { key: 'createdAt', header: 'التاريخ', render: (o) => <span className="text-slate-500 text-sm">{formatDate(o.createdAt)}</span> },
                    { key: 'totalAmount', header: 'الإجمالي', render: (o) => <span className="font-black text-slate-900">{formatCurrency(o.totalAmount)}</span> },
                    { key: 'amountCollected', header: 'المحصل', render: (o) => <span className="text-accent-success font-bold">{formatCurrency(o.amountCollected)}</span> },
                    { key: 'status', header: 'الحالة', render: (o) => (
                        <div className={`
                            inline-flex px-3 py-1 rounded-full text-[10px] font-black font-Cairo
                            ${o.totalAmount - o.amountCollected <= 0 ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}
                        `}>
                            {o.totalAmount - o.amountCollected <= 0 ? 'مسدد بالكامل' : 'متبقي أقساط'}
                        </div>
                    )},
                    ]} 
                    data={filteredOutgoing} 
                />
             </div>
          </div>
        )}

        {reportType === 'purchases' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="group bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                   <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>
                   </div>
                   <p className="text-[11px] font-black font-Cairo text-slate-400 uppercase tracking-widest mb-1">عدد التوريدات</p>
                   <p className="text-3xl font-black text-slate-800 tabular-nums">{filteredIncoming.length.toLocaleString('ar-EG')}</p>
                </div>
                
                <div className="group bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                   <div className="w-12 h-12 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H5a3.5 3.5 0 0 1 0 7H6"/></svg>
                   </div>
                   <p className="text-[11px] font-black font-Cairo text-slate-400 uppercase tracking-widest mb-1">إجمالي المشتريات</p>
                   <p className="text-3xl font-black text-amber-600 tabular-nums">{formatCurrency(filteredIncoming.reduce((s,o) => s + o.totalAmount, 0))}</p>
                </div>

                <div className="group bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300">
                   <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                   </div>
                   <p className="text-[11px] font-black font-Cairo text-slate-400 uppercase tracking-widest mb-1">إجمالي المدفوعات</p>
                   <p className="text-3xl font-black text-green-600 tabular-nums">{formatCurrency(filteredIncoming.reduce((s,o) => s + o.amountPaid, 0))}</p>
                </div>
             </div>

             <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="text-xl font-black font-Cairo text-slate-800">سجل فواتير التوريد</h3>
                </div>
                <Table 
                    columns={[
                    { key: 'id', header: 'الفاتورة', render: (o) => <span className="font-mono text-[10px] font-bold text-slate-400">#{o.id.slice(-6).toUpperCase()}</span> },
                    { key: 'supplierName', header: 'المورد', render: (o) => <div className="font-bold text-slate-800">{o.supplierName}</div> },
                    { key: 'createdAt', header: 'التاريخ', render: (o) => <span className="text-slate-500 text-sm font-Tajawal">{formatDate(o.createdAt)}</span> },
                    { key: 'totalAmount', header: 'القيمة', render: (o) => <span className="font-black text-slate-900">{formatCurrency(o.totalAmount)}</span> },
                    { key: 'amountPaid', header: 'المدفوع كاش', render: (o) => <span className="text-blue-500 font-bold">{formatCurrency(o.amountPaid)}</span> },
                    { key: 'due', header: 'المتبقي (آجل)', render: (o) => <span className="text-red-500 font-bold">{formatCurrency(o.totalAmount - o.amountPaid)}</span> },
                    ]} 
                    data={filteredIncoming} 
                />
             </div>
          </div>
        )}

        {reportType === 'inventory' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-48 h-48 bg-accent-teal/5 rounded-full -mr-24 -mt-24 group-hover:scale-125 transition-transform duration-1000"></div>
                   <div className="w-20 h-20 bg-accent-teal/10 text-accent-teal rounded-[28px] flex items-center justify-center mb-8 shadow-inner">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/></svg>
                   </div>
                   <p className="text-sm font-black font-Cairo text-slate-400 uppercase tracking-[0.2em] mb-3">القيمة الإجمالية للمخزن</p>
                   <p className="text-5xl font-black text-slate-900 font-Cairo tabular-nums">
                     {formatCurrency(data.inventory.reduce((s, i) => {
                       const product = data.products.find(p => p.id === i.productId);
                       return s + (i.currentQty * (product?.buyPrice || 0));
                     }, 0))}
                   </p>
                   <div className="flex items-center gap-2 mt-6 text-slate-500 font-Tajawal font-bold bg-slate-50 px-6 py-2 rounded-full border border-slate-100">
                      <span>إجمالي القطع المتوفرة:</span>
                      <span className="text-slate-800">{data.inventory.reduce((s,i) => s + i.currentQty, 0).toLocaleString('ar-EG')} قطعة</span>
                   </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                    <h3 className="text-xl font-black font-Cairo text-slate-800 mb-8">نسبة المخزون حسب الفئة</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.products.reduce((acc: any, p) => {
                                        const found = acc.find((a:any) => a.name === p.category);
                                        const qty = data.inventory.find(i => i.productId === p.id)?.currentQty || 0;
                                        if (found) found.value += qty;
                                        else acc.push({ name: p.category, value: qty });
                                        return acc;
                                    }, [])}
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {data.products.map((entry:any, index:number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={8} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                     contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                     itemStyle={{ fontFamily: 'Cairo', fontWeight: 800, fontSize: '12px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
             </div>

             <div className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden">
                <Table 
                    columns={[
                        { key: 'name', header: 'المنتج', render: (item: any) => (
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-accent-primary"></span>
                                <span className="font-bold text-slate-800">{data.products.find(p => p.id === item.productId)?.name}</span>
                            </div>
                        )},
                        { key: 'currentQty', header: 'الكمية المتوفرة', render: (item: any) => (
                            <div className="flex items-center gap-2">
                                <span className="font-black tabular-nums text-slate-900 text-lg">{item.currentQty.toLocaleString('ar-EG')}</span>
                                <span className="text-[10px] text-slate-400 font-bold uppercase">{data.products.find(p => p.id === item.productId)?.unit}</span>
                            </div>
                        )},
                        { key: 'totalValue', header: 'قيمة الرصيد', render: (item: any) => {
                            const product = data.products.find(p => p.id === item.productId);
                            return <span className="text-accent-teal font-black">{formatCurrency(item.currentQty * (product?.buyPrice || 0))}</span>;
                        }},
                        { key: 'health', header: 'حالة التوافر', render: (item: any) => {
                            const product = data.products.find(p => p.id === item.productId);
                            const low = item.currentQty <= (product?.minStock || 0);
                            return (
                                <div className={`inline-flex px-4 py-1.5 rounded-xl text-[10px] font-black font-Cairo ${low ? 'bg-red-50 text-red-500 ring-1 ring-red-100' : 'bg-green-50 text-green-500 ring-1 ring-green-100'}`}>
                                    {low ? 'مخزون منخفض' : 'متوفر بشكل جيد'}
                                </div>
                            );
                        }},
                    ]} 
                    data={data.inventory} 
                />
             </div>
          </div>
        )}

        {reportType === 'finance' && (
           <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="p-8 bg-white rounded-[32px] border border-green-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-[11px] font-black font-Cairo text-slate-400 uppercase tracking-widest mb-1 relative z-10">إجمالي الإيرادات</p>
                    <p className="text-3xl font-black mt-1 text-green-600 tabular-nums relative z-10">
                        {formatCurrency(data.financeEntries.filter(e => e.amount > 0).reduce((s,e) => s + e.amount, 0))}
                    </p>
                 </div>
                 <div className="p-8 bg-white rounded-[32px] border border-red-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-[11px] font-black font-Cairo text-slate-400 uppercase tracking-widest mb-1 relative z-10">إجمالي المصروفات</p>
                    <p className="text-3xl font-black mt-1 text-red-600 tabular-nums relative z-10">
                        {formatCurrency(data.financeEntries.filter(e => e.amount < 0).reduce((s,e) => s + Math.abs(e.amount), 0))}
                    </p>
                 </div>
                 <div className="p-8 bg-slate-900 rounded-[32px] shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                    <p className="text-[11px] font-black font-Cairo text-slate-400 uppercase tracking-widest mb-1 relative z-10">صافي السيولة النقدية</p>
                    <p className="text-3xl font-black mt-1 text-white tabular-nums relative z-10">
                        {formatCurrency(data.financeEntries.reduce((s,e) => s + e.amount, 0))}
                    </p>
                 </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-black font-Cairo text-slate-800 mb-8">حركة التدفقات المالية (آخر 7 أيام عمل)</h3>
                  <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={financeTrend}>
                              <defs>
                                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                  </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                              <Tooltip 
                                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                              />
                              <Area type="monotone" dataKey="balance" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorBalance)" />
                          </AreaChart>
                      </ResponsiveContainer>
                  </div>
              </div>
           </div>
        )}
      </div>
  );
};
