import React, { useState, useMemo } from 'react';
import { Product, Sale } from '../types';
import { SearchIcon } from './icons/SearchIcon';
import Modal from './Modal';
import { ExportIcon } from './icons/ExportIcon';
import { TrashIcon } from './icons/TrashIcon';
import { exportToCsv } from '../utils/csvExport';

interface InventoryProps {
  products: Product[];
  sales: Sale[];
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onDeleteProducts: (productIds: string[]) => void;
}

const StockStatus: React.FC<{ quantity: number }> = ({ quantity }) => {
  let bgColor, textColor, text;
  if (quantity === 0) {
    bgColor = 'bg-red-100';
    textColor = 'text-red-700';
    text = 'Out of Stock';
  } else if (quantity < 20) {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-700';
    text = 'Low Stock';
  } else {
    bgColor = 'bg-green-100';
    textColor = 'text-green-700';
    text = 'In Stock';
  }

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${bgColor} ${textColor}`}>
      {text}
    </span>
  );
};

const ProductDetailModal: React.FC<{ product: Product; sales: Sale[]; onClose: () => void }> = ({ product, sales, onClose }) => {
    const productSales = sales.filter(s => s.productId === product.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <Modal isOpen={!!product} onClose={onClose} title="Product Details">
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 p-4 bg-slate-100 rounded-lg">
                    <div><span className="font-semibold text-slate-600">Name:</span> <p className="text-slate-800">{product.name}</p></div>
                    <div><span className="font-semibold text-slate-600">SKU:</span> <p className="text-slate-800">{product.sku}</p></div>
                    <div><span className="font-semibold text-slate-600">Price:</span> <p className="text-slate-800">${product.price.toFixed(2)}</p></div>
                    <div><span className="font-semibold text-slate-600">Quantity:</span> <p className="text-slate-800">{product.quantity}</p></div>
                    <div><span className="font-semibold text-slate-600">Recurring:</span> <p className="text-slate-800">{product.isRecurring ? 'Yes' : 'No'}</p></div>
                </div>
                <div>
                    <h4 className="text-lg font-bold text-slate-700 mb-2">Sales History</h4>
                    <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg">
                        {productSales.length > 0 ? (
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 sticky top-0">
                                    <tr>
                                        <th className="p-2 font-semibold text-slate-600">Date</th>
                                        <th className="p-2 font-semibold text-slate-600">Customer</th>
                                        <th className="p-2 font-semibold text-slate-600">Quantity</th>
                                        <th className="p-2 font-semibold text-slate-600">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {productSales.map(sale => (
                                        <tr key={sale.id} className="border-b last:border-0">
                                            <td className="p-2">{new Date(sale.date).toLocaleDateString()}</td>
                                            <td className="p-2">{sale.customerName}</td>
                                            <td className="p-2">{sale.quantity}</td>
                                            <td className="p-2">${sale.totalPrice.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="p-4 text-center text-slate-500">No sales recorded for this product yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const Inventory: React.FC<InventoryProps> = ({ products, sales, onAddProduct, onDeleteProducts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  
  // Form state
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const searchMatch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      
      const statusMatch = statusFilter === 'all' ||
        (statusFilter === 'in_stock' && product.quantity >= 20) ||
        (statusFilter === 'low_stock' && product.quantity > 0 && product.quantity < 20) ||
        (statusFilter === 'out_of_stock' && product.quantity === 0);

      return searchMatch && statusMatch;
    });
  }, [products, searchTerm, statusFilter]);

  const totalValue = useMemo(() => {
    return filteredProducts.reduce((sum, product) => sum + (product.quantity * product.price), 0);
  }, [filteredProducts]);

  const resetForm = () => {
    setName('');
    setSku('');
    setPrice('');
    setQuantity('');
    setIsRecurring(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && sku && price && quantity) {
      onAddProduct({
        name,
        sku,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        isRecurring,
      });
      resetForm();
      setIsModalOpen(false);
    }
  };

  const handleExportAll = () => {
    const dataToExport = filteredProducts.map(p => ({
        Name: p.name,
        SKU: p.sku,
        Price: p.price,
        Quantity: p.quantity,
        Value: (p.quantity * p.price).toFixed(2),
        Recurring: p.isRecurring ? 'Yes' : 'No',
    }));
    exportToCsv('inventory_export', dataToExport);
  };
  
  const handleSelectProduct = (id: string) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProducts(filteredProducts.map(p => p.id));
    } else {
      setSelectedProducts([]);
    }
  };
  
  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.length} selected products? This action cannot be undone.`)) {
        onDeleteProducts(selectedProducts);
        setSelectedProducts([]);
    }
  };
  
  const handleBulkExport = () => {
    const dataToExport = products
        .filter(p => selectedProducts.includes(p.id))
        .map(p => ({
            Name: p.name,
            SKU: p.sku,
            Price: p.price,
            Quantity: p.quantity,
            Value: (p.quantity * p.price).toFixed(2),
            Recurring: p.isRecurring ? 'Yes' : 'No',
        }));
    exportToCsv(`inventory_selection_${new Date().toISOString().split('T')[0]}`, dataToExport);
  };

  return (
    <>
      {selectedProduct && <ProductDetailModal product={selectedProduct} sales={sales} onClose={() => setSelectedProduct(null)} />}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
            <input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-slate-700 mb-1">SKU</label>
            <input type="text" id="sku" value={sku} onChange={e => setSku(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-slate-700 mb-1">Price</label>
              <input type="number" id="price" value={price} onChange={e => setPrice(e.target.value)} required min="0" step="0.01" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">Quantity</label>
              <input type="number" id="quantity" value={quantity} onChange={e => setQuantity(e.target.value)} required min="0" className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm" />
            </div>
          </div>
           <div className="flex items-center">
                <input
                    id="isRecurring"
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                />
                <label htmlFor="isRecurring" className="ml-2 block text-sm text-slate-900">
                    This is a recurring subscription product.
                </label>
            </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 border border-slate-300 rounded-lg hover:bg-slate-200">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-sky-500 rounded-lg hover:bg-sky-600">Add Product</button>
          </div>
        </form>
      </Modal>

      <div className="p-8">
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
          <div>
              <h2 className="text-3xl font-bold text-slate-800">Inventory</h2>
              <p className="text-slate-500">Search, filter, and manage your product stock.</p>
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
              Add Product
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
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-full text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="w-full md:w-52">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-full px-4 py-2.5 border border-slate-300 rounded-full text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All Statuses</option>
                <option value="in_stock">In Stock</option>
                <option value="low_stock">Low Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>
        </div>

        {selectedProducts.length > 0 && (
          <div className="mb-4 bg-sky-100 border border-sky-300 rounded-lg p-3 flex justify-between items-center transition-all animate-fade-in-down">
              <p className="font-semibold text-sky-800">{selectedProducts.length} product(s) selected</p>
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
        
        <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 w-4">
                  <input 
                    type="checkbox"
                    className="rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                    checked={filteredProducts.length > 0 && selectedProducts.length === filteredProducts.length}
                    onChange={handleSelectAll}
                    disabled={filteredProducts.length === 0}
                  />
                </th>
                <th className="p-4 font-semibold text-slate-600">Product Name</th>
                <th className="p-4 font-semibold text-slate-600">SKU</th>
                <th className="p-4 font-semibold text-slate-600">Price</th>
                <th className="p-4 font-semibold text-slate-600">Quantity</th>
                <th className="p-4 font-semibold text-slate-600">Status</th>
                <th className="p-4 font-semibold text-slate-600">Value</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                <tr key={product.id} className={`border-b border-slate-200 last:border-b-0 hover:bg-sky-50 transition-colors ${selectedProducts.includes(product.id) ? 'bg-sky-100' : ''}`}>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    <input 
                      type="checkbox"
                      className="rounded border-slate-300 text-sky-500 focus:ring-sky-500"
                      checked={selectedProducts.includes(product.id)}
                      onChange={() => handleSelectProduct(product.id)}
                    />
                  </td>
                  <td onClick={() => setSelectedProduct(product)} className="p-4 text-slate-800 font-medium cursor-pointer">{product.name}</td>
                  <td onClick={() => setSelectedProduct(product)} className="p-4 text-slate-500 cursor-pointer">{product.sku}</td>
                  <td onClick={() => setSelectedProduct(product)} className="p-4 text-slate-500 cursor-pointer">${product.price.toFixed(2)}</td>
                  <td onClick={() => setSelectedProduct(product)} className="p-4 text-slate-500 cursor-pointer">{product.isRecurring ? 'N/A' : product.quantity}</td>
                  <td onClick={() => setSelectedProduct(product)} className="p-4 cursor-pointer">{product.isRecurring ? <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">Recurring</span> : <StockStatus quantity={product.quantity} />}</td>
                  <td onClick={() => setSelectedProduct(product)} className="p-4 text-slate-800 font-medium cursor-pointer">{product.isRecurring ? 'N/A' : `$${(product.quantity * product.price).toLocaleString()}`}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center p-8 text-slate-500">
                    No products match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-slate-100 border-t-2 border-slate-300">
                <tr>
                    <td colSpan={6} className="p-4 font-bold text-slate-700 text-right">Total Inventory Value:</td>
                    <td className="p-4 font-extrabold text-slate-800">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </>
  );
};

export default Inventory;