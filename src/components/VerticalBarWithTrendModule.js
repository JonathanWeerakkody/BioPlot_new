import React, { useState, useEffect, useRef } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { generateChart } from '../utils/api';
import './BarChartModule.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function VerticalBarWithTrendModule({ data, options, onOptionsChange }) {
  const [chartData, setChartData] = useState(null);
  const [serverImage, setServerImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);
  
  // Update chart data when input data or options change
  useEffect(() => {
    if (data && data.categories && data.values) {
      // Apply sorting if enabled
      let categories = [...data.categories];
      let values = [...data.values];
      
      if (options.sortBars) {
        // Create pairs and sort
        const pairs = categories.map((category, i) => ({ category, value: values[i] }));
        pairs.sort((a, b) => b.value - a.value);
        
        // Extract sorted arrays
        categories = pairs.map(pair => pair.category);
        values = pairs.map(pair => pair.value);
      }
      
      setChartData({
        labels: categories,
        datasets: [
          {
            type: 'bar',
            label: options.barLabel || 'Bar Values',
            data: values,
            backgroundColor: options.barColor || '#4285F4',
            borderColor: options.borderColor || 'rgba(0, 0, 0, 0.1)',
            borderWidth: options.borderWidth || 1,
            order: 2
          },
          {
            type: 'line',
            label: options.lineLabel || 'Trend Line',
            data: values,
            borderColor: options.lineColor || '#FF0000',
            backgroundColor: 'transparent',
            borderWidth: options.lineWidth || 2,
            pointRadius: options.showPoints ? (options.pointSize || 3) : 0,
            pointBackgroundColor: options.lineColor || '#FF0000',
            tension: options.lineTension || 0.4,
            order: 1
          }
        ],
      });
      
      // Generate server-side chart
      setIsLoading(true);
      generateChart(categories, values, { ...options, chartType: 'verticalBarWithTrend' })
        .then(response => {
          setServerImage(response.image);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Failed to generate chart from server:', error);
          setIsLoading(false);
        });
    }
  }, [data, options]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: options.showLegend !== false,
        position: options.legendPosition || 'top',
        labels: {
          font: {
            size: options.legendFontSize || 12,
            family: options.fontFamily || 'Arial',
            color: options.fontColor || '#333333'
          }
        }
      },
      title: {
        display: !!options.title,
        text: options.title || '',
        font: {
          size: options.titleFontSize || 16,
          family: options.fontFamily || 'Arial',
          color: options.fontColor || '#333333'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: options.xAxisLabel || 'Categories',
          font: {
            size: options.axisFontSize || 14,
            family: options.fontFamily || 'Arial',
            color: options.fontColor || '#333333'
          }
        },
        ticks: {
          maxRotation: options.labelRotation || 45,
          minRotation: options.labelRotation || 45,
          font: {
            size: options.tickFontSize || 12,
            family: options.fontFamily || 'Arial',
            color: options.fontColor || '#333333'
          }
        },
        grid: {
          color: options.gridColor || 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        title: {
          display: true,
          text: options.yAxisLabel || 'Values',
          font: {
            size: options.axisFontSize || 14,
            family: options.fontFamily || 'Arial',
            color: options.fontColor || '#333333'
          }
        },
        ticks: {
          font: {
            size: options.tickFontSize || 12,
            family: options.fontFamily || 'Arial',
            color: options.fontColor || '#333333'
          }
        },
        grid: {
          color: options.gridColor || 'rgba(0, 0, 0, 0.1)'
        },
        beginAtZero: options.beginAtZero !== false
      }
    }
  };

  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    onOptionsChange({
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const downloadChart = () => {
    // If we have a server-generated image, download that
    if (serverImage) {
      const link = document.createElement('a');
      link.download = 'bioplot-vertical-bar-with-trend.png';
      link.href = serverImage;
      link.click();
    } 
    // Fallback to client-side chart
    else if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = 'bioplot-vertical-bar-with-trend.png';
      link.href = url;
      link.click();
    }
  };

  const loadSampleData = () => {
    const sampleCategories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const sampleValues = [65, 59, 80, 81, 56, 75, 90];
    
    onOptionsChange({
      title: 'Vertical Bar with Trend Line',
      xAxisLabel: 'Month',
      yAxisLabel: 'Value',
      barLabel: 'Monthly Value',
      lineLabel: 'Trend',
      barColor: '#4285F4',
      lineColor: '#FF0000',
      lineWidth: 2,
      showPoints: true,
      pointSize: 3,
      lineTension: 0.4
    });
    
    return { 
      categories: sampleCategories, 
      values: sampleValues
    };
  };

  return (
    <div className="bar-chart-module">
      <div className="two-column">
        <div className="column chart-options">
          <h3>Chart Options</h3>
          
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
            <label htmlFor="barLabel">Bar Label</label>
            <input
              type="text"
              id="barLabel"
              name="barLabel"
              value={options.barLabel || ''}
              onChange={handleOptionChange}
              placeholder="Bar Label"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lineLabel">Trend Line Label</label>
            <input
              type="text"
              id="lineLabel"
              name="lineLabel"
              value={options.lineLabel || ''}
              onChange={handleOptionChange}
              placeholder="Trend Line Label"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="barColor">Bar Color</label>
            <input
              type="color"
              id="barColor"
              name="barColor"
              value={options.barColor || '#4285F4'}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lineColor">Line Color</label>
            <input
              type="color"
              id="lineColor"
              name="lineColor"
              value={options.lineColor || '#FF0000'}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lineWidth">Line Width</label>
            <input
              type="number"
              id="lineWidth"
              name="lineWidth"
              value={options.lineWidth || 2}
              onChange={handleOptionChange}
              min="1"
              max="10"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lineTension">Line Curvature</label>
            <input
              type="range"
              id="lineTension"
              name="lineTension"
              min="0"
              max="1"
              step="0.1"
              value={options.lineTension || 0.4}
              onChange={handleOptionChange}
            />
            <span>{options.lineTension || 0.4}</span>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="showPoints"
                checked={options.showPoints || false}
                onChange={handleOptionChange}
              />
              Show Points on Line
            </label>
          </div>
          
          {options.showPoints && (
            <div className="form-group">
              <label htmlFor="pointSize">Point Size</label>
              <input
                type="number"
                id="pointSize"
                name="pointSize"
                value={options.pointSize || 3}
                onChange={handleOptionChange}
                min="1"
                max="10"
              />
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="borderColor">Border Color</label>
            <input
              type="color"
              id="borderColor"
              name="borderColor"
              value={options.borderColor || '#000000'}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="gridColor">Grid Color</label>
            <input
              type="color"
              id="gridColor"
              name="gridColor"
              value={options.gridColor || '#CCCCCC'}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="fontColor">Font Color</label>
            <input
              type="color"
              id="fontColor"
              name="fontColor"
              value={options.fontColor || '#333333'}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="fontFamily">Font Family</label>
            <select
              id="fontFamily"
              name="fontFamily"
              value={options.fontFamily || 'Arial'}
              onChange={handleOptionChange}
            >
              <option value="Arial">Arial</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
              <option value="Verdana">Verdana</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="titleFontSize">Title Font Size</label>
            <input
              type="number"
              id="titleFontSize"
              name="titleFontSize"
              value={options.titleFontSize || 16}
              onChange={handleOptionChange}
              min="10"
              max="30"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="axisFontSize">Axis Label Font Size</label>
            <input
              type="number"
              id="axisFontSize"
              name="axisFontSize"
              value={options.axisFontSize || 14}
              onChange={handleOptionChange}
              min="8"
              max="24"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="tickFontSize">Tick Label Font Size</label>
            <input
              type="number"
              id="tickFontSize"
              name="tickFontSize"
              value={options.tickFontSize || 12}
              onChange={handleOptionChange}
              min="8"
              max="20"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="labelRotation">Label Rotation (degrees)</label>
            <input
              type="number"
              id="labelRotation"
              name="labelRotation"
              value={options.labelRotation || 45}
              onChange={handleOptionChange}
              min="0"
              max="90"
            />
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="sortBars"
                checked={options.sortBars || false}
                onChange={handleOptionChange}
              />
              Sort Bars by Value (Descending)
            </label>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="beginAtZero"
                checked={options.beginAtZero !== false}
                onChange={handleOptionChange}
              />
              Begin Y-Axis at Zero
            </label>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="showLegend"
                checked={options.showLegend !== false}
                onChange={handleOptionChange}
              />
              Show Legend
            </label>
          </div>
          
          <div className="form-group">
            <button onClick={downloadChart} className="download-button">
              Download Chart
            </button>
          </div>
          
          {!data && (
            <div className="form-group">
              <button 
                onClick={() => onOptionsChange({ sampleData: loadSampleData() })} 
                className="sample-button"
              >
                Load Sample Data
              </button>
            </div>
          )}
        </div>
        
        <div className="column chart-preview">
          <h3>Preview</h3>
          <div className="chart-container">
            {isLoading ? (
              <div className="loading">Generating chart...</div>
            ) : serverImage ? (
              <div className="server-image">
                <img src={serverImage} alt="Generated chart" />
              </div>
            ) : chartData ? (
              <Bar 
                data={chartData} 
                options={chartOptions} 
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

export default VerticalBarWithTrendModule;
