import React from 'react';
import { FinancialAlert } from '../types';

interface AlertsProps {
    alerts: FinancialAlert[];
}

const severityStyles = {
    critical: {
        iconBg: 'bg-red-100',
        iconText: 'text-red-600',
        border: 'border-red-500',
    },
    warning: {
        iconBg: 'bg-yellow-100',
        iconText: 'text-yellow-600',
        border: 'border-yellow-500',
    },
    info: {
        iconBg: 'bg-sky-100',
        iconText: 'text-sky-600',
        border: 'border-sky-500',
    },
};

const AlertIcon: React.FC<{ severity: FinancialAlert['severity'] }> = ({ severity }) => {
    const Icon = () => {
        switch (severity) {
            case 'critical':
                return <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />;
            case 'warning':
                return <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />;
            case 'info':
                 return <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />;
        }
    }
    return (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
            <Icon />
        </svg>
    )
};


export const Alerts: React.FC<AlertsProps> = ({ alerts }) => {
    return (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {alerts.length > 0 ? (
                    alerts.map(alert => {
                        const styles = severityStyles[alert.severity];
                        return (
                            <div key={alert.id} className={`flex p-4 border-l-4 ${styles.border} border-b border-slate-100`}>
                                <div className={`flex-shrink-0 mr-4 h-10 w-10 rounded-full flex items-center justify-center ${styles.iconBg} ${styles.iconText}`}>
                                    <AlertIcon severity={alert.severity} />
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-slate-800">{alert.title}</p>
                                    <p className="text-xs text-slate-500 mt-1">{alert.message}</p>
                                    <p className="text-xs text-slate-400 mt-2">{new Date(alert.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="text-center p-8 text-slate-500">
                        <p className="text-sm">You're all caught up!</p>
                        <p className="text-xs mt-1">No new notifications.</p>
                    </div>
                )}
            </div>
        </div>
    );
};