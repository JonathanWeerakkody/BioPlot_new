import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import { generateChart } from '../../utils/api';

const Plot = createPlotlyComponent(Plotly);

function ErrorBarChart({ data, onOptionsChange }) {
  const [options, setOptions] = useState({
    title: 'Error Bar Chart',
    xAxisLabel: 'Groups',
    yAxisLabel: 'Value',
    barColor: '#4285F4',
    errorBarColor: '#FF0000',
    showValues: true,
    fontSize: 12,
    barWidth: 0.6,
    errorBarWidth: 2,
    errorBarCap: 4
  });
  
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [serverImage, setServerImage] = useState(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (data && data.length > 0) {
      processData();
    }
  }, [data, options]);

  const processData = async () => {
    if (!data || data.length === 0) return;

    setIsLoading(true);
    
    try {
      // Try to generate chart from server
      const result = await generateChart({
        data,
        options: {
          ...options,
          chartType: 'errorBar'
        }
      });
      
      if (result && result.image) {
        setServerImage(result.image);
        setIsLoading(false);
        return;
      }
    } catch (error) {
      console.error('Failed to generate chart from server:', error);
    }
    
    // Client-side fallback
    const rows = data.map(row => row.split('\t'));
    const headers = rows[0];
    
    // Skip header row
    const dataRows = rows.slice(1);
    
    // Extract groups and values
    const groups = dataRows.map(row => row[0]);
    
    // Calculate mean and standard deviation for each group
    const groupData = {};
    
    dataRows.forEach(row => {
      const group = row[0];
      const value = parseFloat(row[1]);
      
      if (!groupData[group]) {
        groupData[group] = {
          values: [],
          mean: 0,
          std: 0
        };
      }
      
      groupData[group].values.push(value);
    });
    
    // Calculate mean and standard deviation
    Object.keys(groupData).forEach(group => {
      const values = groupData[group].values;
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      const std = Math.sqrt(variance);
      
      groupData[group].mean = mean;
      groupData[group].std = std;
    });
    
    // Prepare data for plotting
    const uniqueGroups = Object.keys(groupData);
    const means = uniqueGroups.map(group => groupData[group].mean);
    const errors = uniqueGroups.map(group => groupData[group].std);
    
    // Create the error bar data
    const errorBarData = [{
      type: 'bar',
      x: uniqueGroups,
      y: means,
      name: 'Mean',
      marker: {
        color: options.barColor,
        line: {
          width: 1,
          color: '#000000'
        }
      },
      error_y: {
        type: 'data',
        array: errors,
        visible: true,
        color: options.errorBarColor,
        thickness: parseFloat(options.errorBarWidth),
        width: parseFloat(options.errorBarCap)
      },
      hoverinfo: 'text',
      hovertext: uniqueGroups.map((group, i) => `${group}: ${means[i].toFixed(2)} ± ${errors[i].toFixed(2)}`),
      text: options.showValues ? means.map(v => v.toFixed(2)) : null,
      textposition: 'outside',
      width: parseFloat(options.barWidth)
    }];
    
    setChartData(errorBarData);
    setIsLoading(false);
  };

  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (onOptionsChange) {
      onOptionsChange({
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };

  const downloadChart = () => {
    if (serverImage) {
      const link = document.createElement('a');
      link.download = 'error-bar-chart.png';
      link.href = serverImage;
      link.click();
    } else if (chartRef.current) {
      Plotly.downloadImage(chartRef.current.el, {
        format: 'png',
        filename: 'error-bar-chart'
      });
    }
  };

  const layout = {
    title: options.title,
    font: {
      size: parseInt(options.fontSize)
    },
    xaxis: {
      title: options.xAxisLabel,
      tickangle: -45
    },
    yaxis: {
      title: options.yAxisLabel,
      zeroline: true
    },
    margin: {
      l: 80,
      r: 50,
      b: 100,
      t: 80,
      pad: 4
    }
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d']
  };

  return (
    <div className="bar-chart-module">
      <div className="two-column">
        <div className="column chart-options">
          <h3>Error Bar Chart Options</h3>
          
          <div className="form-group">
            <label htmlFor="title">Chart Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={options.title || ''}
              onChange={handleOptionChange}
              placeholder="Enter chart title"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="xAxisLabel">X-Axis Label</label>
            <input
              type="text"
              id="xAxisLabel"
              name="xAxisLabel"
              value={options.xAxisLabel || ''}
              onChange={handleOptionChange}
              placeholder="X-Axis Label"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="yAxisLabel">Y-Axis Label</label>
            <input
              type="text"
              id="yAxisLabel"
              name="yAxisLabel"
              value={options.yAxisLabel || ''}
              onChange={handleOptionChange}
              placeholder="Y-Axis Label"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="barColor">Bar Color</label>
            <input
              type="color"
              id="barColor"
              name="barColor"
              value={options.barColor}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="errorBarColor">Error Bar Color</label>
            <input
              type="color"
              id="errorBarColor"
              name="errorBarColor"
              value={options.errorBarColor}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="fontSize">Font Size</label>
            <input
              type="number"
              id="fontSize"
              name="fontSize"
              value={options.fontSize}
              onChange={handleOptionChange}
              min="8"
              max="24"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="barWidth">Bar Width</label>
            <input
              type="range"
              id="barWidth"
              name="barWidth"
              value={options.barWidth}
              onChange={handleOptionChange}
              min="0.1"
              max="1"
              step="0.1"
            />
            <span>{options.barWidth}</span>
          </div>
          
          <div className="form-group">
            <label htmlFor="errorBarWidth">Error Bar Width</label>
            <input
              type="range"
              id="errorBarWidth"
              name="errorBarWidth"
              value={options.errorBarWidth}
              onChange={handleOptionChange}
              min="1"
              max="5"
              step="0.5"
            />
            <span>{options.errorBarWidth}</span>
          </div>
          
          <div className="form-group">
            <label htmlFor="errorBarCap">Error Bar Cap Size</label>
            <input
              type="range"
              id="errorBarCap"
              name="errorBarCap"
              value={options.errorBarCap}
              onChange={handleOptionChange}
              min="0"
              max="10"
              step="1"
            />
            <span>{options.errorBarCap}</span>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="showValues"
                checked={options.showValues}
                onChange={handleOptionChange}
              />
              Show Values
            </label>
          </div>
          
          <div className="form-group">
            <button onClick={downloadChart} className="download-button">
              Download Chart
            </button>
          </div>
        </div>
        
        <div className="column chart-preview">
          <h3>Preview</h3>
          <div className="chart-container">
            {isLoading ? (
              <div className="loading">Generating chart...</div>
            ) : serverImage ? (
              <div className="server-image">
                <img src={serverImage} alt="Generated error bar chart" />
              </div>
            ) : chartData ? (
              <Plot 
                data={chartData} 
                layout={layout} 
                config={config}
                style={{ width: '100%', height: '500px' }}
                ref={chartRef}
              />
            ) : (
              <div className="no-data">No data to display</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ErrorBarChart;
