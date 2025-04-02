import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import { generateChart } from '../../utils/api';

const Plot = createPlotlyComponent(Plotly);

function PolarBarChart({ data, onOptionsChange }) {
  const [options, setOptions] = useState({
    title: 'Polar Bar Chart',
    showLegend: true,
    colorScheme: 'Category10',
    fontSize: 12,
    barWidth: 0.8,
    showLabels: true
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
          chartType: 'polarBar'
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
    const values = dataRows.map(row => parseFloat(row[1]));
    
    // Create color array based on the number of categories
    const colors = getColors(categories.length, options.colorScheme);
    
    // Create the polar bar data
    const polarData = [{
      type: 'barpolar',
      r: values,
      theta: categories,
      width: parseFloat(options.barWidth),
      marker: {
        color: colors
      },
      hoverinfo: 'text',
      hovertext: categories.map((cat, i) => `${cat}: ${values[i]}`),
      showlegend: options.showLegend
    }];
    
    setChartData(polarData);
    setIsLoading(false);
  };

  // Function to generate colors based on the scheme
  const getColors = (count, scheme) => {
    // Simple color schemes
    const schemes = {
      'Category10': ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'],
      'Set1': ['#e41a1c', '#377eb8', '#4daf4a', '#984ea3', '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'],
      'Set2': ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3', '#a6d854', '#ffd92f', '#e5c494', '#b3b3b3'],
      'Paired': ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00', '#cab2d6', '#6a3d9a']
    };
    
    const colorSet = schemes[scheme] || schemes['Category10'];
    return Array(count).fill().map((_, i) => colorSet[i % colorSet.length]);
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
      link.download = 'polar-bar-chart.png';
      link.href = serverImage;
      link.click();
    } else if (chartRef.current) {
      Plotly.downloadImage(chartRef.current.el, {
        format: 'png',
        filename: 'polar-bar-chart'
      });
    }
  };

  const colorSchemeOptions = ['Category10', 'Set1', 'Set2', 'Paired'];

  const layout = {
    title: options.title,
    font: {
      size: parseInt(options.fontSize)
    },
    polar: {
      radialaxis: {
        visible: true,
        showticklabels: options.showLabels
      },
      angularaxis: {
        visible: true,
        showticklabels: options.showLabels,
        direction: 'clockwise'
      }
    },
    showlegend: options.showLegend,
    margin: {
      l: 50,
      r: 50,
      b: 50,
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
          <h3>Polar Bar Chart Options</h3>
          
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
            <label htmlFor="colorScheme">Color Scheme</label>
            <select
              id="colorScheme"
              name="colorScheme"
              value={options.colorScheme}
              onChange={handleOptionChange}
            >
              {colorSchemeOptions.map(scheme => (
                <option key={scheme} value={scheme}>{scheme}</option>
              ))}
            </select>
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
                name="showLegend"
                checked={options.showLegend}
                onChange={handleOptionChange}
              />
              Show Legend
            </label>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="showLabels"
                checked={options.showLabels}
                onChange={handleOptionChange}
              />
              Show Axis Labels
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
                <img src={serverImage} alt="Generated polar bar chart" />
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

export default PolarBarChart;
