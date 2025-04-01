import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import BarChartModule from './components/BarChartModule';
import ErrorBarModule from './components/ErrorBarModule';
import DualYBarModule from './components/DualYBarModule';
import HorizontalBarModule from './components/HorizontalBarModule';
import StackedBarModule from './components/StackedBarModule';
import PolarBarModule from './components/PolarBarModule';
import DotBarModule from './components/DotBarModule';
import VerticalBarWithTrendModule from './components/VerticalBarWithTrendModule';
import ButterflyBarModule from './components/ButterflyBarModule';
import GroupedBarModule from './components/GroupedBarModule';
import GeneUpDownBarModule from './components/GeneUpDownBarModule';
import GraphTypeSelector from './components/GraphTypeSelector';
import DataInput from './components/DataInput';
import './App.css';

function App() {
  const [data, setData] = useState(null);
  const [options, setOptions] = useState({});
  
  const handleDataChange = (newData) => {
    setData(newData);
  };
  
  const handleOptionsChange = (newOptions) => {
    // Handle special case for sample data
    if (newOptions.sampleData) {
      setData(newOptions.sampleData);
      delete newOptions.sampleData;
    }
    
    setOptions(prevOptions => ({
      ...prevOptions,
      ...newOptions
    }));
  };
  
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/select-graph" element={<GraphTypeSelector />} />
          
          <Route 
            path="/bar-chart" 
            element={
              <div className="module-container">
                <h1>Bar Chart</h1>
                <div className="module-content">
                  <DataInput onDataChange={handleDataChange} />
                  <BarChartModule 
                    data={data} 
                    options={options} 
                    onOptionsChange={handleOptionsChange} 
                  />
                </div>
              </div>
            } 
          />
          
          <Route 
            path="/error-bar" 
            element={
              <div className="module-container">
                <h1>Error Bar Chart</h1>
                <div className="module-content">
                  <DataInput onDataChange={handleDataChange} />
                  <ErrorBarModule 
                    data={data} 
                    options={options} 
                    onOptionsChange={handleOptionsChange} 
                  />
                </div>
              </div>
            } 
          />
          
          <Route 
            path="/dual-y-bar" 
            element={
              <div className="module-container">
                <h1>Dual Y-Axis Bar Chart</h1>
                <div className="module-content">
                  <DataInput onDataChange={handleDataChange} />
                  <DualYBarModule 
                    data={data} 
                    options={options} 
                    onOptionsChange={handleOptionsChange} 
                  />
                </div>
              </div>
            } 
          />
          
          <Route 
            path="/horizontal-bar" 
            element={
              <div className="module-container">
                <h1>Horizontal Bar Chart</h1>
                <div className="module-content">
                  <DataInput onDataChange={handleDataChange} />
                  <HorizontalBarModule 
                    data={data} 
                    options={options} 
                    onOptionsChange={handleOptionsChange} 
                  />
                </div>
              </div>
            } 
          />
          
          <Route 
            path="/stacked-bar" 
            element={
              <div className="module-container">
                <h1>Stacked Bar Chart</h1>
                <div className="module-content">
                  <DataInput onDataChange={handleDataChange} />
                  <StackedBarModule 
                    data={data} 
                    options={options} 
                    onOptionsChange={handleOptionsChange} 
                  />
                </div>
              </div>
            } 
          />
          
          <Route 
            path="/polar-bar" 
            element={
              <div className="module-container">
                <h1>Polar Bar Chart</h1>
                <div className="module-content">
                  <DataInput onDataChange={handleDataChange} />
                  <PolarBarModule 
                    data={data} 
                    options={options} 
                    onOptionsChange={handleOptionsChange} 
                  />
                </div>
              </div>
            } 
          />
          
          <Route 
            path="/dot-bar" 
            element={
              <div className="module-container">
                <h1>Dot Bar Chart</h1>
                <div className="module-content">
                  <DataInput onDataChange={handleDataChange} />
                  <DotBarModule 
                    data={data} 
                    options={options} 
                    onOptionsChange={handleOptionsChange} 
                  />
                </div>
              </div>
            } 
          />
          
          <Route 
            path="/trend-bar" 
            element={
              <div className="module-container">
                <h1>Bar Chart with Trend Line</h1>
                <div className="module-content">
                  <DataInput onDataChange={handleDataChange} />
                  <VerticalBarWithTrendModule 
                    data={data} 
                    options={options} 
                    onOptionsChange={handleOptionsChange} 
                  />
                </div>
              </div>
            } 
          />
          
          <Route 
            path="/butterfly-bar" 
            element={
              <div className="module-container">
                <h1>Butterfly Bar Chart</h1>
                <div className="module-content">
                  <DataInput onDataChange={handleDataChange} />
                  <ButterflyBarModule 
                    data={data} 
                    options={options} 
                    onOptionsChange={handleOptionsChange} 
                  />
                </div>
              </div>
            } 
          />
          
          <Route 
            path="/grouped-bar" 
            element={
              <div className="module-container">
                <h1>Grouped Bar Chart</h1>
                <div className="module-content">
                  <DataInput onDataChange={handleDataChange} />
                  <GroupedBarModule 
                    data={data} 
                    options={options} 
                    onOptionsChange={handleOptionsChange} 
                  />
                </div>
              </div>
            } 
          />
          
          <Route 
            path="/gene-up-down" 
            element={
              <div className="module-container">
                <h1>Gene Up/Down Bar Chart</h1>
                <div className="module-content">
                  <DataInput onDataChange={handleDataChange} />
                  <GeneUpDownBarModule 
                    data={data} 
                    options={options} 
                    onOptionsChange={handleOptionsChange} 
                  />
                </div>
              </div>
            } 
          />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
