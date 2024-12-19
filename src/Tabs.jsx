import React from 'react';
import './Tabs.css'; // Добавим стили для вкладок

const Tabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tabs">
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          onClick={() => onTabChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
