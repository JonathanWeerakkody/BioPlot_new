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

function ButterflyBarModule({ data, options, onOptionsChange }) {
  const [chartData, setChartData] = useState(null);
  const [serverImage, setServerImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);
  
  // Update chart data when input data or options change
  useEffect(() => {
    if (data && data.categories && data.leftValues && data.rightValues) {
      // Apply sorting if enabled
      let categories = [...data.categories];
      let leftValues = [...data.leftValues];
      let rightValues = [...data.rightValues];
      
      if (options.sortBars) {
        // Create triplets and sort by sum of absolute values
        const triplets = categories.map((category, i) => ({ 
          category, 
          leftValue: leftValues[i],
          rightValue: rightValues[i],
          sumAbs: Math.abs(leftValues[i]) + Math.abs(rightValues[i])
        }));
        triplets.sort((a, b) => b.sumAbs - a.sumAbs);
        
        // Extract sorted arrays
        categories = triplets.map(t => t.category);
        leftValues = triplets.map(t => t.leftValue);
        rightValues = triplets.map(t => t.rightValue);
      }
      
      // Convert right values to negative for butterfly effect
      const negativeRightValues = rightValues.map(value => -Math.abs(value));
      
      setChartData({
        labels: categories,
        datasets: [
          {
            label: options.leftLabel || 'Left Values',
            data: leftValues,
            backgroundColor: options.leftColor || '#4285F4',
            borderColor: options.borderColor || 'rgba(0, 0, 0, 0.1)',
            borderWidth: options.borderWidth || 1,
          },
          {
            label: options.rightLabel || 'Right Values',
            data: negativeRightValues,
            backgroundColor: options.rightColor || '#EA4335',
            borderColor: options.borderColor || 'rgba(0, 0, 0, 0.1)',
            borderWidth: options.borderWidth || 1,
          }
        ],
      });
      
      // Generate server-side chart
      setIsLoading(true);
      generateChart(categories, leftValues, { 
        ...options, 
        chartType: 'butterflyBar',
        rightValues: rightValues
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
    indexAxis: options.horizontal ? 'y' : 'x',
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
            const value = context.raw;
            // For right values (negative in the chart), show the absolute value
            return `${context.dataset.label}: ${Math.abs(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        stacked: true,
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
          },
          callback: function(value) {
            // For y-axis, show absolute values
            return Math.abs(value);
          }
        },
        grid: {
          color: options.gridColor || 'rgba(0, 0, 0, 0.1)'
        }
      },
      y: {
        stacked: true,
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
          },
          callback: function(value) {
            // For y-axis, show absolute values
            return Math.abs(value);
          }
        },
        grid: {
          color: options.gridColor || 'rgba(0, 0, 0, 0.1)'
        }
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
      link.download = 'bioplot-butterfly-bar-chart.png';
      link.href = serverImage;
      link.click();
    } 
    // Fallback to client-side chart
    else if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = 'bioplot-butterfly-bar-chart.png';
      link.href = url;
      link.click();
    }
  };

  const loadSampleData = () => {
    const sampleCategories = ['Category 1', 'Category 2', 'Category 3', 'Category 4', 'Category 5'];
    const sampleLeftValues = [65, 59, 80, 81, 56];
    const sampleRightValues = [28, 48, 40, 19, 36];
    
    onOptionsChange({
      title: 'Butterfly Bar Chart',
      xAxisLabel: options.horizontal ? 'Values' : 'Categories',
      yAxisLabel: options.horizontal ? 'Categories' : 'Values',
      leftLabel: 'Group A',
      rightLabel: 'Group B',
      leftColor: '#4285F4',
      rightColor: '#EA4335'
    });
    
    return { 
      categories: sampleCategories, 
      leftValues: sampleLeftValues,
      rightValues: sampleRightValues
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
            <label htmlFor="leftLabel">Left Group Label</label>
            <input
              type="text"
              id="leftLabel"
              name="leftLabel"
              value={options.leftLabel || ''}
              onChange={handleOptionChange}
              placeholder="Left Group Label"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="rightLabel">Right Group Label</label>
            <input
              type="text"
              id="rightLabel"
              name="rightLabel"
              value={options.rightLabel || ''}
              onChange={handleOptionChange}
              placeholder="Right Group Label"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="leftColor">Left Group Color</label>
            <input
              type="color"
              id="leftColor"
              name="leftColor"
              value={options.leftColor || '#4285F4'}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="rightColor">Right Group Color</label>
            <input
              type="color"
              id="rightColor"
              name="rightColor"
              value={options.rightColor || '#EA4335'}
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
                name="sortBars"
                checked={options.sortBars || false}
                onChange={handleOptionChange}
              />
              Sort Bars by Total Value (Descending)
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

export default ButterflyBarModule;
