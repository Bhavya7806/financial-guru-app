// --- src/components/Sidebar/Sidebar.jsx ---

import React from 'react';
import './Sidebar.css';
import { NavLink } from 'react-router-dom'; // Use NavLink for active styling

// ACTION: Add these icons to src/assets
import IconDashboard from '../../assets/icon-dashboard.png';
import IconExpenses from '../../assets/icon-expenses.png';
import IconBudget from '../../assets/icon-budget.png';
import IconGoals from '../../assets/icon-goals.png';
import IconSettings from '../../assets/icon-settings.png';

const Sidebar = () => {
  return (
    <nav className="sidebar">
      <ul className="sidebar-nav-list">
        <li className="sidebar-nav-item">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}
          >
            <img src={IconDashboard} alt="" className="sidebar-icon" />
            <span>Dashboard</span>
          </NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink 
            to="/expenses" 
            className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}
          >
            <img src={IconExpenses} alt="" className="sidebar-icon" />
            <span>Expenses</span>
          </NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink 
            to="/budget" 
            className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}
          >
            <img src={IconBudget} alt="" className="sidebar-icon" />
            <span>Budget</span>
          </NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink 
            to="/goals" 
            className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}
          >
            <img src={IconGoals} alt="" className="sidebar-icon" />
            <span>Goals</span>
          </NavLink>
        </li>
        <li className="sidebar-nav-item">
          <NavLink 
            to="/settings" 
            className={({ isActive }) => isActive ? "sidebar-nav-link active" : "sidebar-nav-link"}
          >
            <img src={IconSettings} alt="" className="sidebar-icon" />
            <span>Settings</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;