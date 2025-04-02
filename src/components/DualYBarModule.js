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

function DualYBarModule({ data, options, onOptionsChange }) {
  const [chartData, setChartData] = useState(null);
  const [serverImage, setServerImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);
  
  // Update chart data when input data or options change
  useEffect(() => {
    if (data && data.categories && data.primaryValues && data.secondaryValues) {
      // Apply sorting if enabled
      let categories = [...data.categories];
      let primaryValues = [...data.primaryValues];
      let secondaryValues = [...data.secondaryValues];
      
      if (options.sortBars) {
        // Create triplets and sort by primary values
        const triplets = categories.map((category, i) => ({ 
          category, 
          primaryValue: primaryValues[i],
          secondaryValue: secondaryValues[i]
        }));
        triplets.sort((a, b) => b.primaryValue - a.primaryValue);
        
        // Extract sorted arrays
        categories = triplets.map(t => t.category);
        primaryValues = triplets.map(t => t.primaryValue);
        secondaryValues = triplets.map(t => t.secondaryValue);
      }
      
      setChartData({
        labels: categories,
        datasets: [
          {
            label: options.primaryLabel || 'Primary Values',
            data: primaryValues,
            backgroundColor: options.primaryColor || '#4285F4',
            borderColor: options.borderColor || 'rgba(0, 0, 0, 0.1)',
            borderWidth: options.borderWidth || 1,
            yAxisID: 'y'
          },
          {
            label: options.secondaryLabel || 'Secondary Values',
            data: secondaryValues,
            backgroundColor: options.secondaryColor || '#34A853',
            borderColor: options.borderColor || 'rgba(0, 0, 0, 0.1)',
            borderWidth: options.borderWidth || 1,
            yAxisID: 'y1'
          }
        ],
      });
      
      // Generate server-side chart
      setIsLoading(true);
      generateChart(categories, primaryValues, { 
        ...options, 
        chartType: 'dualYBar',
        secondaryValues: secondaryValues
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
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: options.primaryAxisLabel || 'Primary Values',
          font: {
            size: options.axisFontSize || 14,
            family: options.fontFamily || 'Arial',
            color: options.primaryColor || '#4285F4'
          }
        },
        ticks: {
          font: {
            size: options.tickFontSize || 12,
            family: options.fontFamily || 'Arial',
            color: options.fontColor || '#333333'
          },
          color: options.primaryColor || '#4285F4'
        },
        grid: {
          color: options.gridColor || 'rgba(0, 0, 0, 0.1)'
        },
        beginAtZero: options.beginAtZero !== false
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: options.secondaryAxisLabel || 'Secondary Values',
          font: {
            size: options.axisFontSize || 14,
            family: options.fontFamily || 'Arial',
            color: options.secondaryColor || '#34A853'
          }
        },
        ticks: {
          font: {
            size: options.tickFontSize || 12,
            family: options.fontFamily || 'Arial',
            color: options.fontColor || '#333333'
          },
          color: options.secondaryColor || '#34A853'
        },
        grid: {
          drawOnChartArea: false,
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
      link.download = 'bioplot-dual-y-bar-chart.png';
      link.href = serverImage;
      link.click();
    } 
    // Fallback to client-side chart
    else if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = 'bioplot-dual-y-bar-chart.png';
      link.href = url;
      link.click();
    }
  };

  const loadSampleData = () => {
    const sampleCategories = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'];
    const samplePrimaryValues = [65, 59, 80, 81, 56];
    const sampleSecondaryValues = [28, 48, 40, 19, 36];
    
    onOptionsChange({
      title: 'Dual Y-Axis Bar Chart',
      xAxisLabel: 'Days',
      primaryAxisLabel: 'Temperature (°C)',
      secondaryAxisLabel: 'Humidity (%)',
      primaryLabel: 'Temperature',
      secondaryLabel: 'Humidity',
      primaryColor: '#FF6384',
      secondaryColor: '#36A2EB'
    });
    
    return { 
      categories: sampleCategories, 
      primaryValues: samplePrimaryValues,
      secondaryValues: sampleSecondaryValues
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
            <label htmlFor="primaryAxisLabel">Primary Y-Axis Label (Left)</label>
            <input
              type="text"
              id="primaryAxisLabel"
              name="primaryAxisLabel"
              value={options.primaryAxisLabel || ''}
              onChange={handleOptionChange}
              placeholder="Primary Y-Axis Label"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="secondaryAxisLabel">Secondary Y-Axis Label (Right)</label>
            <input
              type="text"
              id="secondaryAxisLabel"
              name="secondaryAxisLabel"
              value={options.secondaryAxisLabel || ''}
              onChange={handleOptionChange}
              placeholder="Secondary Y-Axis Label"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="primaryLabel">Primary Data Label</label>
            <input
              type="text"
              id="primaryLabel"
              name="primaryLabel"
              value={options.primaryLabel || ''}
              onChange={handleOptionChange}
              placeholder="Primary Data Label"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="secondaryLabel">Secondary Data Label</label>
            <input
              type="text"
              id="secondaryLabel"
              name="secondaryLabel"
              value={options.secondaryLabel || ''}
              onChange={handleOptionChange}
              placeholder="Secondary Data Label"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="primaryColor">Primary Bar Color</label>
            <input
              type="color"
              id="primaryColor"
              name="primaryColor"
              value={options.primaryColor || '#4285F4'}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="secondaryColor">Secondary Bar Color</label>
            <input
              type="color"
              id="secondaryColor"
              name="secondaryColor"
              value={options.secondaryColor || '#34A853'}
              onChange={handleOptionChange}
            />
          </div>
          
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
              Sort Bars by Primary Value (Descending)
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
              Begin Y-Axes at Zero
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

export default DualYBarModule;
