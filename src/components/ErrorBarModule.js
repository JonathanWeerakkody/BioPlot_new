import React, { useState } from 'react';
import DataInput from './DataInput';
import './BarChartModule.css';

function ErrorBarModule() {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState({
    chartType: 'errorBar',
    title: 'Error Bar Chart',
    xAxisLabel: 'Categories',
    yAxisLabel: 'Values',
    barColor: '#3366CC',
    errorBarColor: '#FF5733',
    gridColor: '#E0E0E0',
    fontColor: '#333333',
    frameColor: '#000000',
    barWidth: 0.6,
    errorCapWidth: 0.4,
    errorBarWidth: 2
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
          errors: data.errors,
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
        <h2>Error Bar Chart</h2>
        <p>Create a bar chart with error bars to show data variability</p>
      </div>

      <div className="module-content">
        <div className="input-section">
          <DataInput onDataSubmit={handleDataSubmit} graphType="errorBar" />
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
              <label htmlFor="errorBarColor">Error Bar Color</label>
              <input
                type="color"
                id="errorBarColor"
                name="errorBarColor"
                value={chartOptions.errorBarColor}
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

            <div className="option-group">
              <label htmlFor="errorCapWidth">Error Cap Width</label>
              <input
                type="range"
                id="errorCapWidth"
                name="errorCapWidth"
                min="0.1"
                max="1"
                step="0.1"
                value={chartOptions.errorCapWidth}
                onChange={handleOptionChange}
              />
              <span>{chartOptions.errorCapWidth}</span>
            </div>

            <div className="option-group">
              <label htmlFor="errorBarWidth">Error Bar Width</label>
              <input
                type="range"
                id="errorBarWidth"
                name="errorBarWidth"
                min="1"
                max="5"
                step="0.5"
                value={chartOptions.errorBarWidth}
                onChange={handleOptionChange}
              />
              <span>{chartOptions.errorBarWidth}</span>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h3>Chart Preview</h3>
          <div className="chart-preview">
            {chartImage ? (
              <img src={chartImage} alt="Error Bar Chart" />
            ) : (
              <div className="no-preview">
                <p>Enter data and click "Generate Graph" to see the preview</p>
                <p>Format: First row - categories, Second row - values, Third row - error values</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorBarModule;
