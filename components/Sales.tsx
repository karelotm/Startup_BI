import React, { useState, useMemo } from 'react';
import { Sale, Product, Customer } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import Modal from './Modal';
import { ExportIcon } from './icons/ExportIcon';
import { TrashIcon } from './icons/TrashIcon';
import { exportToCsv } from '../utils/csvExport';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SalesProps {
  sales: Sale[];
  products: Product[];
  customers: Customer[];
  onAddSale: (sale: Omit<Sale, 'id'>) => void;
  onDeleteSales: (saleIds: string[]) => void;
}

type DateRange = 'all' | '30d' | 'quarter' | 'year';

const Sales: React.FC<SalesProps> = ({ sales, products, customers, onAddSale, onDeleteSales }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSales, setSelectedSales] = useState<string[]>([]);

  // Form State
  const [customerId, setCustomerId] = useState('');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');

  const filteredSales = useMemo(() => {
    const now = new Date();
    let startDate: Date | null = null;
    
    switch(dateRangeFilter) {
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
      default:
        startDate = null;
        break;
    }

    return sales.filter(sale => {
      const dateMatch = !startDate || new Date(sale.date) >= startDate;
      const searchMatch = sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          sale.productName.toLowerCase().includes(searchTerm.toLowerCase());
      return dateMatch && searchMatch;
    });
  }, [sales, searchTerm, dateRangeFilter]);
  
  const chartData = useMemo(() => {
    const monthlyTotals: { [key: string]: number } = {};
    filteredSales.forEach(sale => {
      const month = new Date(sale.date).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!monthlyTotals[month]) {
        monthlyTotals[month] = 0;
      }
      monthlyTotals[month] += sale.totalPrice;
    });

    return Object.entries(monthlyTotals)
      .map(([name, total]) => ({ name, total, date: new Date(name) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(({ name, total }) => ({ name, Sales: total }));
  }, [filteredSales]);

  const groupedAndFilteredSales = useMemo(() => {
    return filteredSales.reduce((acc, sale) => {
      const month = new Date(sale.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(sale);
      return acc;
    }, {} as Record<string, Sale[]>);
  }, [filteredSales]);

  const sortedMonths = Object.keys(groupedAndFilteredSales).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const resetForm = () => {
    setCustomerId(customers[0]?.id || '');
    setProductId(products[0]?.id || '');
    setQuantity('1');
  };
  
  const handleOpenModal = () => {
    if(customers.length > 0 && products.length > 0) {
        resetForm();
        setIsModalOpen(true);
    } else {
        alert("Please add customers and products before creating a sale.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === productId);
    const customer = customers.find(c => c.id === customerId);
    
    if (product && customer && quantity) {
      const quant = parseInt(quantity, 10);
      onAddSale({
        date: new Date().toISOString().split('T')[0],
        productId: product.id,
        productName: product.name,
        customerId: customer.id,
        customerName: customer.name,
        quantity: quant,
        totalPrice: quant * product.price,
      });
      setIsModalOpen(false);
    }
  };

  const handleExportAll = () => {
    const dataToExport = filteredSales.map(s => ({
        Date: new Date(s.date).toLocaleDateString(),
        Customer: s.customerName,
        Product: s.productName,
        Quantity: s.quantity,
        TotalPrice: s.totalPrice.toFixed(2),
    }));
    exportToCsv('sales_export', dataToExport);
  };
  
  const handleSelectSale = (id: string) => {
    setSelectedSales(prev =>
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };
  
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedSales.length} selected sales?`)) {
        onDeleteSales(selectedSales);
        setSelectedSales([]);
    }
  };

  const handleBulkExport = () => {
    const dataToExport = sales
        .filter(s => selectedSales.includes(s.id))
        .map(s => ({
            Date: new Date(s.date).toLocaleDateString(),
            Customer: s.customerName,
            Product: s.productName,
            Quantity: s.quantity,
            TotalPrice: s.totalPrice.toFixed(2),
        }));
    exportToCsv(`sales_selection_${new Date().toISOString().split('T')[0]}`, dataToExport);
  };

  return (
    <>
    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Sale">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="customer" className="block text-sm font-medium text-slate-700 mb-1">Customer</label>
            <select id="customer" value={customerId} onChange={e => setCustomerId(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="product" className="block text-sm font-medium text-slate-700 mb-1">Product</label>
            <select id="product" value={productId} onChange={e => setProductId(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
              {products.map(p => <option key={p.id} value={p.id}>{p.name} - ${p.price.toFixed(2)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
            <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} required min="1" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600">Add Sale</button>
          </div>
        </form>
    </Modal>

    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Sales Records</h2>
          <p className="text-slate-500">Review and search your sales history.</p>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={handleExportAll} className="bg-white text-slate-700 font-semibold py-2 px-4 rounded-lg shadow-sm border border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center">
              <ExportIcon className="h-5 w-5 mr-2" />
              Export CSV
            </button>
            <button onClick={handleOpenModal} className="bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-600 transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              Add Sale
            </button>
        </div>
      </div>

       <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-grow">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <SearchIcon className="h-5 w-5 text-slate-400" />
              </span>
              <input 
                type="text"
                placeholder="Search by customer or product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-full text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="w-full md:w-52">
              <select
                value={dateRangeFilter}
                onChange={(e) => setDateRangeFilter(e.target.value as DateRange)}
                className="w-full h-full px-4 py-2.5 border border-slate-300 rounded-full text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Time</option>
                <option value="30d">Last 30 Days</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>
            </div>
        </div>
        
        {selectedSales.length > 0 && (
            <div className="mb-4 bg-sky-100 border border-sky-300 rounded-lg p-3 flex justify-between items-center transition-all">
                <p className="font-semibold text-sky-800">{selectedSales.length} sale(s) selected</p>
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

        <div className="bg-white p-6 rounded-2xl shadow-sm mb-8">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">Sales Trend ({ {all: 'All Time', '30d': 'Last 30 Days', quarter: 'This Quarter', year: 'This Year'}[dateRangeFilter] })</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `$${(typeof value === 'number' ? value / 1000 : 0)}k`} />
                    <Tooltip
                        formatter={(value) => `$${(typeof value === 'number' ? value.toLocaleString() : 0)}`}
                        contentStyle={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            backdropFilter: 'blur(5px)',
                            border: '1px solid #e0e0e0',
                            borderRadius: '0.75rem',
                        }}
                    />
                    <Legend />
                    <Bar dataKey="Sales" fill="#0ea5e9" name="Total Sales" />
                </BarChart>
            </ResponsiveContainer>
        </div>


      <div className="space-y-8">
        {sortedMonths.length > 0 ? sortedMonths.map(month => {
          const monthlySales = groupedAndFilteredSales[month];
          if (monthlySales.length === 0) return null;

          return (
            <div key={month} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <h3 className="p-4 text-lg font-bold text-slate-700 bg-slate-50 border-b border-slate-200">{month}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200">
                        <tr>
                        <th className="p-4 w-4"><input type="checkbox" className="rounded border-slate-300 text-sky-500 focus:ring-sky-500" onChange={(e) => {
                            const monthSaleIds = monthlySales.map(s => s.id);
                            if(e.target.checked) {
                                setSelectedSales(prev => [...new Set([...prev, ...monthSaleIds])]);
                            } else {
                                setSelectedSales(prev => prev.filter(sId => !monthSaleIds.includes(sId)));
                            }
                        }}/></th>
                        <th className="p-4 font-semibold text-slate-600">Date</th>
                        <th className="p-4 font-semibold text-slate-600">Customer</th>
                        <th className="p-4 font-semibold text-slate-600">Product</th>
                        <th className="p-4 font-semibold text-slate-600">Quantity</th>
                        <th className="p-4 font-semibold text-slate-600">Total Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        {monthlySales.map((sale) => (
                        <tr key={sale.id} className={`border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition-colors ${selectedSales.includes(sale.id) ? 'bg-sky-100' : ''}`}>
                            <td className="p-4 w-4"><input type="checkbox" className="rounded border-slate-300 text-sky-500 focus:ring-sky-500" checked={selectedSales.includes(sale.id)} onChange={() => handleSelectSale(sale.id)} /></td>
                            <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(sale.date).toLocaleDateString()}</td>
                            <td className="p-4 text-slate-800 font-medium">{sale.customerName}</td>
                            <td className="p-4 text-slate-500">{sale.productName}</td>
                            <td className="p-4 text-slate-500">{sale.quantity}</td>
                            <td className="p-4 text-slate-800 font-medium">${sale.totalPrice.toLocaleString()}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
            </div>
          );
        }) : (
             <div className="text-center p-8 bg-white rounded-2xl shadow-sm">
                <p className="text-slate-500">No sales records match your criteria.</p>
            </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Sales;