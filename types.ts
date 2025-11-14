export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: number;
  isRecurring?: boolean;
}

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalSpent: number;
  joinDate: string;
}

export interface Sale {
  id: string;
  date: string;
  productId: string;
  productName: string; 
  customerId: string;
  customerName: string;
  quantity: number;
  totalPrice: number;
}

export interface KpiData {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
}

export interface ForecastData {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface KpiAnalysis {
    kpi: string;
    value: string;
    analysis: string;
    history?: { month: string, value: number }[];
}

export interface AIAnalysis {
  forecast: ForecastData[];
  trends: string[];
  recommendations: string[];
  keyOpportunities: string[];
  potentialRisks: string[];
  kpiAnalysis: KpiAnalysis[];
}

export interface FinancialAlert {
    id: string;
    title: string;
    message: string;
    severity: 'critical' | 'warning' | 'info';
    timestamp: string;
}

export interface Goal {
    id: string;
    title: string;
    target: number;
    current: number;
    type: 'revenue' | 'profit' | 'customers';
    deadline: string;
}