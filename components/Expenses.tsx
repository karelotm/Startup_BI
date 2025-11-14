import React, { useState, useMemo } from 'react';
import { Expense } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import { AllIcon } from './icons/AllIcon';
import { MarketingIcon } from './icons/MarketingIcon';
import { SoftwareIcon } from './icons/SoftwareIcon';
import { OfficeSuppliesIcon } from './icons/OfficeSuppliesIcon';
import { CloudIcon } from './icons/CloudIcon';
import Modal from './Modal';
import { ExportIcon } from './icons/ExportIcon';
import { TrashIcon } from './icons/TrashIcon';
import { exportToCsv } from '../utils/csvExport';


interface ExpensesProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpenses: (expenseIds: string[]) => void;
}

const categoryIcons: { [key: string]: React.ReactNode } = {
  'Marketing': <MarketingIcon className="h-5 w-5 mr-2" />,
  'Software': <SoftwareIcon className="h-5 w-5 mr-2" />,
  'Office Supplies': <OfficeSuppliesIcon className="h-5 w-5 mr-2" />,
  'Cloud Services': <CloudIcon className="h-5 w-5 mr-2" />,
  'default': <div className="h-5 w-5 mr-2" /> // placeholder
};

const Expenses: React.FC<ExpensesProps> = ({ expenses, onAddExpense, onDeleteExpenses }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpenses, setSelectedExpenses] = useState<string[]>([]);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Marketing');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');


  const categories = useMemo(() => ['all', ...Array.from(new Set(expenses.map(e => e.category)))], [expenses]);
  const uniqueCategories = useMemo(() => Array.from(new Set(expenses.map(e => e.category))), [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
        const searchMatch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
        const categoryMatch = categoryFilter === 'all' || expense.category === categoryFilter;
        return searchMatch && categoryMatch;
    });
  }, [expenses, searchTerm, categoryFilter]);

  const groupedAndFilteredExpenses = useMemo(() => {
    return filteredExpenses.reduce((acc, expense) => {
      const month = new Date(expense.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(expense);
      return acc;
    }, {} as Record<string, Expense[]>);
  }, [filteredExpenses]);

  const sortedMonths = Object.keys(groupedAndFilteredExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setCategory('Marketing');
    setDescription('');
    setAmount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(date && category && description && amount) {
        onAddExpense({
            date,
            category,
            description,
            amount: parseFloat(amount)
        });
        resetForm();
        setIsModalOpen(false);
    }
  };

  const handleExportAll = () => {
    const dataToExport = filteredExpenses.map(e => ({
        Date: new Date(e.date).toLocaleDateString(),
        Category: e.category,
        Description: e.description,
        Amount: e.amount.toFixed(2),
    }));
    exportToCsv('expenses_export', dataToExport);
  };
  
  const handleSelectExpense = (id: string) => {
    setSelectedExpenses(prev => 
      prev.includes(id) ? prev.filter(eId => eId !== id) : [...prev, id]
    );
  };
  
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedExpenses.length} selected expenses?`)) {
        onDeleteExpenses(selectedExpenses);
        setSelectedExpenses([]);
    }
  };
  
  const handleBulkExport = () => {
    const dataToExport = expenses
        .filter(e => selectedExpenses.includes(e.id))
        .map(e => ({
            Date: new Date(e.date).toLocaleDateString(),
            Category: e.category,
            Description: e.description,
            Amount: e.amount.toFixed(2),
        }));
    exportToCsv(`expenses_selection_${new Date().toISOString().split('T')[0]}`, dataToExport);
  };

  return (
    <>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Expense">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                        <input type="number" id="amount" value={amount} onChange={e => setAmount(e.target.value)} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                    </div>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                    <input type="text" id="description" value={description} onChange={e => setDescription(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
                </div>
               
                <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200">Cancel</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600">Add Expense</button>
                </div>
            </form>
        </Modal>

        <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
            <div>
            <h2 className="text-3xl font-bold text-slate-800">Expenses</h2>
            <p className="text-slate-500">Track and analyze your company's spending.</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={handleExportAll} className="bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center">
                    <ExportIcon className="h-5 w-5 mr-2" />
                    Export CSV
                </button>
                <button onClick={() => setIsModalOpen(true)} className="bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-600 transition-colors flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Add Expense
                </button>
            </div>
        </div>
        
        <div className="mb-6">
            <div className="relative mb-4">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <SearchIcon className="h-5 w-5 text-slate-400" />
                </span>
                <input 
                type="text"
                placeholder="Search by description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                {categories.map(cat => {
                    const isActive = categoryFilter === cat;
                    return (
                        <button 
                            key={cat} 
                            onClick={() => setCategoryFilter(cat)}
                            className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                                isActive 
                                ? 'bg-sky-500 text-white shadow' 
                                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            {cat === 'all' ? <AllIcon className="h-5 w-5 mr-2" /> : (categoryIcons[cat] || categoryIcons['default'])}
                            {cat === 'all' ? 'All Categories' : cat}
                        </button>
                    )
                })}
            </div>
        </div>
        
        {selectedExpenses.length > 0 && (
            <div className="mb-4 bg-sky-100 border border-sky-300 rounded-lg p-3 flex justify-between items-center transition-all">
                <p className="font-semibold text-sky-800">{selectedExpenses.length} expense(s) selected</p>
                <div className="flex gap-2">
                    <button onClick={handleBulkExport} className="bg-white text-slate-700 font-semibold py-2 px-3 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 text-sm flex items-center">
                        <ExportIcon className="h-4 w-4 mr-2"/> Export Selected
                    </button>
                    <button onClick={handleBulkDelete} className="bg-red-500 text-white font-semibold py-2 px-3 rounded-lg shadow-sm hover:bg-red-600 text-sm flex items-center">
                        <TrashIcon className="h-4 w-4 mr-2"/> Delete Selected
                    </button>
                </div>
            </div>
        )}

        <div className="space-y-8">
            {sortedMonths.map(month => {
            const monthlyExpenses = groupedAndFilteredExpenses[month];
            if (monthlyExpenses.length === 0) return null;

            return (
                <div key={month} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <h3 className="p-4 text-lg font-bold text-slate-700 bg-slate-50 border-b border-slate-200">{month}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                        <th className="p-4 w-4">
                            <input type="checkbox" className="rounded border-slate-300 text-sky-500 focus:ring-sky-500" onChange={(e) => {
                                const monthExpenseIds = monthlyExpenses.map(exp => exp.id);
                                if(e.target.checked) {
                                    setSelectedExpenses(prev => [...new Set([...prev, ...monthExpenseIds])]);
                                } else {
                                    setSelectedExpenses(prev => prev.filter(expId => !monthExpenseIds.includes(expId)));
                                }
                            }}/>
                        </th>
                        <th className="p-4 font-semibold text-slate-600">Date</th>
                        <th className="p-4 font-semibold text-slate-600">Category</th>
                        <th className="p-4 font-semibold text-slate-600">Description</th>
                        <th className="p-4 font-semibold text-slate-600">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlyExpenses.map((expense) => (
                        <tr key={expense.id} className={`border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors ${selectedExpenses.includes(expense.id) ? 'bg-sky-100' : ''}`}>
                            <td className="p-4 w-4"><input type="checkbox" className="rounded border-slate-300 text-sky-500 focus:ring-sky-500" checked={selectedExpenses.includes(expense.id)} onChange={() => handleSelectExpense(expense.id)}/></td>
                            <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(expense.date).toLocaleDateString()}</td>
                            <td className="p-4 text-slate-800 font-medium whitespace-nowrap">{expense.category}</td>
                            <td className="p-4 text-slate-500">{expense.description}</td>
                            <td className="p-4 text-slate-800 font-medium whitespace-nowrap">${expense.amount.toLocaleString()}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
                </div>
            );
            })}
        </div>
        </div>
    </>
  );
};

export default Expenses;