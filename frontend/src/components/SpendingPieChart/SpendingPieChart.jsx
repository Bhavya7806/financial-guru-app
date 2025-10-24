// --- src/components/SpendingPieChart/SpendingPieChart.jsx ---

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from '../DashboardCard/DashboardCard';
import './SpendingPieChart.css';

// Mock data for the chart
const data = [
  { name: 'Food 🍕', value: 25 },
  { name: 'Rent 🏠', value: 35 },
  { name: 'Transport 🚗', value: 15 },
  { name: 'Bills 💼', value: 15 },
  { name: 'Fun 🎉', value: 10 },
];

// Colors to match your theme
const COLORS = ['#007BFF', '#17A2B8', '#FFC107', '#DC3545', '#28A745'];

const SpendingPieChart = () => {
  return (
    <DashboardCard title="Spending Breakdown">
      <div className="pie-chart-container">
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend 
              iconType="circle"
              layout="vertical"
              verticalAlign="middle"
              align="right"
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </DashboardCard>
  );
};

export default SpendingPieChart;