import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Expenses from './components/Expenses';
import Forecast from './components/Forecast';
import Sales from './components/Sales';
import Customers from './components/Customers';
import Goals from './components/Goals';
import { TopBar } from './components/TopBar';
import { Product, Expense, Sale, Customer, FinancialAlert, Goal } from './types';
import { getFinancialAlerts } from './services/geminiService';

// Mock Data
const mockProducts: Product[] = [
  { id: 'p1', name: 'SaaS Platform - Pro Monthly', sku: 'SaaS-PRO-M', quantity: 9999, price: 49.99, isRecurring: true },
  { id: 'p2', name: 'SaaS Platform - Business Monthly', sku: 'SaaS-BUS-M', quantity: 9999, price: 99.99, isRecurring: true },
  { id: 'p3', name: 'Data Analytics Suite - One Time', sku: 'DAS-OTO-01', quantity: 42, price: 499.00 },
  { id: 'p4', name: 'Cloud Storage - 1TB', sku: 'CS-1TB-01', quantity: 250, price: 9.99 },
  { id: 'p5', name: 'Implementation & Setup Fee', sku: 'SETUP-FEE', quantity: 9999, price: 1500.00 },
  { id: 'p6', name: 'Hourly Consulting', sku: 'CONSULT-HR', quantity: 800, price: 150.00 },
];

const mockCustomers: Customer[] = [
    { id: 'c1', name: 'Innovate Corp', email: 'contact@innovate.com', totalSpent: 0, joinDate: '2024-03-10' },
    { id: 'c2', name: 'Data Solutions Ltd', email: 'hello@datasolutions.com', totalSpent: 0, joinDate: '2024-04-05' },
    { id: 'c3', name: 'CloudFive Hosting', email: 'support@cloudfive.com', totalSpent: 0, joinDate: '2024-04-22' },
    { id: 'c4', name: 'QuantumLeap Tech', email: 'qlt@example.com', totalSpent: 0, joinDate: '2024-05-18' },
    { id: 'c5', name: 'Pioneer Dynamics', email: 'pd@example.com', totalSpent: 0, joinDate: '2024-06-02' },
    { id: 'c6', name: 'NextGen Systems', email: 'ngs@example.com', totalSpent: 0, joinDate: '2024-06-15' },
    { id: 'c7', name: 'Vertex Industries', email: 'vi@example.com', totalSpent: 0, joinDate: '2024-07-01' },
    { id: 'c8', name: 'Apex Innovations', email: 'ai@example.com', totalSpent: 0, joinDate: '2024-07-20' },
];

const mockExpenses: Expense[] = [
  // July
  { id: 'e1', date: '2024-07-01', category: 'Marketing', description: 'Google Ads Campaign', amount: 2500 },
  { id: 'e2', date: '2024-07-05', category: 'Software', description: 'Figma Subscription', amount: 150 },
  { id: 'e3', date: '2024-07-15', category: 'Office Supplies', description: 'New Monitors', amount: 800 },
  { id: 'e10', date: '2024-07-20', category: 'Cloud Services', description: 'AWS Hosting - July', amount: 3500 },
  { id: 'e11', date: '2024-07-25', category: 'Marketing', description: 'Content Creation', amount: 750 },
  // June
  { id: 'e4', date: '2024-06-10', category: 'Marketing', description: 'Social Media Ads', amount: 2200 },
  { id: 'e5', date: '2024-06-20', category: 'Cloud Services', description: 'AWS Hosting - June', amount: 3200 },
  { id: 'e12', date: '2024-06-05', category: 'Software', description: 'Zendesk', amount: 250 },
  // May
  { id: 'e6', date: '2024-05-01', category: 'Marketing', description: 'SEO Consultant', amount: 1800 },
  { id: 'e7', date: '2024-05-20', category: 'Cloud Services', description: 'AWS Hosting - May', amount: 3000 },
  // April
  { id: 'e8', date: '2024-04-15', category: 'Marketing', description: 'Conference Sponsorship', amount: 3000 },
  { id: 'e9', date: '2024-04-20', category: 'Cloud Services', description: 'AWS Hosting - April', amount: 2800 },
];

let mockSales: Sale[] = [];
const generateMonthlySales = (customer: Customer, product: Product, startDate: Date, months: number) => {
    for (let i = 0; i < months; i++) {
        const saleDate = new Date(startDate);
        saleDate.setMonth(startDate.getMonth() + i);
        mockSales.push({
            id: `s-recur-${customer.id}-${product.id}-${i}`,
            date: saleDate.toISOString().split('T')[0],
            productId: product.id,
            productName: product.name,
            customerId: customer.id,
            customerName: customer.name,
            quantity: 1,
            totalPrice: product.price,
        });
    }
};

generateMonthlySales(mockCustomers[0], mockProducts[0], new Date('2024-03-11'), 5); // Innovate Corp, SaaS Pro
generateMonthlySales(mockCustomers[1], mockProducts[1], new Date('2024-04-06'), 4); // Data Solutions, SaaS Business
generateMonthlySales(mockCustomers[2], mockProducts[0], new Date('2024-04-23'), 4); // CloudFive, SaaS Pro
generateMonthlySales(mockCustomers[3], mockProducts[1], new Date('2024-05-19'), 3); // QuantumLeap, SaaS Business
generateMonthlySales(mockCustomers[4], mockProducts[0], new Date('2024-06-03'), 2); // Pioneer, SaaS Pro
generateMonthlySales(mockCustomers[5], mockProducts[1], new Date('2024-06-16'), 2); // NextGen, SaaS Business
generateMonthlySales(mockCustomers[6], mockProducts[0], new Date('2024-07-02'), 1); // Vertex, SaaS Pro
generateMonthlySales(mockCustomers[7], mockProducts[1], new Date('2024-07-21'), 1); // Apex, SaaS Business

const oneTimeSales: Omit<Sale, 'id'>[] = [
  { date: '2024-04-15', productId: 'p5', productName: 'Implementation & Setup Fee', customerId: 'c2', customerName: 'Data Solutions Ltd', quantity: 1, totalPrice: 1500.00 },
  { date: '2024-05-20', productId: 'p3', productName: 'Data Analytics Suite - One Time', customerId: 'c4', customerName: 'QuantumLeap Tech', quantity: 1, totalPrice: 499.00 },
  { date: '2024-06-18', productId: 'p6', productName: 'Hourly Consulting', customerId: 'c1', customerName: 'Innovate Corp', quantity: 10, totalPrice: 1500.00 },
  { date: '2024-07-22', productId: 'p3', productName: 'Data Analytics Suite - One Time', customerId: 'c7', customerName: 'Vertex Industries', quantity: 2, totalPrice: 998.00 },
];
mockSales = [...mockSales, ...oneTimeSales.map((s, i) => ({ ...s, id: `s-oto-${i}`}))];

// Recalculate total spent for customers
const customerSpent: Record<string, number> = {};
mockSales.forEach(sale => {
    customerSpent[sale.customerId] = (customerSpent[sale.customerId] || 0) + sale.totalPrice;
});
mockCustomers.forEach(c => {
    c.totalSpent = customerSpent[c.id] || 0;
});


const mockGoals: Goal[] = [
    { id: 'g1', title: 'Achieve Q3 Revenue Target', type: 'revenue', current: 0, target: 10000, deadline: '2024-09-30' },
    { id: 'g2', title: 'Onboard 10 New Customers', type: 'customers', current: 8, target: 10, deadline: '2024-12-31' },
];

type View = 'dashboard' | 'inventory' | 'sales' | 'expenses' | 'customers' | 'forecast' | 'goals';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [sales, setSales] = useState<Sale[]>(mockSales);
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [alerts, setAlerts] = useState<FinancialAlert[]>([]);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const totalRevenue = useMemo(() => sales.reduce((sum, sale) => sum + sale.totalPrice, 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((sum, expense) => sum + expense.amount, 0), [expenses]);

  const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

  useEffect(() => {
    // Update goals based on current data
    setGoals(prevGoals => prevGoals.map(goal => {
        switch (goal.type) {
            case 'revenue':
                return { ...goal, current: totalRevenue };
            case 'customers':
                return { ...goal, current: customers.length };
            case 'profit':
                return { ...goal, current: totalRevenue - totalExpenses };
            default:
                return goal;
        }
    }))
  }, [totalRevenue, totalExpenses, customers.length]);

  useEffect(() => {
    const fetchAlerts = async () => {
        if(process.env.API_KEY){
            const newAlerts = await getFinancialAlerts(sales, expenses);
            const alertsWithIds = newAlerts.map(a => ({
                ...a,
                id: `alert-${Date.now()}-${Math.random()}`,
                timestamp: new Date().toISOString(),
            }));
            setAlerts(prev => [...alertsWithIds, ...prev].slice(0, 10)); // Keep last 10 alerts
        }
    };
    
    const timer = setTimeout(fetchAlerts, 1000); // Debounce to avoid rapid calls
    return () => clearTimeout(timer);

  }, [sales, expenses]);
  
  const handleAddProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: `p${Date.now()}` };
    setProducts(prev => [newProduct, ...prev]);
  };

  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: `e${Date.now()}` };
    setExpenses(prev => [newExpense, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };
  
  const handleAddSale = (sale: Omit<Sale, 'id'>) => {
    const newSale = { ...sale, id: `s${Date.now()}` };
    setSales(prev => [newSale, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    
    // Update customer total spent
    setCustomers(prevCustomers => prevCustomers.map(c => 
        c.id === sale.customerId ? { ...c, totalSpent: c.totalSpent + sale.totalPrice } : c
    ));
  };

  const handleAddCustomer = (customer: Omit<Customer, 'id' | 'totalSpent' | 'joinDate'>) => {
    const newCustomer: Customer = { 
        ...customer, 
        id: `c${Date.now()}`,
        totalSpent: 0,
        joinDate: new Date().toISOString().split('T')[0]
    };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const handleAddGoal = (goal: Omit<Goal, 'id' | 'current'>) => {
    const newGoal: Goal = {
        ...goal,
        id: `g${Date.now()}`,
        current: 0, // Will be updated by useEffect
    };
    setGoals(prev => [newGoal, ...prev]);
  };

  const handleDeleteProducts = (productIds: string[]) => {
    setProducts(prev => prev.filter(p => !productIds.includes(p.id)));
  };

  const handleDeleteSales = (saleIds: string[]) => {
    setSales(prev => prev.filter(s => !saleIds.includes(s.id)));
  };

  const handleDeleteExpenses = (expenseIds: string[]) => {
    setExpenses(prev => prev.filter(e => !expenseIds.includes(e.id)));
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard sales={sales} expenses={expenses} customers={customers} goals={goals} products={products} />;
      case 'inventory':
        return <Inventory products={products} onAddProduct={handleAddProduct} sales={sales} onDeleteProducts={handleDeleteProducts} />;
      case 'sales':
        return <Sales sales={sales} products={products} customers={customers} onAddSale={handleAddSale} onDeleteSales={handleDeleteSales} />;
      case 'expenses':
        return <Expenses expenses={expenses} onAddExpense={handleAddExpense} onDeleteExpenses={handleDeleteExpenses} />;
      case 'customers':
        return <Customers customers={customers} onAddCustomer={handleAddCustomer} sales={sales} />;
      case 'forecast':
        return <Forecast products={products} sales={sales} expenses={expenses} customers={customers}/>;
      case 'goals':
        return <Goals goals={goals} onAddGoal={handleAddGoal} />;
      default:
        return <Dashboard sales={sales} expenses={expenses} customers={customers} goals={goals} products={products}/>;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView}
        isCollapsed={isSidebarCollapsed}
        onToggle={toggleSidebar}
      />
      <div className={`flex flex-col flex-1 min-w-0 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'} transition-all duration-300`}>
        <TopBar alerts={alerts} />
        <main className="flex-1 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;