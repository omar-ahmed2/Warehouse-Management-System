import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
  title: string;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, toggleSidebar }) => {
  const { user } = useAuth();
  
  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('ar-EG', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  }).format(today);

  return (
    <header className="h-20 bg-bg-primary/95 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Right Section: Toggle, Breadcrumbs and Title (In RTL) */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl text-text-muted hover:bg-white hover:text-accent-primary transition-all border border-transparent hover:border-border-color lg:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="17" y1="6" x2="3" y2="6"></line><line x1="21" y1="12" x2="3" y2="12"></line><line x1="19" y1="18" x2="3" y2="18"></line></svg>
        </button>
        
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-1 text-[11px] text-text-muted font-Tajawal">
             <span>الرئيسية</span>
             <span>&gt;</span>
             <span className="text-accent-secondary">{title}</span>
          </div>
          <h1 className="text-2xl font-bold font-Cairo text-accent-primary">{title}</h1>
        </div>
      </div>

      {/* Middle & Left Section */}
      <div className="flex items-center gap-8">
        {/* Date Display */}
        <div className="hidden lg:flex flex-col items-center">
            <span className="text-[11px] text-text-muted font-Tajawal tabular-nums">{formattedDate}</span>
            <span className="text-[10px] text-text-muted/60 font-sans tracking-widest uppercase">{today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center relative">
          <input 
            type="text" 
            placeholder="ابحث عن منتج، حركة..."
            className="w-64 bg-white border border-border-color rounded-xl py-2 px-4 pr-10 text-sm font-Tajawal focus:outline-none focus:ring-2 focus:ring-accent-primary/20 transition-all placeholder:text-text-muted/50"
          />
          <svg className="absolute right-3 text-text-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform border-4 border-white shadow-sm">
            {user?.name.substring(0, 1)}
          </div>
        </div>
      </div>
    </header>
  );
};
