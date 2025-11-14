import React from 'react';
import { DashboardIcon } from './icons/DashboardIcon';
import { InventoryIcon } from './icons/InventoryIcon';
import { ExpensesIcon } from './icons/ExpensesIcon';
import { ForecastIcon } from './icons/ForecastIcon';
import { SalesIcon } from './icons/SalesIcon';
import { CustomersIcon } from './icons/CustomersIcon';
import { GoalsIcon } from './icons/GoalsIcon';
import { ChevronDoubleLeftIcon } from './icons/ChevronDoubleLeftIcon';

type View = 'dashboard' | 'inventory' | 'sales' | 'expenses' | 'customers' | 'forecast' | 'goals';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isCollapsed: boolean;
  onToggle: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, isCollapsed, onClick }) => (
  <li className="relative group">
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      className={`flex items-center p-3 rounded-lg text-slate-900 transition-colors duration-200 ${
        isActive ? 'bg-sky-500 text-white shadow-md' : 'hover:bg-sky-100'
      } ${isCollapsed ? 'justify-center' : ''}`}
    >
      <span className={!isCollapsed ? 'mr-4' : ''}>{icon}</span>
      <span className={`font-medium whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>{label}</span>
    </a>
    {isCollapsed && (
        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {label}
        </div>
    )}
  </li>
);

export const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isCollapsed, onToggle }) => {
  const navItems = [
    { view: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { view: 'inventory', label: 'Inventory', icon: <InventoryIcon /> },
    { view: 'sales', label: 'Sales', icon: <SalesIcon /> },
    { view: 'expenses', label: 'Expenses', icon: <ExpensesIcon /> },
    { view: 'customers', label: 'Customers', icon: <CustomersIcon /> },
    { view: 'goals', label: 'Goals', icon: <GoalsIcon /> },
  ] as const;

  const aiNavItem = { view: 'forecast', label: 'AI Forecast', icon: <ForecastIcon /> } as const;

  return (
    <aside className={`bg-white shadow-lg p-4 flex flex-col h-screen fixed z-40 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      <div className={`flex items-center mb-10 p-2 transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="bg-sky-500 p-2 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <h1 className={`text-2xl font-bold text-slate-800 ml-3 whitespace-nowrap transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>StartUpBI</h1>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-3">
            {navItems.map(item => (
                 <NavItem 
                    key={item.view}
                    icon={item.icon} 
                    label={item.label} 
                    isActive={activeView === item.view} 
                    onClick={() => setActiveView(item.view)} 
                    isCollapsed={isCollapsed}
                />
            ))}
          
          <div className="pt-4 mt-4 border-t border-slate-200"></div>
           <NavItem 
                icon={aiNavItem.icon} 
                label={aiNavItem.label} 
                isActive={activeView === aiNavItem.view} 
                onClick={() => setActiveView(aiNavItem.view)} 
                isCollapsed={isCollapsed}
            />
        </ul>
      </nav>
      <div>
        <div className={`text-center transition-opacity duration-300 ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100 h-auto p-4 mb-4 bg-slate-50 rounded-lg border border-slate-200'}`}>
            <p className="text-sm text-slate-600">
                Inspired by <strong>Karim EL OTMANI</strong>.
            </p>
        </div>
        <div className="pt-4 border-t border-slate-200">
             <button
                onClick={onToggle}
                className="w-full flex items-center justify-center p-3 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                <ChevronDoubleLeftIcon className={`h-6 w-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
        </div>
      </div>
    </aside>
  );
};
