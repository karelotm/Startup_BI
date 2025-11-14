# Startup BI Dashboard - An AI-Powered Co-Pilot for Your Business


This project is a modern, interactive Business Intelligence (BI) dashboard designed to serve as a financial co-pilot for startups and small businesses. It transforms a doctoral research proposal on "Business Intelligence for Moroccan Startups" into a functional, data-driven application that helps founders manage daily operations, track key metrics, and make informed strategic decisions.

The entire application is built with **React**, **TypeScript**, and **Tailwind CSS**, and leverages a powerful cloud-based AI service for its intelligent features, including financial forecasting, strategic analysis, and proactive alerting.

## ✨ Key Features

### 📊 Comprehensive Dashboard
- **At-a-Glance KPIs:** Instantly view key metrics like Total Revenue, Net Profit, and progress on active business goals.
- **Advanced Interactive Charts:** Track your most critical growth metrics with dynamic visualizations for:
  - **Monthly Recurring Revenue (MRR)**
  - **Customer Lifetime Value (LTV) vs. Customer Acquisition Cost (CAC)**
- **Sales Trend Analysis:** Visualize sales performance over time with a filterable bar chart.

### ⚙️ Core Management Modules
- **Inventory Management:** Track products, stock levels (with "In Stock," "Low Stock," and "Out of Stock" indicators), and total inventory value. Click any product to see its detailed sales history.
- **Sales & Customer Hub (CRM):** Record sales, manage your customer database, and click any customer to view their detailed purchase history and key metrics like Average Order Value (AOV).
- **Expense Tracking:** Log and categorize expenses with an intuitive interface that automatically groups your spending by month.

### 🤖 AI-Powered Strategic Insights
- **Customizable Forecasts:** Generate sophisticated AI-powered financial forecasts. Refine the predictions by providing your own business assumptions, analysis date ranges, and strategic notes.
- **Deep Analysis:** Receive an automated, in-depth analysis of your business, including:
  - **Key Trends:** Identifies significant patterns in your financial data.
  - **Actionable Recommendations:** Suggests concrete steps to improve performance.
  - **Potential Risks & Opportunities:** Highlights threats to monitor and growth areas to explore.
- **Proactive Financial Alerts:** An intelligent notification system constantly monitors your data for critical events (like a high cash burn rate or a sudden revenue drop) and alerts you with clear, actionable advice.

### 🚀 Productivity & UX Enhancements
- **Collapsible Sidebar:** Maximize your workspace with an expandable and collapsible navigation menu featuring icon tooltips.
- **Efficient Data Handling:**
  - All tables feature powerful **search** and **filtering** capabilities.
  - **Bulk Actions:** Select multiple rows to delete or export data to a CSV file in one go.
- **Modern UI/UX:** A clean, responsive, and intuitive interface with beautifully designed modals for all data entry, ensuring a seamless user experience.

## 🛠️ Technology Stack

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS
- **AI / LLM:** Cloud-based AI Service
- **Charting Library:** Recharts

## How It Works

This application runs entirely in the browser, with all data managed in the client-side state for this MVP demonstration. All AI features are powered by a sophisticated, cloud-based AI service.

When a user requests an analysis or when the system pro-actively monitors data, the application securely sends the relevant business data (sales, expenses, etc.) to the AI service via an API. The service processes this information, performs a deep financial analysis, and returns a comprehensive overview in a structured JSON format. This response is then parsed and rendered beautifully in the user interface as charts, forecasts, recommendations, and alerts.
