import React from 'react';

interface StatCardProps {
  title: string;
  description: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  textColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  description, 
  value, 
  icon, 
  color,
  textColor
}) => {
  return (
    <div className="bg-white border border-slate-100 rounded-[32px] p-6 flex flex-col justify-between group h-50 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50/50 rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>
      
      <div className="flex justify-start relative z-10">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center ${textColor || 'text-slate-600'} transition-all group-hover:shadow-lg duration-500`}>
          {icon}
        </div>
      </div>
      
      <div className="flex flex-col items-start mt-4 relative z-10">
        <h3 className="text-3xl font-black text-slate-800 font-Cairo block tabular-nums tracking-tight">
          {value}
        </h3>
        <p className="text-[13px] font-black font-Cairo text-slate-500 mt-1 uppercase tracking-wide">{title}</p>
        <p className="text-[10px] font-Tajawal font-bold text-slate-400 mt-1 opacity-80">{description}</p>
      </div>
    </div>
  );
};
