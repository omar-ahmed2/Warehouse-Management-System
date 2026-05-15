import React from 'react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${className}`}>
      {label && <label className="text-[13px] font-bold text-slate-600 pr-1 font-Cairo">{label}</label>}
      <div className="relative group">
        <select
          className={`
            w-full appearance-none bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'}
            rounded-xl py-3 pr-4 pl-10
            text-slate-800 font-medium font-Tajawal focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10
            transition-all duration-200 cursor-pointer hover:bg-white hover:border-accent-primary/30
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-white py-2">
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-accent-primary transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </div>
      {error && <span className="text-[11px] font-bold text-red-500 mt-0.5 px-1 font-Tajawal">{error}</span>}
    </div>
  );
};
