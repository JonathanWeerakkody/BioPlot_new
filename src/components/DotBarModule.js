import React, { useState } from 'react';
import DataInput from './DataInput';
import './BarChartModule.css';

function DotBarModule() {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState({
    chartType: 'dotBar',
    title: 'Dot Bar Chart',
    xAxisLabel: 'Categories',
    yAxisLabel: 'Values',
    dotColor: '#1E88E5',
    gridColor: '#E0E0E0',
    fontColor: '#333333',
    frameColor: '#000000',
    dotSize: 8,
    dotSpacing: 0.7,
    showConnectingLines: true,
    connectingLineColor: '#90CAF9',
    connectingLineWidth: 2
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
        <h2>Dot Bar Chart</h2>
        <p>Create a bar chart where values are represented by dots instead of solid bars</p>
      </div>

      <div className="module-content">
        <div className="input-section">
          <DataInput onDataSubmit={handleDataSubmit} graphType="dotBar" />
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
              <label htmlFor="dotColor">Dot Color</label>
              <input
                type="color"
                id="dotColor"
                name="dotColor"
                value={chartOptions.dotColor}
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
              <label htmlFor="dotSize">Dot Size</label>
              <input
                type="range"
                id="dotSize"
                name="dotSize"
                min="4"
                max="15"
                step="1"
                value={chartOptions.dotSize}
                onChange={handleOptionChange}
              />
              <span>{chartOptions.dotSize}</span>
            </div>

            <div className="option-group">
              <label htmlFor="dotSpacing">Dot Spacing</label>
              <input
                type="range"
                id="dotSpacing"
                name="dotSpacing"
                min="0.2"
                max="1.5"
                step="0.1"
                value={chartOptions.dotSpacing}
                onChange={handleOptionChange}
              />
              <span>{chartOptions.dotSpacing}</span>
            </div>

            <div className="option-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="showConnectingLines"
                  checked={chartOptions.showConnectingLines}
                  onChange={handleOptionChange}
                />
                Show Connecting Lines
              </label>
            </div>

            <div className="option-group">
              <label htmlFor="connectingLineColor">Connecting Line Color</label>
              <input
                type="color"
                id="connectingLineColor"
                name="connectingLineColor"
                value={chartOptions.connectingLineColor}
                onChange={handleOptionChange}
                disabled={!chartOptions.showConnectingLines}
              />
            </div>

            <div className="option-group">
              <label htmlFor="connectingLineWidth">Connecting Line Width</label>
              <input
                type="range"
                id="connectingLineWidth"
                name="connectingLineWidth"
                min="1"
                max="5"
                step="0.5"
                value={chartOptions.connectingLineWidth}
                onChange={handleOptionChange}
                disabled={!chartOptions.showConnectingLines}
              />
              <span>{chartOptions.connectingLineWidth}</span>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h3>Chart Preview</h3>
          <div className="chart-preview">
            {chartImage ? (
              <img src={chartImage} alt="Dot Bar Chart" />
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

export default DotBarModule;
