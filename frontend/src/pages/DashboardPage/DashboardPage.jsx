// --- src/pages/DashboardPage/DashboardPage.jsx ---

import React from 'react';
import './DashboardPage.css';
import DashboardCard from '../../components/DashboardCard/DashboardCard';
import SpendingPieChart from '../../components/SpendingPieChart/SpendingPieChart';
import NetWorthTrend from '../../components/NetWorthTrend/NetWorthTrend';

const DashboardPage = ({ user }) => {
  const username = user?.displayName || 'User';

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-welcome">
        Welcome back, <span className="username">{username}</span>!
      </h1>
      
      {/* This is the grid from your blueprint */}
      <div className="dashboard-grid">

        {/* Card 1: Financial Health */}
        <DashboardCard title="Financial Health Score">
          <div className="health-score-content">
            <span className="trophy">🏆</span>
            <div className="score">
              82<span className="total">/100</span>
            </div>
            <div className="score-trend positive">
              ↑ +5 pts from last month
            </div>
          </div>
        </DashboardCard>

        {/* Card 2: Cash Flow */}
        <DashboardCard title="Cash Flow This Month">
          <div className="cash-flow-content">
            <div className="cash-flow-item income">
              <span>Income</span>
              <strong>₹65,000</strong>
            </div>
            <div className="cash-flow-item expenses">
              <span>Expenses</span>
              <strong>₹48,500</strong>
            </div>
            <div className="cash-flow-item savings">
              <span>Savings</span>
              <strong>₹16,500 ↑</strong>
            </div>
          </div>
        </DashboardCard>

        {/* Card 3: Spending Breakdown (Chart) */}
        <SpendingPieChart />

        {/* Card 4: Net Worth Trend (Chart) */}
        <NetWorthTrend />
        
      </div>
    </div>
  );
};

export default DashboardPage;