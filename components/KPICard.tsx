
import React from 'react';
import { KpiData } from '../types';

interface KPICardProps {
  data: KpiData;
  icon: React.ReactNode;
}

const KPICard: React.FC<KPICardProps> = ({ data, icon }) => {
  const { title, value, change, changeType } = data;
  const changeColor = changeType === 'positive' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
        <div className="bg-sky-100 text-sky-600 p-3 rounded-full">
          {icon}
        </div>
      </div>
      {change && (
        <div className="mt-4 flex items-center">
          <span className={`text-sm font-semibold ${changeColor}`}>{change}</span>
          <span className="text-xs text-slate-400 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default KPICard;
