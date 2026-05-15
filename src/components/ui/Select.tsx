import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string | number;
  onChange: (e: { target: { value: string | number } }) => void;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  options, 
  value,
  onChange,
  error, 
  icon,
  className = '', 
  placeholder = 'اختر من القائمة...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string | number) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div className={`flex flex-col gap-2 w-full ${className} relative`} ref={containerRef}>
      {label && (
        <label className="text-[13px] font-bold text-slate-600 pr-1 font-Cairo text-right">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between bg-slate-50 border ${error ? 'border-red-500' : 'border-slate-200'}
            rounded-xl py-3 ${icon ? 'pr-11' : 'pr-5'} pl-4
            text-right transition-all duration-300 hover:bg-white hover:border-accent-primary/30
            shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-accent-primary/10
            ${isOpen ? 'border-accent-primary ring-4 ring-accent-primary/10 bg-white' : ''}
          `}
        >
          {icon && (
            <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${isOpen ? 'text-accent-primary' : 'text-slate-400'}`}>
              {icon}
            </div>
          )}
          
          <span className={`font-medium font-Tajawal text-sm truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-800'}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <motion.div 
            animate={{ rotate: isOpen ? 180 : 0 }}
            className={`text-slate-400 ${isOpen ? 'text-accent-primary' : ''}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </motion.div>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 5, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute z-[100] w-full bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden py-2"
            >
              {options.length === 0 ? (
                <div className="px-5 py-4 text-center text-slate-400 text-xs font-Tajawal">
                  لا توجد خيارات متاحة
                </div>
              ) : (
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleSelect(option.value)}
                      className={`
                        w-full text-right px-5 py-3 text-sm font-Tajawal transition-all flex items-center justify-between
                        ${value === option.value 
                          ? 'bg-accent-primary/5 text-accent-primary font-bold' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-accent-primary'}
                      `}
                    >
                      <span>{option.label}</span>
                      {value === option.value && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <span className="text-[11px] font-bold text-red-500 mt-0.5 px-1 font-Tajawal text-right">
          {error}
        </span>
      )}
    </div>
  );
};


