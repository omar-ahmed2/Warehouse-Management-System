import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';
import { useAppContext } from '../../context/AppContext';

export const RevenueChart: React.FC = () => {
  const { data: appData } = useAppContext();

  const chartData = useMemo(() => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    // Get last 6 months
    const now = new Date();
    const result = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthIndex = d.getMonth();
      const monthLabel = months[monthIndex];
      const year = d.getFullYear();

      const monthlyIncoming = appData.incomingOrders.filter(o => {
        const oDate = new Date(o.createdAt);
        return oDate.getMonth() === monthIndex && oDate.getFullYear() === year;
      }).reduce((sum, o) => sum + o.totalAmount, 0);

      const monthlyOutgoing = appData.outgoingOrders.filter(o => {
        const oDate = new Date(o.createdAt);
        return oDate.getMonth() === monthIndex && oDate.getFullYear() === year;
      }).reduce((sum, o) => sum + o.totalAmount, 0);

      result.push({
        month: monthLabel,
        incoming: monthlyIncoming,
        outgoing: monthlyOutgoing
      });
    }

    return result;
  }, [appData.incomingOrders, appData.outgoingOrders]);


  return (
    <div className="h-full w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-slate-800 font-Cairo">حركة الوارد والصادر</h3>
          <p className="text-xs text-slate-400 mt-1 font-Tajawal font-bold uppercase tracking-wider">مقارنة شهرية لقيم الفواتير</p>
        </div>
      </div>

      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600, fontFamily: 'Cairo' }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: '#cbd5e1' }} 
              hide
            />
            <Tooltip 
              cursor={{ fill: '#f8fafc', radius: 8 }}
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px 16px' }}
              itemStyle={{ fontFamily: 'Cairo', fontWeight: 700, fontSize: '12px' }}
            />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontFamily: 'Cairo', fontWeight: 700, fontSize: '11px', color: '#64748b' }}
            />
            <Bar 
                name="الواردات" 
                dataKey="incoming" 
                fill="#3b82f6" 
                radius={[6, 6, 0, 0]} 
                barSize={12} 
                className="hover:opacity-80 transition-opacity"
            />
            <Bar 
                name="الصادرات" 
                dataKey="outgoing" 
                fill="#10b981" 
                radius={[6, 6, 0, 0]} 
                barSize={12} 
                className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
