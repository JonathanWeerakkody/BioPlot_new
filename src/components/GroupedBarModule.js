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

function GroupedBarModule({ data, options, onOptionsChange }) {
  const [chartData, setChartData] = useState(null);
  const [serverImage, setServerImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);
  
  // Update chart data when input data or options change
  useEffect(() => {
    if (data && data.categories && data.datasets) {
      setChartData({
        labels: data.categories,
        datasets: data.datasets.map((dataset, index) => ({
          label: dataset.label,
          data: dataset.values,
          backgroundColor: options.colors && options.colors[index] ? options.colors[index] : getDefaultColor(index),
          borderColor: options.borderColor || 'rgba(0, 0, 0, 0.1)',
          borderWidth: options.borderWidth || 1,
        })),
      });
      
      // Generate server-side chart
      setIsLoading(true);
      generateChart(data.categories, data.datasets, { 
        ...options, 
        chartType: options.horizontal ? 'horizontalGroupBar' : 'verticalGroupBar'
      })
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

  // Default colors for datasets
  const getDefaultColor = (index) => {
    const defaultColors = [
      '#4285F4', // Blue
      '#34A853', // Green
      '#FBBC05', // Yellow
      '#EA4335', // Red
      '#8F44AD', // Purple
      '#16A085', // Teal
      '#F39C12', // Orange
      '#7F8C8D'  // Gray
    ];
    return defaultColors[index % defaultColors.length];
  };

  const chartOptions = {
    indexAxis: options.horizontal ? 'y' : 'x',
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
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: options.horizontal ? options.xAxisLabel || 'Values' : options.xAxisLabel || 'Categories',
          font: {
            size: options.axisFontSize || 14,
            family: options.fontFamily || 'Arial',
            color: options.fontColor || '#333333'
          }
        },
        ticks: {
          maxRotation: options.horizontal ? 0 : (options.labelRotation || 45),
          minRotation: options.horizontal ? 0 : (options.labelRotation || 45),
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
      },
      y: {
        title: {
          display: true,
          text: options.horizontal ? options.yAxisLabel || 'Categories' : options.yAxisLabel || 'Values',
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

  const handleColorChange = (index, color) => {
    const newColors = [...(options.colors || [])];
    newColors[index] = color;
    onOptionsChange({ colors: newColors });
  };

  const downloadChart = () => {
    // If we have a server-generated image, download that
    if (serverImage) {
      const link = document.createElement('a');
      link.download = `bioplot-${options.horizontal ? 'horizontal' : 'vertical'}-grouped-bar-chart.png`;
      link.href = serverImage;
      link.click();
    } 
    // Fallback to client-side chart
    else if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = `bioplot-${options.horizontal ? 'horizontal' : 'vertical'}-grouped-bar-chart.png`;
      link.href = url;
      link.click();
    }
  };

  const loadSampleData = () => {
    const sampleCategories = ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'];
    const sampleDatasets = [
      {
        label: 'Dataset 1',
        values: [65, 59, 80, 81, 56]
      },
      {
        label: 'Dataset 2',
        values: [28, 48, 40, 19, 36]
      },
      {
        label: 'Dataset 3',
        values: [17, 27, 30, 43, 25]
      }
    ];
    
    onOptionsChange({
      title: `${options.horizontal ? 'Horizontal' : 'Vertical'} Grouped Bar Chart`,
      xAxisLabel: options.horizontal ? 'Values' : 'Categories',
      yAxisLabel: options.horizontal ? 'Categories' : 'Values',
      colors: ['#4285F4', '#34A853', '#FBBC05']
    });
    
    return { 
      categories: sampleCategories, 
      datasets: sampleDatasets
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
          
          {data && data.datasets && (
            <div className="form-group">
              <label>Dataset Colors</label>
              {data.datasets.map((dataset, index) => (
                <div key={index} className="color-picker-row">
                  <span>{dataset.label}:</span>
                  <input
                    type="color"
                    value={(options.colors && options.colors[index]) || getDefaultColor(index)}
                    onChange={(e) => handleColorChange(index, e.target.value)}
                  />
                </div>
              ))}
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
          
          {!options.horizontal && (
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
          )}
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="horizontal"
                checked={options.horizontal || false}
                onChange={handleOptionChange}
              />
              Horizontal Orientation
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
              Begin Value Axis at Zero
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

export default GroupedBarModule;
