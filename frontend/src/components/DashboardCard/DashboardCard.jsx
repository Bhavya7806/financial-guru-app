// --- src/components/DashboardCard/DashboardCard.jsx ---

import React from 'react';
import './DashboardCard.css';

const DashboardCard = ({ title, children, className = '' }) => {
  return (
    <div className={`dashboard-card ${className}`}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardCard;