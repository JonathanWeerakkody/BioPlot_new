import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import { generateChart } from '../../utils/api';

const Plot = createPlotlyComponent(Plotly);

function VerticalBarWithTrend({ data, onOptionsChange }) {
  const [options, setOptions] = useState({
    title: 'Vertical Bar Chart with Trend Line',
    xAxisLabel: 'Categories',
    yAxisLabel: 'Values',
    barColor: '#4285F4',
    trendLineColor: '#FF0000',
    showValues: true,
    fontSize: 12,
    barWidth: 0.6,
    trendLineWidth: 2,
    trendLineStyle: 'solid',
    showTrendLine: true
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
          chartType: 'verticalBarWithTrend'
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
    
    // Get colors if provided in the data
    let colors = null;
    if (headers.length > 2 && headers[2] === 'colors') {
      colors = dataRows.map(row => row.length > 2 ? parseInt(row[2]) : 1);
    }
    
    // Create the bar chart data
    const barData = [{
      type: 'bar',
      x: categories,
      y: values,
      marker: {
        color: colors ? colors.map(c => c === 1 ? options.barColor : c === 2 ? '#FF9900' : c === 3 ? '#00CC00' : options.barColor) : options.barColor,
        line: {
          width: 1,
          color: '#000000'
        }
      },
      hoverinfo: 'text',
      hovertext: categories.map((cat, i) => `${cat}: ${values[i]}`),
      text: options.showValues ? values.map(v => v) : null,
      textposition: 'outside',
      width: parseFloat(options.barWidth)
    }];
    
    // Add trend line if enabled
    if (options.showTrendLine) {
      // Calculate trend line using linear regression
      const n = categories.length;
      const indices = Array.from(Array(n).keys());
      
      const sumX = indices.reduce((a, b) => a + b, 0);
      const sumY = values.reduce((a, b) => a + b, 0);
      const sumXY = indices.reduce((a, i) => a + i * values[i], 0);
      const sumXX = indices.reduce((a, i) => a + i * i, 0);
      
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
      const intercept = (sumY - slope * sumX) / n;
      
      const trendValues = indices.map(i => slope * i + intercept);
      
      barData.push({
        type: 'scatter',
        x: categories,
        y: trendValues,
        mode: 'lines',
        name: 'Trend',
        line: {
          color: options.trendLineColor,
          width: parseFloat(options.trendLineWidth),
          dash: options.trendLineStyle === 'dashed' ? 'dash' : 
                options.trendLineStyle === 'dotted' ? 'dot' : 
                options.trendLineStyle === 'dashdot' ? 'dashdot' : 'solid'
        },
        hoverinfo: 'text',
        hovertext: categories.map((cat, i) => `Trend at ${cat}: ${trendValues[i].toFixed(2)}`)
      });
    }
    
    setChartData(barData);
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
      link.download = 'vertical-bar-with-trend.png';
      link.href = serverImage;
      link.click();
    } else if (chartRef.current) {
      Plotly.downloadImage(chartRef.current.el, {
        format: 'png',
        filename: 'vertical-bar-with-trend'
      });
    }
  };

  const lineStyleOptions = ['solid', 'dashed', 'dotted', 'dashdot'];

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
    },
    showlegend: options.showTrendLine
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
          <h3>Vertical Bar with Trend Options</h3>
          
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
            <label htmlFor="trendLineColor">Trend Line Color</label>
            <input
              type="color"
              id="trendLineColor"
              name="trendLineColor"
              value={options.trendLineColor}
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
            <label htmlFor="trendLineWidth">Trend Line Width</label>
            <input
              type="range"
              id="trendLineWidth"
              name="trendLineWidth"
              value={options.trendLineWidth}
              onChange={handleOptionChange}
              min="1"
              max="5"
              step="0.5"
            />
            <span>{options.trendLineWidth}</span>
          </div>
          
          <div className="form-group">
            <label htmlFor="trendLineStyle">Trend Line Style</label>
            <select
              id="trendLineStyle"
              name="trendLineStyle"
              value={options.trendLineStyle}
              onChange={handleOptionChange}
            >
              {lineStyleOptions.map(style => (
                <option key={style} value={style}>{style}</option>
              ))}
            </select>
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
                name="showTrendLine"
                checked={options.showTrendLine}
                onChange={handleOptionChange}
              />
              Show Trend Line
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
                <img src={serverImage} alt="Generated vertical bar with trend chart" />
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

export default VerticalBarWithTrend;
