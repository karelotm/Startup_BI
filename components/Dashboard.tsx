import React, { useMemo } from 'react';
import KPICard from './KPICard';
import { KpiData, Sale, Expense, Customer, Goal, Product } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import {
  CurrencyDollarIcon,
  ReceiptRefundIcon,
  ScaleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { GoalsIcon } from './icons/GoalsIcon';

interface DashboardProps {
  sales: Sale[];
  expenses: Expense[];
  customers: Customer[];
  goals: Goal[];
  products: Product[];
}

const ActiveGoalCard: React.FC<{ goal: Goal }> = ({ goal }) => {
    const progress = Math.min((goal.current / goal.target) * 100, 100);
    const isRevenue = goal.type === 'revenue' || goal.type === 'profit';

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 col-span-1 md:col-span-2">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">Active Goal</p>
                    <p className="text-xl font-bold text-slate-800">{goal.title}</p>
                </div>
                <div className="bg-sky-100 text-sky-600 p-3 rounded-full">
                    <GoalsIcon className="h-6 w-6" />
                </div>
            </div>
            <div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-sky-600">
                        {isRevenue ? `$${goal.current.toLocaleString()}` : goal.current.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-500">
                        Target: {isRevenue ? `$${goal.target.toLocaleString()}` : goal.target.toLocaleString()}
                    </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-sky-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
                <p className="text-right text-xs text-slate-400 mt-1">Due by {new Date(goal.deadline).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ sales, expenses, customers, goals, products }) => {
  const kpis = useMemo<KpiData[]>(() => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    
    return [
      {
        title: 'Total Revenue',
        value: `$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
      {
        title: 'Net Profit',
        value: `$${netProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        changeType: netProfit > 0 ? 'positive' : 'negative',
      },
    ];
  }, [sales, expenses]);
  
  const mrrData = useMemo(() => {
    const recurringProductIds = products.filter(p => p.isRecurring).map(p => p.id);
    const monthlyTotals: { [key: string]: number } = {};
    
    sales.forEach(sale => {
      if (recurringProductIds.includes(sale.productId)) {
        const month = new Date(sale.date).toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyTotals[month] = (monthlyTotals[month] || 0) + sale.totalPrice;
      }
    });

    return Object.entries(monthlyTotals)
      .map(([name, mrr]) => ({ name, mrr, date: new Date(name) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ name, mrr }) => ({ name, MRR: mrr }));
  }, [sales, products]);
  
  const ltvCacData = useMemo(() => {
    const monthlyData: { [key: string]: { revenue: number, marketingSpend: number, newCustomers: number } } = {};
    
    // Group sales, expenses, and new customers by month
    sales.forEach(sale => {
        const month = new Date(sale.date).toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyData[month] = monthlyData[month] || { revenue: 0, marketingSpend: 0, newCustomers: 0 };
        monthlyData[month].revenue += sale.totalPrice;
    });
    
    expenses.forEach(expense => {
        if(expense.category === 'Marketing') {
            const month = new Date(expense.date).toLocaleString('default', { month: 'short', year: '2-digit' });
            monthlyData[month] = monthlyData[month] || { revenue: 0, marketingSpend: 0, newCustomers: 0 };
            monthlyData[month].marketingSpend += expense.amount;
        }
    });

    customers.forEach(customer => {
        const month = new Date(customer.joinDate).toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyData[month] = monthlyData[month] || { revenue: 0, marketingSpend: 0, newCustomers: 0 };
        monthlyData[month].newCustomers += 1;
    });

    // Calculate cumulative values and LTV/CAC
    const sortedMonths = Object.keys(monthlyData).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
    
    let cumulativeRevenue = 0;
    let cumulativeCustomers = 0;

    return sortedMonths.map(month => {
        cumulativeRevenue += monthlyData[month].revenue;
        cumulativeCustomers += monthlyData[month].newCustomers;

        const ltv = cumulativeCustomers > 0 ? cumulativeRevenue / cumulativeCustomers : 0;
        const cac = monthlyData[month].newCustomers > 0 ? monthlyData[month].marketingSpend / monthlyData[month].newCustomers : 0;
        
        return { name: month, LTV: ltv, CAC: cac };
    });

  }, [sales, expenses, customers]);


  const icons = [
    <CurrencyDollarIcon className="h-6 w-6" />,
    <ScaleIcon className="h-6 w-6" />,
  ];
  
  const activeGoal = goals[0];

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">Dashboard</h2>
      <p className="text-slate-500 mb-8">Welcome back! Here's a snapshot of your business.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {activeGoal && <ActiveGoalCard goal={activeGoal} />}
        {kpis.map((kpi, index) => (
          <KPICard key={kpi.title} data={kpi} icon={icons[index]} />
        ))}
      </div>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Monthly Recurring Revenue (MRR)</h3>
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mrrData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(value) => `$${(typeof value === 'number' ? value / 1000 : 0)}k`} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid #e0e0e0',
                        borderRadius: '0.75rem',
                    }}
                    formatter={(value) => `$${(typeof value === 'number' ? value.toLocaleString() : '0')}`}
                />
                <Legend />
                <Bar dataKey="MRR" fill="#0ea5e9" name="MRR" />
            </BarChart>
            </ResponsiveContainer>
        </div>

         <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">LTV vs. CAC</h3>
            <ResponsiveContainer width="100%" height={300}>
            <LineChart data={ltvCacData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" tickFormatter={(value) => `$${(typeof value === 'number' ? value / 1000 : 0)}k`} />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(5px)',
                        border: '1px solid #e0e0e0',
                        borderRadius: '0.75rem',
                    }}
                    formatter={(value) => `$${(typeof value === 'number' ? value.toFixed(2).toLocaleString() : '0')}`}
                />
                <Legend />
                <Line type="monotone" dataKey="LTV" stroke="#059669" strokeWidth={2} name="Customer Lifetime Value" />
                <Line type="monotone" dataKey="CAC" stroke="#f43f5e" strokeWidth={2} name="Customer Acquisition Cost" />
            </LineChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;