// --- src/components/NetWorthTrend/NetWorthTrend.jsx ---

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DashboardCard from '../DashboardCard/DashboardCard';
import './NetWorthTrend.css';

// Mock data for the chart (STATIC)
const data = [
  { name: 'May', netWorth: 380000 },
  { name: 'Jun', netWorth: 400000 },
  { name: 'Jul', netWorth: 415000 },
  { name: 'Aug', netWorth: 430000 },
  { name: 'Sep', netWorth: 458000 },
  { name: 'Oct', netWorth: 482000 },
];

// Helper to format currency
const formatCurrency = (value) => `₹${(value / 1000).toFixed(0)}k`;

const NetWorthTrend = () => {
  // Check if data is too sparse to render the full chart (simulating a render check)
  if (!data || data.length < 2) {
      return (
          <DashboardCard title="Net Worth Trend 📈" className="net-worth-card">
              <div className="chart-placeholder">Need at least 2 data points to show a trend.</div>
          </DashboardCard>
      );
  }

  return (
    // We add a special class here for the grid to target
    <DashboardCard title="Net Worth Trend 📈" className="net-worth-card">
      <div className="net-worth-summary">
        <span className="current-value">₹4,82,000</span>
        <span className="trend-value positive">▲ ₹24,000 (5.2%)</span>
      </div>
      <div className="line-chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis dataKey="name" stroke="var(--text-light)" />
            <YAxis tickFormatter={formatCurrency} stroke="var(--text-light)" />
            <Tooltip
              formatter={(value) => new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0
              }).format(value)}
            />
            <Line 
              type="monotone" 
              dataKey="netWorth" 
              stroke="var(--primary-color)" 
              strokeWidth={3} 
              dot={{ r: 5 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};

export default NetWorthTrend;