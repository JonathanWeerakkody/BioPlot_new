import React, { useState } from 'react';
import DataInput from './DataInput';
import './BarChartModule.css';

function DualYBarModule() {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState({
    chartType: 'dualYBar',
    title: 'Dual Y-Axis Bar Chart',
    xAxisLabel: 'Categories',
    primaryYAxisLabel: 'Primary Values',
    secondaryYAxisLabel: 'Secondary Values',
    primaryBarColor: '#4285F4',
    secondaryBarColor: '#EA4335',
    gridColor: '#E0E0E0',
    fontColor: '#333333',
    frameColor: '#000000',
    barWidth: 0.7,
    showLegend: true,
    legendPosition: 'top'
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

  const generateChart = async (data, options) => {
    try {
      const response = await fetch('/api/generate-chart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          categories: data.categories,
          values: data.values,
          secondaryValues: data.secondaryValues,
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
        <h2>Dual Y-Axis Bar Chart</h2>
        <p>Create a bar chart with two Y-axes for comparing different scales</p>
      </div>

      <div className="module-content">
        <div className="input-section">
          <DataInput onDataSubmit={handleDataSubmit} graphType="dualYBar" />
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
              <label htmlFor="primaryYAxisLabel">Primary Y-Axis Label</label>
              <input
                type="text"
                id="primaryYAxisLabel"
                name="primaryYAxisLabel"
                value={chartOptions.primaryYAxisLabel}
                onChange={handleOptionChange}
              />
            </div>

            <div className="option-group">
              <label htmlFor="secondaryYAxisLabel">Secondary Y-Axis Label</label>
              <input
                type="text"
                id="secondaryYAxisLabel"
                name="secondaryYAxisLabel"
                value={chartOptions.secondaryYAxisLabel}
                onChange={handleOptionChange}
              />
            </div>

            <div className="option-group">
              <label htmlFor="primaryBarColor">Primary Bar Color</label>
              <input
                type="color"
                id="primaryBarColor"
                name="primaryBarColor"
                value={chartOptions.primaryBarColor}
                onChange={handleOptionChange}
              />
            </div>

            <div className="option-group">
              <label htmlFor="secondaryBarColor">Secondary Bar Color</label>
              <input
                type="color"
                id="secondaryBarColor"
                name="secondaryBarColor"
                value={chartOptions.secondaryBarColor}
                onChange={handleOptionChange}
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
              <img src={chartImage} alt="Dual Y-Axis Bar Chart" />
            ) : (
              <div className="no-preview">
                <p>Enter data and click "Generate Graph" to see the preview</p>
                <p>Format: First row - categories, Second row - primary values, Third row - secondary values</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DualYBarModule;
