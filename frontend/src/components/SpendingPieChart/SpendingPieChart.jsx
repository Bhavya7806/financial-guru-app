import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from '../DashboardCard/DashboardCard';
import './SpendingPieChart.css';

// Remove mock data
// const data = [ ... ]; 

// Colors (can be static)
const COLORS = ['#007BFF', '#17A2B8', '#FFC107', '#DC3545', '#28A745', '#6C757D', '#5A46FF'];

// Component now accepts 'data' prop
const SpendingPieChart = ({ data }) => {
  // If no data, show a message
  if (!data || data.length === 0) {
    return (
      <DashboardCard title="Spending Breakdown">
         <div className="chart-placeholder">No spending data to display.</div>
      </DashboardCard>
    );
  }

  return (
    // Ensure the DashboardCard style is defined in the placeholder CSS if using the placeholder
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
                // Use category name with emoji/icon if present, otherwise just name
                <Cell 
                   key={`cell-${index}`} 
                   fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
               formatter={(value) => `₹${value.toLocaleString('en-IN')}`} // Format tooltip value
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