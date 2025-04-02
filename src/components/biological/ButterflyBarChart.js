import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import { generateChart } from '../../utils/api';

const Plot = createPlotlyComponent(Plotly);

function ButterflyBarChart({ data, onOptionsChange }) {
  const [options, setOptions] = useState({
    title: 'Butterfly Bar Chart',
    xAxisLabel: 'Value',
    yAxisLabel: 'Category',
    leftColor: '#E44',
    rightColor: '#E5E',
    showValues: true,
    fontSize: 12,
    barWidth: 0.8,
    sortBars: false
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
          chartType: 'butterflyBar'
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
    
    // Extract categories and values
    const categories = dataRows.map(row => row[0]);
    const leftValues = dataRows.map(row => parseFloat(row[1]));
    const rightValues = dataRows.map(row => parseFloat(row[2]));
    
    // Sort data if needed
    if (options.sortBars) {
      const indices = Array.from(Array(categories.length).keys());
      indices.sort((a, b) => leftValues[b] - leftValues[a]);
      
      const sortedCategories = indices.map(i => categories[i]);
      const sortedLeftValues = indices.map(i => leftValues[i]);
      const sortedRightValues = indices.map(i => rightValues[i]);
      
      categories.splice(0, categories.length, ...sortedCategories);
      leftValues.splice(0, leftValues.length, ...sortedLeftValues);
      rightValues.splice(0, rightValues.length, ...sortedRightValues);
    }
    
    // Create the butterfly bar data
    const butterflyData = [
      {
        type: 'bar',
        x: leftValues.map(v => -v), // Negative values for left side
        y: categories,
        orientation: 'h',
        name: headers[1] || 'Left',
        marker: {
          color: options.leftColor
        },
        hoverinfo: 'text',
        hovertext: categories.map((cat, i) => `${cat} (${headers[1] || 'Left'}): ${leftValues[i]}`),
        text: options.showValues ? leftValues.map(v => v) : null,
        textposition: 'outside',
        width: parseFloat(options.barWidth)
      },
      {
        type: 'bar',
        x: rightValues,
        y: categories,
        orientation: 'h',
        name: headers[2] || 'Right',
        marker: {
          color: options.rightColor
        },
        hoverinfo: 'text',
        hovertext: categories.map((cat, i) => `${cat} (${headers[2] || 'Right'}): ${rightValues[i]}`),
        text: options.showValues ? rightValues.map(v => v) : null,
        textposition: 'outside',
        width: parseFloat(options.barWidth)
      }
    ];
    
    setChartData(butterflyData);
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
      link.download = 'butterfly-bar-chart.png';
      link.href = serverImage;
      link.click();
    } else if (chartRef.current) {
      Plotly.downloadImage(chartRef.current.el, {
        format: 'png',
        filename: 'butterfly-bar-chart'
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
      zeroline: true,
      zerolinecolor: '#969696',
      zerolinewidth: 2,
      showticklabels: true,
      tickformat: ',d', // Format without decimal places
      tickprefix: '',
      ticksuffix: ''
    },
    yaxis: {
      title: options.yAxisLabel,
      automargin: true
    },
    barmode: 'relative',
    bargap: 0.1,
    margin: {
      l: 100,
      r: 50,
      b: 50,
      t: 80,
      pad: 4
    },
    showlegend: true,
    legend: {
      orientation: 'h',
      y: 1.1
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
          <h3>Butterfly Bar Chart Options</h3>
          
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
            <label htmlFor="leftColor">Left Bar Color</label>
            <input
              type="color"
              id="leftColor"
              name="leftColor"
              value={options.leftColor}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="rightColor">Right Bar Color</label>
            <input
              type="color"
              id="rightColor"
              name="rightColor"
              value={options.rightColor}
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
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="sortBars"
                checked={options.sortBars}
                onChange={handleOptionChange}
              />
              Sort Bars by Value
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
                <img src={serverImage} alt="Generated butterfly bar chart" />
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

export default ButterflyBarChart;
