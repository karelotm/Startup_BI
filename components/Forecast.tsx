import React, { useState, useCallback } from 'react';
import { getFinancialAnalysis } from '../services/geminiService';
import { AIAnalysis, Product, Sale, Expense, Customer, KpiAnalysis } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { CalendarIcon } from './icons/CalendarIcon';

interface ForecastProps {
    products: Product[];
    sales: Sale[];
    expenses: Expense[];
    customers: Customer[];
}

const DatePicker: React.FC<{ value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; label: string }> = ({ value, onChange, label }) => {
    return (
        <div className="relative">
            <label htmlFor={label} className="sr-only">{label}</label>
            <div className="flex items-center justify-between w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm">
                <span className="text-slate-700 sm:text-sm">
                    {new Date(value + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <CalendarIcon className="h-5 w-5 text-slate-500" />
            </div>
            <input
                id={label}
                type="date"
                value={value}
                onChange={onChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
        </div>
    );
};


const Forecast: React.FC<ForecastProps> = ({ products, sales, expenses, customers }) => {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // State for user assumptions
  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().split('T')[0];
  
  const [dateRange, setDateRange] = useState({ start: lastMonthStr, end: today });
  const [assumptions, setAssumptions] = useState('');

  const handleGenerateForecast = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await getFinancialAnalysis(products, sales, expenses, customers, { dateRange, notes: assumptions });
      setAnalysis(result);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [products, sales, expenses, customers, dateRange, assumptions]);

  const InfoCard: React.FC<{ title: string; children: React.ReactNode, icon: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm h-full">
      <div className="flex items-center mb-4">
        <div className="bg-sky-100 text-sky-600 p-2 rounded-full mr-3">{icon}</div>
        <h3 className="text-xl font-bold text-slate-800">{title}</h3>
      </div>
      {children}
    </div>
  );

  const KpiAnalysisCard: React.FC<{ kpiData: KpiAnalysis }> = ({ kpiData }) => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <div className="flex justify-between items-center">
            <p className="font-bold text-slate-700">{kpiData.kpi}</p>
            <p className="text-lg font-extrabold text-sky-600">{kpiData.value}</p>
        </div>
        <p className="text-sm text-slate-600 mt-2">{kpiData.analysis}</p>
        {kpiData.history && kpiData.history.length > 0 && (
            <div className="mt-4 h-24">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kpiData.history} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" horizontal={false} />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip contentStyle={{ fontSize: '12px', padding: '4px 8px', borderRadius: '0.5rem' }} />
                        <Line type="monotone" dataKey="value" stroke="#0ea5e9" strokeWidth={2} dot={false} name={kpiData.kpi} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )}
    </div>
  );

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">AI-Powered Strategic Analysis</h2>
            <p className="text-slate-500 mt-1">Leverage Gemini for a deep dive into your startup's financial future.</p>
        </div>
        <button 
            onClick={handleGenerateForecast}
            disabled={isLoading}
            className="mt-4 md:mt-0 bg-sky-500 text-white font-semibold py-2 px-6 rounded-lg shadow-md hover:bg-sky-600 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing...
            </>
          ) : 'Generate Analysis'}
        </button>
      </div>
      
      {/* Assumptions Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Customize Your Forecast</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Analysis Date Range</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <DatePicker 
                        label="Start Date"
                        value={dateRange.start} 
                        onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))} 
                    />
                    <DatePicker 
                        label="End Date"
                        value={dateRange.end} 
                        onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))} 
                    />
                </div>
            </div>
            <div>
                 <label htmlFor="assumptions" className="block text-sm font-medium text-slate-700 mb-2">Business Assumptions & Notes</label>
                 <textarea id="assumptions" value={assumptions} onChange={e => setAssumptions(e.target.value)} rows={3} placeholder="e.g., Launching new marketing campaign in August, expecting 20% market growth..." className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg shadow-sm text-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"></textarea>
            </div>
        </div>
      </div>


      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6" role="alert">{error}</div>}
      
      {!analysis && !isLoading && (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-slate-800">Ready for Strategic Insights?</h3>
            <p className="mt-1 text-sm text-slate-500">Customize your assumptions and click "Generate Analysis".</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm">
                <div className="flex items-center mb-4">
                    <div className="bg-sky-100 text-sky-600 p-2 rounded-full mr-3">
                         <svg xmlns="http://www.w.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">3-Month Forecast</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left mt-2">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 font-semibold text-slate-600 rounded-l-lg">Month</th>
                                <th className="p-3 font-semibold text-slate-600">Revenue</th>
                                <th className="p-3 font-semibold text-slate-600">Expenses</th>
                                <th className="p-3 font-semibold text-slate-600 rounded-r-lg">Profit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analysis.forecast.map(f => (
                                <tr key={f.month} className="border-b border-slate-200 last:border-0">
                                    <td className="p-3 font-medium text-slate-700">{f.month}</td>
                                    <td className="p-3 text-green-600">${f.revenue.toLocaleString()}</td>
                                    <td className="p-3 text-red-600">${f.expenses.toLocaleString()}</td>
                                    <td className={`p-3 font-bold ${f.profit >= 0 ? 'text-slate-800' : 'text-red-600'}`}>${f.profit.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <InfoCard title="Key Trends" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}>
                    <ul className="space-y-3 list-disc list-inside text-slate-600">
                        {analysis.trends.map((trend, i) => <li key={i}>{trend}</li>)}
                    </ul>
                </InfoCard>
                <InfoCard title="Actionable Recommendations" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}>
                    <ul className="space-y-3 list-disc list-inside text-slate-600">
                        {analysis.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                </InfoCard>
                 <InfoCard title="KPI Deep Dive" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}>
                    <div className="space-y-4">
                      {analysis.kpiAnalysis.map((kpi, i) => <KpiAnalysisCard key={i} kpiData={kpi} />)}
                    </div>
                </InfoCard>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <InfoCard title="Key Opportunities" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>}>
                    <ul className="space-y-3 list-disc list-inside text-slate-600">
                        {analysis.keyOpportunities.map((opp, i) => <li key={i}>{opp}</li>)}
                    </ul>
                </InfoCard>
                <InfoCard title="Potential Risks" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}>
                    <ul className="space-y-3 list-disc list-inside text-slate-600">
                        {analysis.potentialRisks.map((risk, i) => <li key={i}>{risk}</li>)}
                    </ul>
                </InfoCard>
            </div>
        </div>
      )}
    </div>
  );
};

export default Forecast;