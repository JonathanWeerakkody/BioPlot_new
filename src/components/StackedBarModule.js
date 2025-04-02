import React, { useState } from 'react';
import DataInput from './DataInput';
import './BarChartModule.css';

function StackedBarModule() {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState({
    chartType: 'stackedBar',
    title: 'Stacked Bar Chart',
    xAxisLabel: 'Categories',
    yAxisLabel: 'Values',
    colors: ['#4285F4', '#EA4335', '#FBBC05'],
    gridColor: '#E0E0E0',
    fontColor: '#333333',
    frameColor: '#000000',
    barWidth: 0.7,
    showLegend: true,
    legendPosition: 'top',
    datasetLabels: ['Dataset 1', 'Dataset 2', 'Dataset 3']
  });
  const [chartImage, setChartImage] = useState(null);

  const handleDataSubmit = (data) => {
    setChartData(data);
    generateChart(data, chartOptions);
  };

  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setChartOptions({
      ...chartOptions,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (chartData) {
      generateChart(chartData, {
        ...chartOptions,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleDatasetLabelChange = (index, value) => {
    const newLabels = [...chartOptions.datasetLabels];
    newLabels[index] = value;
    
    const newOptions = {
      ...chartOptions,
      datasetLabels: newLabels
    };
    
    setChartOptions(newOptions);
    
    if (chartData) {
      generateChart(chartData, newOptions);
    }
  };

  const handleColorChange = (index, value) => {
    const newColors = [...chartOptions.colors];
    newColors[index] = value;
    
    const newOptions = {
      ...chartOptions,
      colors: newColors
    };
    
    setChartOptions(newOptions);
    
    if (chartData) {
      generateChart(chartData, newOptions);
    }
  };

  const generateChart = async (data, options) => {
    try {
      const response = await fetch('/api/generate-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: data.categories,
          dataset1: data.dataset1 || data.values,
          dataset2: data.dataset2 || [],
          dataset3: data.dataset3 || [],
          options: options,
        }),
      });

      const result = await response.json();
      if (result.success) {
        setChartImage(result.image);
      } else {
        console.error('Error generating chart:', result.error);
      }
    } catch (error) {
      console.error('Error generating chart:', error);
    }
  };

  return (
    <div className="bar-chart-module">
      <div className="module-header">
        <h2>Stacked Bar Chart</h2>
        <p>Create a stacked bar chart for comparing multiple data series across categories</p>
      </div>

      <div className="module-content">
        <div className="input-section">
          <DataInput onDataSubmit={handleDataSubmit} graphType="stackedBar" />
        </div>

        <div className="options-section">
          <h3>Chart Options</h3>
          <div className="options-grid">
            <div className="option-group">
              <label htmlFor="title">Chart Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={chartOptions.title}
                onChange={handleOptionChange}
              />
            </div>

            <div className="option-group">
              <label htmlFor="xAxisLabel">X-Axis Label</label>
              <input
                type="text"
                id="xAxisLabel"
                name="xAxisLabel"
                value={chartOptions.xAxisLabel}
                onChange={handleOptionChange}
              />
            </div>

            <div className="option-group">
              <label htmlFor="yAxisLabel">Y-Axis Label</label>
              <input
                type="text"
                id="yAxisLabel"
                name="yAxisLabel"
                value={chartOptions.yAxisLabel}
                onChange={handleOptionChange}
              />
            </div>

            <div className="option-group">
              <label htmlFor="datasetLabel1">Dataset 1 Label</label>
              <input
                type="text"
                id="datasetLabel1"
                value={chartOptions.datasetLabels[0]}
                onChange={(e) => handleDatasetLabelChange(0, e.target.value)}
              />
            </div>

            <div className="option-group">
              <label htmlFor="datasetLabel2">Dataset 2 Label</label>
              <input
                type="text"
                id="datasetLabel2"
                value={chartOptions.datasetLabels[1]}
                onChange={(e) => handleDatasetLabelChange(1, e.target.value)}
              />
            </div>

            <div className="option-group">
              <label htmlFor="datasetLabel3">Dataset 3 Label</label>
              <input
                type="text"
                id="datasetLabel3"
                value={chartOptions.datasetLabels[2]}
                onChange={(e) => handleDatasetLabelChange(2, e.target.value)}
              />
            </div>

            <div className="option-group">
              <label htmlFor="color1">Dataset 1 Color</label>
              <input
                type="color"
                id="color1"
                value={chartOptions.colors[0]}
                onChange={(e) => handleColorChange(0, e.target.value)}
              />
            </div>

            <div className="option-group">
              <label htmlFor="color2">Dataset 2 Color</label>
              <input
                type="color"
                id="color2"
                value={chartOptions.colors[1]}
                onChange={(e) => handleColorChange(1, e.target.value)}
              />
            </div>

            <div className="option-group">
              <label htmlFor="color3">Dataset 3 Color</label>
              <input
                type="color"
                id="color3"
                value={chartOptions.colors[2]}
                onChange={(e) => handleColorChange(2, e.target.value)}
              />
            </div>

            <div className="option-group">
              <label htmlFor="gridColor">Grid Color</label>
              <input
                type="color"
                id="gridColor"
                name="gridColor"
                value={chartOptions.gridColor}
                onChange={handleOptionChange}
              />
            </div>

            <div className="option-group">
              <label htmlFor="fontColor">Font Color</label>
              <input
                type="color"
                id="fontColor"
                name="fontColor"
                value={chartOptions.fontColor}
                onChange={handleOptionChange}
              />
            </div>

            <div className="option-group">
              <label htmlFor="frameColor">Frame Color</label>
              <input
                type="color"
                id="frameColor"
                name="frameColor"
                value={chartOptions.frameColor}
                onChange={handleOptionChange}
              />
            </div>

            <div className="option-group">
              <label htmlFor="barWidth">Bar Width</label>
              <input
                type="range"
                id="barWidth"
                name="barWidth"
                min="0.1"
                max="1"
                step="0.1"
                value={chartOptions.barWidth}
                onChange={handleOptionChange}
              />
              <span>{chartOptions.barWidth}</span>
            </div>

            <div className="option-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="showLegend"
                  checked={chartOptions.showLegend}
                  onChange={handleOptionChange}
                />
                Show Legend
              </label>
            </div>

            <div className="option-group">
              <label htmlFor="legendPosition">Legend Position</label>
              <select
                id="legendPosition"
                name="legendPosition"
                value={chartOptions.legendPosition}
                onChange={handleOptionChange}
                disabled={!chartOptions.showLegend}
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h3>Chart Preview</h3>
          <div className="chart-preview">
            {chartImage ? (
              <img src={chartImage} alt="Stacked Bar Chart" />
            ) : (
              <div className="no-preview">
                <p>Enter data and click "Generate Graph" to see the preview</p>
                <p>Format: First row - categories, Second row - dataset 1 values, Third row - dataset 2 values, Fourth row - dataset 3 values</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StackedBarModule;
