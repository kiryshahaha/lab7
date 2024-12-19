import React from 'react';

const TabPanel = ({ children, activeTab, tab }) => {
  return (
    <div className={`tab-panel ${activeTab === tab ? 'active' : 'hidden'}`}>
      {children}
    </div>
  );
};

export default TabPanel;
