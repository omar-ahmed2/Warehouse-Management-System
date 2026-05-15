import React from 'react';

interface LoaderProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Loader: React.FC<LoaderProps> = ({ 
  fullScreen = false, 
  size = 'md' 
}) => {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  const spinner = (
    <div className={`${sizes[size]} border-[var(--border-color)] border-t-[var(--accent-primary)] rounded-full animate-spin`}></div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-bg-primary/80 backdrop-blur-md">
        <div className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center">
            {spinner}
            <p className="mt-4 text-accent-primary font-black animate-pulse font-Cairo tracking-wide text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 w-full">
      {spinner}
    </div>
  );
};


