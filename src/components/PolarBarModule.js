import React, { useState } from 'react';
import DataInput from './DataInput';
import './BarChartModule.css';

function PolarBarModule() {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState({
    chartType: 'polarBar',
    title: 'Polar Bar Chart',
    barColor: '#8E44AD',
    gridColor: '#E0E0E0',
    fontColor: '#333333',
    frameColor: '#000000',
    showLabels: true,
    showValues: true,
    startAngle: 0,
    endAngle: 360
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
        <h2>Polar Bar Chart</h2>
        <p>Create a circular bar chart with bars radiating from the center</p>
      </div>

      <div className="module-content">
        <div className="input-section">
          <DataInput onDataSubmit={handleDataSubmit} graphType="polarBar" />
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

            <div className="option-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="showLabels"
                  checked={chartOptions.showLabels}
                  onChange={handleOptionChange}
                />
                Show Labels
              </label>
            </div>

            <div className="option-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="showValues"
                  checked={chartOptions.showValues}
                  onChange={handleOptionChange}
                />
                Show Values
              </label>
            </div>

            <div className="option-group">
              <label htmlFor="startAngle">Start Angle</label>
              <input
                type="range"
                id="startAngle"
                name="startAngle"
                min="0"
                max="360"
                step="15"
                value={chartOptions.startAngle}
                onChange={handleOptionChange}
              />
              <span>{chartOptions.startAngle}°</span>
            </div>

            <div className="option-group">
              <label htmlFor="endAngle">End Angle</label>
              <input
                type="range"
                id="endAngle"
                name="endAngle"
                min="0"
                max="360"
                step="15"
                value={chartOptions.endAngle}
                onChange={handleOptionChange}
              />
              <span>{chartOptions.endAngle}°</span>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h3>Chart Preview</h3>
          <div className="chart-preview">
            {chartImage ? (
              <img src={chartImage} alt="Polar Bar Chart" />
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

export default PolarBarModule;
