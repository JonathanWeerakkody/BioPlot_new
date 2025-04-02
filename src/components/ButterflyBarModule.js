import React, { useState } from 'react';
import DataInput from './DataInput';
import './BarChartModule.css';

function ButterflyBarModule() {
  const [chartData, setChartData] = useState(null);
  const [chartOptions, setChartOptions] = useState({
    chartType: 'butterflyBar',
    title: 'Butterfly Bar Chart',
    xAxisLabel: 'Values',
    yAxisLabel: 'Categories',
    leftBarColor: '#3366CC',
    rightBarColor: '#DC3912',
    gridColor: '#E0E0E0',
    fontColor: '#333333',
    frameColor: '#000000',
    barHeight: 0.7,
    showLegend: true,
    legendPosition: 'top',
    leftLegendLabel: 'Male',
    rightLegendLabel: 'Female',
    centerLine: true,
    centerLineColor: '#000000',
    centerLineWidth: 1
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
          maleValues: data.maleValues || data.values,
          femaleValues: data.femaleValues || [],
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
        <h2>Butterfly Bar Chart</h2>
        <p>Create a population pyramid or butterfly chart for comparing two opposing datasets</p>
      </div>

      <div className="module-content">
        <div className="input-section">
          <DataInput onDataSubmit={handleDataSubmit} graphType="butterflyBar" />
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
              <label htmlFor="leftBarColor">Left Bar Color</label>
              <input
                type="color"
                id="leftBarColor"
                name="leftBarColor"
                value={chartOptions.leftBarColor}
                onChange={handleOptionChange}
              />
            </div>

            <div className="option-group">
              <label htmlFor="rightBarColor">Right Bar Color</label>
              <input
                type="color"
                id="rightBarColor"
                name="rightBarColor"
                value={chartOptions.rightBarColor}
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

            <div className="option-group">
              <label htmlFor="leftLegendLabel">Left Legend Label</label>
              <input
                type="text"
                id="leftLegendLabel"
                name="leftLegendLabel"
                value={chartOptions.leftLegendLabel}
                onChange={handleOptionChange}
                disabled={!chartOptions.showLegend}
              />
            </div>

            <div className="option-group">
              <label htmlFor="rightLegendLabel">Right Legend Label</label>
              <input
                type="text"
                id="rightLegendLabel"
                name="rightLegendLabel"
                value={chartOptions.rightLegendLabel}
                onChange={handleOptionChange}
                disabled={!chartOptions.showLegend}
              />
            </div>

            <div className="option-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="centerLine"
                  checked={chartOptions.centerLine}
                  onChange={handleOptionChange}
                />
                Show Center Line
              </label>
            </div>

            <div className="option-group">
              <label htmlFor="centerLineColor">Center Line Color</label>
              <input
                type="color"
                id="centerLineColor"
                name="centerLineColor"
                value={chartOptions.centerLineColor}
                onChange={handleOptionChange}
                disabled={!chartOptions.centerLine}
              />
            </div>

            <div className="option-group">
              <label htmlFor="centerLineWidth">Center Line Width</label>
              <input
                type="range"
                id="centerLineWidth"
                name="centerLineWidth"
                min="1"
                max="5"
                step="0.5"
                value={chartOptions.centerLineWidth}
                onChange={handleOptionChange}
                disabled={!chartOptions.centerLine}
              />
              <span>{chartOptions.centerLineWidth}</span>
            </div>
          </div>
        </div>

        <div className="preview-section">
          <h3>Chart Preview</h3>
          <div className="chart-preview">
            {chartImage ? (
              <img src={chartImage} alt="Butterfly Bar Chart" />
            ) : (
              <div className="no-preview">
                <p>Enter data and click "Generate Graph" to see the preview</p>
                <p>Format: First row - categories, Second row - left values, Third row - right values</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ButterflyBarModule;
