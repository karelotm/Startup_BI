import React, { useState, useMemo } from 'react';
import { Customer, Sale } from '../types';
import Modal from './Modal';
import { SearchIcon } from './icons/SearchIcon';

interface CustomersProps {
  customers: Customer[];
  sales: Sale[];
  onAddCustomer: (customer: Omit<Customer, 'id' | 'totalSpent' | 'joinDate'>) => void;
}

const CustomerDetailModal: React.FC<{ customer: Customer; sales: Sale[]; onClose: () => void }> = ({ customer, sales, onClose }) => {
    const customerSales = sales.filter(s => s.customerId === customer.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const averageOrderValue = customerSales.length > 0 ? customer.totalSpent / customerSales.length : 0;

    return (
        <Modal isOpen={!!customer} onClose={onClose} title="Customer Details">
            <div className="space-y-4">
                <div className="p-4 bg-slate-100 rounded-lg">
                    <h3 className="text-lg font-bold text-sky-600">{customer.name}</h3>
                    <p className="text-sm text-slate-600">{customer.email}</p>
                    <p className="text-xs text-slate-500 mt-1">Customer since {new Date(customer.joinDate).toLocaleDateString()}</p>
                </div>
                 <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-slate-500">Total Spent</p>
                        <p className="text-xl font-bold text-slate-800">${customer.totalSpent.toLocaleString()}</p>
                    </div>
                     <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs font-semibold text-slate-500">Avg. Order Value</p>
                        <p className="text-xl font-bold text-slate-800">${averageOrderValue.toFixed(2)}</p>
                    </div>
                </div>
                <div>
                    <h4 className="text-lg font-bold text-slate-700 mb-2">Purchase History</h4>
                    <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
                        {customerSales.length > 0 ? (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="p-2 font-semibold text-slate-600">Date</th>
                                        <th className="p-2 font-semibold text-slate-600">Product</th>
                                        <th className="p-2 font-semibold text-slate-600">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customerSales.map(sale => (
                                        <tr key={sale.id} className="border-b last:border-0">
                                            <td className="p-2">{new Date(sale.date).toLocaleDateString()}</td>
                                            <td className="p-2">{sale.productName} (x{sale.quantity})</td>
                                            <td className="p-2">${sale.totalPrice.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="p-4 text-center text-slate-500">No purchases recorded for this customer yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    )
};


const Customers: React.FC<CustomersProps> = ({ customers, sales, onAddCustomer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [customers, searchTerm]);

  const resetForm = () => {
    setName('');
    setEmail('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(name && email) {
        onAddCustomer({ name, email });
        resetForm();
        setIsModalOpen(false);
    }
  };
  
  return (
    <>
    {selectedCustomer && <CustomerDetailModal customer={selectedCustomer} sales={sales} onClose={() => setSelectedCustomer(null)} />}

    <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Customer">
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="customer-name" className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input type="text" id="customer-name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="customer-email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" id="customer-email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600">Add Customer</button>
            </div>
        </form>
    </Modal>

    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <div>
            <h2 className="text-3xl font-bold text-slate-800">Customer Management</h2>
            <p className="text-slate-500">View and manage your customer relationships.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-sky-600 transition-colors flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Customer
        </button>
      </div>

       <div className="relative mb-6">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <SearchIcon className="h-5 w-5 text-slate-400" />
          </span>
          <input 
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-full text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 font-semibold text-slate-600">Name</th>
              <th className="p-4 font-semibold text-slate-600">Email</th>
              <th className="p-4 font-semibold text-slate-600">Join Date</th>
              <th className="p-4 font-semibold text-slate-600">Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} onClick={() => setSelectedCustomer(customer)} className="border-b border-slate-200 last:border-b-0 hover:bg-sky-50 transition-colors cursor-pointer">
                <td className="p-4 text-slate-800 font-medium whitespace-nowrap">{customer.name}</td>
                <td className="p-4 text-slate-500 whitespace-nowrap">{customer.email}</td>
                <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(customer.joinDate).toLocaleDateString()}</td>
                <td className="p-4 text-slate-800 font-medium whitespace-nowrap">${customer.totalSpent.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};

export default Customers;