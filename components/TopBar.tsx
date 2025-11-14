import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from './icons/BellIcon';
import { Alerts } from './Alerts';
import { FinancialAlert } from '../types';

interface TopBarProps {
    alerts: FinancialAlert[];
}

export const TopBar: React.FC<TopBarProps> = ({ alerts }) => {
    const [isAlertsOpen, setIsAlertsOpen] = useState(false);
    const alertsRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
                setIsAlertsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="sticky top-0 bg-slate-50/80 backdrop-blur-lg z-30 border-b border-slate-200">
            <div className="flex items-center justify-between h-16 px-8">
                {/* This could be a search bar or breadcrumbs in the future */}
                <div>
                   <h1 className="text-lg font-semibold text-slate-700">Startup BI Dashboard</h1>
                </div>

                <div className="relative" ref={alertsRef}>
                    <button 
                        onClick={() => setIsAlertsOpen(prev => !prev)}
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
                    >
                        <BellIcon className="h-6 w-6" />
                        {alerts.length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                                {alerts.length}
                            </span>
                        )}
                    </button>
                    {isAlertsOpen && <Alerts alerts={alerts} />}
                </div>
            </div>
        </header>
    );
}