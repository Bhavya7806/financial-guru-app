// --- src/components/SpendingPieChart/SpendingPieChart.jsx ---

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from '../DashboardCard/DashboardCard';
import './SpendingPieChart.css';

// Using the new vibrant colors for the chart slices
const COLORS = ['#00BFFF', '#FF69B4', '#00FF7F', '#1F334E', '#FFC107', '#DC3545', '#6C757D'];

// Component now accepts 'data' prop
const SpendingPieChart = ({ data }) => {
  
  // Clean data: only render slices with a value > 0
  const cleanData = data.filter(d => d.value > 0);

  if (!cleanData || cleanData.length === 0) {
    return (
      <DashboardCard title="Spending Breakdown">
         <div className="chart-placeholder">No spending data to display.</div> 
      </DashboardCard>
    );
  }

  return (
    <DashboardCard title="Spending Breakdown">
      <div className="pie-chart-container"> 
        <ResponsiveContainer width="100%" height={250}> 
          <PieChart>
            <Pie
              data={cleanData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              // The default fill is removed to rely solely on the vibrant Cell colors
              dataKey="value"
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            >
              {cleanData.map((entry, index) => (
                <Cell 
                   key={`cell-${entry.name}`} 
                   fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
               formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Amount']} 
            />
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