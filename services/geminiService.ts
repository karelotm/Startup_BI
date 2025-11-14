import { GoogleGenAI, Type } from "@google/genai";
import { Product, Expense, Sale, AIAnalysis, Customer, FinancialAlert } from '../types';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisResponseSchema = {
    type: Type.OBJECT,
    properties: {
        forecast: {
            type: Type.ARRAY,
            description: "A 3-month financial forecast.",
            items: {
                type: Type.OBJECT,
                properties: {
                    month: { type: Type.STRING, description: "The forecasted month (e.g., 'Next Month')." },
                    revenue: { type: Type.NUMBER, description: "Predicted total revenue." },
                    expenses: { type: Type.NUMBER, description: "Predicted total expenses." },
                    profit: { type: Type.NUMBER, description: "Predicted net profit." },
                },
                required: ["month", "revenue", "expenses", "profit"]
            },
        },
        trends: {
            type: Type.ARRAY,
            description: "A list of 2-3 key financial trends observed from the data.",
            items: { type: Type.STRING },
        },
        recommendations: {
            type: Type.ARRAY,
            description: "A list of 2-3 actionable recommendations to improve financial health.",
            items: { type: Type.STRING },
        },
        keyOpportunities: {
            type: Type.ARRAY,
            description: "A list of 1-2 specific, actionable growth opportunities.",
            items: { type: Type.STRING },
        },
        potentialRisks: {
            type: Type.ARRAY,
            description: "A list of 1-2 potential risks the business should monitor.",
            items: { type: Type.STRING },
        },
        kpiAnalysis: {
            type: Type.ARRAY,
            description: "An analysis of 1-2 important KPIs. For each KPI, provide its name, calculated value, a brief analysis, and a 3-month historical trend.",
            items: {
                type: Type.OBJECT,
                properties: {
                    kpi: { type: Type.STRING, description: "Name of the Key Performance Indicator." },
                    value: { type: Type.STRING, description: "Calculated value of the KPI for the most recent period." },
                    analysis: { type: Type.STRING, description: "A brief analysis of what this KPI value means for the business." },
                    history: {
                        type: Type.ARRAY,
                        description: "A list of the last 3 months of data for this KPI to visualize its trend.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                month: { type: Type.STRING, description: "The month for the data point (e.g., 'May', 'Jun', 'Jul')." },
                                value: { type: Type.NUMBER, description: "The value of the KPI for that month." },
                            },
                             required: ["month", "value"]
                        }
                    }
                },
                required: ["kpi", "value", "analysis", "history"]
            },
        },
    },
    required: ["forecast", "trends", "recommendations", "keyOpportunities", "potentialRisks", "kpiAnalysis"],
};

const alertsResponseSchema = {
    type: Type.ARRAY,
    description: "A list of proactive financial alerts based on the data.",
    items: {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A short, descriptive title for the alert." },
            message: { type: Type.STRING, description: "A concise message explaining the alert and its implication." },
            severity: { type: Type.STRING, description: "The severity level: 'critical', 'warning', or 'info'." },
        },
        required: ["title", "message", "severity"],
    },
};

export const getFinancialAnalysis = async (
    products: Product[], 
    sales: Sale[], 
    expenses: Expense[],
    customers: Customer[],
    assumptions?: { dateRange: { start: string, end: string }, notes: string }
): Promise<AIAnalysis> => {
    try {
        const prompt = `
        As a senior financial analyst and strategic consultant for a startup, perform a comprehensive analysis of the following business data.

        **Business Data:**
        - Inventory: ${JSON.stringify(products, null, 2)}
        - Sales Records: ${JSON.stringify(sales, null, 2)}
        - Expenses: ${JSON.stringify(expenses, null, 2)}
        - Customer Data: ${JSON.stringify(customers, null, 2)}

        **User-Provided Assumptions (use these to refine your analysis):**
        - Analysis Period: ${assumptions?.dateRange.start} to ${assumptions?.dateRange.end}
        - Strategic Notes: "${assumptions?.notes || 'No specific assumptions provided.'}"

        **Your Task - Provide a full strategic overview:**
        1.  **3-Month Financial Forecast:** Generate a realistic 3-month forecast (revenue, expenses, profit). Incorporate the user's assumptions.
        2.  **Identify Key Trends:** Pinpoint 2-3 significant trends.
        3.  **Actionable Recommendations:** Offer 2-3 concise, high-impact recommendations.
        4.  **Identify Key Opportunities:** What are 1-2 untapped opportunities for growth or efficiency?
        5.  **Identify Potential Risks:** What are 1-2 critical risks?
        6.  **KPI Deep Dive:** Calculate and analyze 1-2 critical startup KPIs (e.g., LTV, CAC, ARPU). For each KPI, provide its name, current value, a brief analysis, and a 3-month historical data trend for visualization.

        Provide the output in the specified JSON format.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisResponseSchema,
                temperature: 0.5,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as AIAnalysis;

    } catch (error) {
        console.error("Error fetching financial analysis from Gemini:", error);
        throw new Error("Failed to generate AI analysis. Please check your API key and try again.");
    }
};

export const getFinancialAlerts = async (
    sales: Sale[],
    expenses: Expense[]
): Promise<Omit<FinancialAlert, 'id' | 'timestamp'>[]> => {
    if (sales.length === 0 && expenses.length === 0) return [];
    try {
        const prompt = `
        Act as a proactive financial monitoring AI for a startup. Analyze the recent sales and expenses data to identify critical risks or important informational points.

        **Recent Data:**
        - Last 30 days of sales: ${JSON.stringify(sales.filter(s => new Date(s.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), null, 2)}
        - Last 30 days of expenses: ${JSON.stringify(expenses.filter(e => new Date(e.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)), null, 2)}
        - Previous 30 days of sales (for comparison): ${JSON.stringify(sales.filter(s => new Date(s.date) <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && new Date(s.date) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)), null, 2)}

        **Your Task:**
        Identify up to 3 major alerts. Focus on the most critical issues.
        - **High Burn Rate:** Is cash burn (expenses - revenue) dangerously high?
        - **Revenue Drop:** Has revenue significantly dropped compared to the previous period?
        - **Large Expense:** Is there an unusually large, single expense that needs attention?
        - **Concentration Risk:** Is a single customer or product responsible for a majority of revenue?
        
        For each identified issue, create an alert with a title, a short message explaining the problem, and a severity level ('critical', 'warning', or 'info'). If there are no major issues, return an empty array.
        
        Provide the output in the specified JSON format.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: alertsResponseSchema,
                temperature: 0.8,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Omit<FinancialAlert, 'id' | 'timestamp'>[];

    } catch (error) {
        console.error("Error fetching financial alerts from Gemini:", error);
        // Don't throw an error, just return empty array so the app doesn't crash
        return [];
    }
};