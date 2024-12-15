// src/App.js
import React, { useState } from 'react';
import Tabs from './Tabs';
import TabPanel from './TabPanel';
import TextAnalyzer from './TextAnal';
import HuffmanCoder from './Haffman';
import ShannonFanoCoder from './ShannonFanoCoder';
import './App.css';

function App() {
  const [tableData, setTableData] = useState(null);
  const [fileData, setFileData] = useState(null);
  const [activeTab, setActiveTab] = useState('Часть 1');

  const tabs = ['Часть 1', 'Часть 2','Часть 3'];

  return (
    <div className="App">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <TabPanel activeTab={activeTab} tab="Часть 1">
        <TextAnalyzer setTableData={setTableData} setFileData={setFileData} fileData={fileData} />
      </TabPanel>
      <TabPanel activeTab={activeTab} tab="Часть 2">
        {tableData && <ShannonFanoCoder tableData={tableData} fileData={fileData} />}
      </TabPanel>
      <TabPanel activeTab={activeTab} tab="Часть 3">
        {tableData && <HuffmanCoder tableData={tableData} fileData={fileData} />}
      </TabPanel>
    </div>
  );
}

export default App;
