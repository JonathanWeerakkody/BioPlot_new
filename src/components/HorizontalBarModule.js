import React, { useState } from 'react';
import DataInput from './DataInput';
import './BarChartModule.css';

function HorizontalBarModule() {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState({
    chartType: 'horizontalBar',
    title: 'Horizontal Bar Chart',
    xAxisLabel: 'Values',
    yAxisLabel: 'Categories',
    barColor: '#34A853',
    gridColor: '#E0E0E0',
    fontColor: '#333333',
    frameColor: '#000000',
    barHeight: 0.7,
    sortBars: false,
    sortDirection: 'descending'
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
        <h2>Horizontal Bar Chart</h2>
        <p>Create a horizontal bar chart for comparing values across categories</p>
      </div>

      <div className="module-content">
        <div className="input-section">
          <DataInput onDataSubmit={handleDataSubmit} graphType="horizontalBar" />
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
              <label htmlFor="xAxisLabel">X-Axis Label (Values)</label>
              <input
                type="text"
                id="xAxisLabel"
                name="xAxisLabel"
                value={chartOptions.xAxisLabel}
                onChange={handleOptionChange}
              />
            </div>

            <div className="option-group">
              <label htmlFor="yAxisLabel">Y-Axis Label (Categories)</label>
              <input
                type="text"
                id="yAxisLabel"
                name="yAxisLabel"
                value={chartOptions.yAxisLabel}
                onChange={handleOptionChange}
              />
            </div>

            <div className="option-group">
              <label htmlFor="barColor">Bar Color</label>
              <input
                type="color"
                id="barColor"
                name="barColor"
                value={chartOptions.barColor}
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
              <label htmlFor="barHeight">Bar Height</label>
              <input
                type="range"
                id="barHeight"
                name="barHeight"
                min="0.1"
                max="1"
                step="0.1"
                value={chartOptions.barHeight}
                onChange={handleOptionChange}
              />
              <span>{chartOptions.barHeight}</span>
            </div>

            <div className="option-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="sortBars"
                  checked={chartOptions.sortBars}
                  onChange={handleOptionChange}
                />
                Sort Bars
              </label>
            </div>

            <div className="option-group">
              <label htmlFor="sortDirection">Sort Direction</label>
              <select
                id="sortDirection"
                name="sortDirection"
                value={chartOptions.sortDirection}
                onChange={handleOptionChange}
                disabled={!chartOptions.sortBars}
              >
                <option value="ascending">Ascending</option>
                <option value="descending">Descending</option>
              </select>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h3>Chart Preview</h3>
          <div className="chart-preview">
            {chartImage ? (
              <img src={chartImage} alt="Horizontal Bar Chart" />
            ) : (
              <div className="no-preview">
                <p>Enter data and click "Generate Graph" to see the preview</p>
                <p>Format: First row - categories, Second row - values</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HorizontalBarModule;
