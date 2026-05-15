import React from 'react';
import { StatCard } from '../components/dashboard/StatCard';
import { RevenueChart } from '../components/dashboard/RevenueChart';
import { LatestTransactions } from '../components/dashboard/LatestTransactions';
import { useAppContext } from '../context/AppContext';
import { formatCurrency } from '../utils/formatCurrency';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { data } = useAppContext();
  const totalProducts = data.products.length;

  const today = new Date();
  const formattedDate = today.toLocaleDateString('ar-EG', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // Category Distribution Data
  const categoryData = data.products.reduce((acc: any[], p) => {
    const found = acc.find(a => a.name === p.category);
    if (found) found.value++;
    else acc.push({ name: p.category, value: 1 });
    return acc;
  }, []);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black font-Cairo text-slate-400 uppercase tracking-[0.2em]">لوحة التحكم</p>
          <h2 className="text-4xl font-black font-Cairo text-slate-800 tracking-tight">
            مرحباً، {data.users[0]?.name.split(' ')[0] || 'عمر'} <span className="animate-pulse">👋</span>
          </h2>
          <p className="text-sm text-slate-500 font-Tajawal font-medium opacity-80">{formattedDate}</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
           <span className="text-[11px] font-black font-Cairo text-slate-600">النظام يعمل بشكل مثالي</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="حركات اليوم"
          description={`${data.incomingOrders.length} وارد - ${data.outgoingOrders.length} صادر`}
          value={(data.incomingOrders.length + data.outgoingOrders.length).toLocaleString('ar-EG')}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>}
          color="bg-blue-50"
          textColor="text-blue-500"
        />
        <StatCard 
          title="تنبيه المخزون"
          description="أصناف وصلت للحد الأدنى"
          value={data.inventory.filter(i => {
                const product = data.products.find(p => p.id === i.productId);
                return i.currentQty <= (product?.minStock || 0);
          }).length.toLocaleString('ar-EG')}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
          color="bg-amber-50"
          textColor="text-amber-500"
        />
        <StatCard 
          title="إجمالي المخزون"
          description="إجمالي الوحدات المتوفرة"
          value={data.inventory.reduce((acc, i) => acc + i.currentQty, 0).toLocaleString('ar-EG')}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>}
          color="bg-emerald-50"
          textColor="text-emerald-500"
        />
        <StatCard 
          title="الأصناف"
          description="أصناف مسجلة بالنظام"
          value={totalProducts.toLocaleString('ar-EG')}
          icon={<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>}
          color="bg-violet-50"
          textColor="text-violet-500"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Weekly Activity Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/30 transition-all duration-500">
            <RevenueChart />
        </div>

        {/* Category Circle Chart */}
        <div className="lg:col-span-4 bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent-primary/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <h3 className="text-xl font-bold font-Cairo mb-2 relative z-10">توزيع الأصناف</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-8 relative z-10">حسب الفئات المسجلة</p>
            
            <div className="h-[250px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={categoryData}
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {categoryData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} cornerRadius={4} />
                            ))}
                        </Pie>
                        <Tooltip 
                            contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#1e293b' }}
                            itemStyle={{ color: '#fff', fontFamily: 'Cairo', fontSize: '12px' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 relative z-10">
                {categoryData.slice(0, 4).map((cat, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        <span className="text-[10px] font-bold text-slate-400 truncate font-Cairo">{cat.name}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* Inventory Attention */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xl font-black font-Cairo text-slate-800">نواقص المخزون</h3>
             <div className="w-8 h-8 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
             </div>
          </div>
          
          <div className="flex-1 space-y-4">
             {data.inventory.filter(i => {
                const product = data.products.find(p => p.id === i.productId);
                return i.currentQty <= (product?.minStock || 0);
             }).slice(0, 4).map(item => {
                 const product = data.products.find(p => p.id === item.productId);
                 return (
                    <div key={item.productId} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-red-200 transition-colors">
                        <div>
                            <p className="text-sm font-bold text-slate-800 font-Cairo">{product?.name}</p>
                            <p className="text-[10px] text-slate-400 font-Tajawal mt-0.5">المتبقي: {item.currentQty} {product?.unit}</p>
                        </div>
                        <span className="text-xs font-black text-red-500 font-Cairo">اطلب الآن</span>
                    </div>
                 );
             })}

             {data.inventory.filter(i => {
                const product = data.products.find(p => p.id === i.productId);
                return i.currentQty <= (product?.minStock || 0);
             }).length === 0 && (
                <div className="h-full flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <p className="text-sm font-bold text-slate-400 font-Tajawal">لا توجد نواقص حالياً</p>
                </div>
             )}
          </div>
        </div>

        {/* Latest Transactions Table Placeholder */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-[40px] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black font-Cairo text-slate-800">آخر حركات المخازن</h3>
                <button className="text-xs font-black text-accent-primary font-Cairo bg-accent-primary/5 px-4 py-2 rounded-xl hover:bg-accent-primary/10 transition-colors">عرض السجل الكامل</button>
            </div>
           <LatestTransactions />
        </div>

      </div>
    </div>
  );
};
