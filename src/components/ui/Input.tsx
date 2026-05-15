import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={`flex flex-col gap-2 w-full ${className}`}>
      {label && <label className="text-[13px] font-bold text-slate-600 pr-1 font-Cairo text-right">{label}</label>}
      <div className="relative group">
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-accent-primary">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'}
            rounded-xl py-3 ${icon ? 'pr-11' : 'px-5'} pl-5
            text-slate-800 font-medium font-Tajawal placeholder:text-slate-400
            focus:outline-none focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/10
            transition-all duration-200
          `}
          {...props}
        />
      </div>
      {error && <span className="text-[11px] font-bold text-red-500 mt-0.5 px-1 font-Tajawal">{error}</span>}
    </div>
  );
};
