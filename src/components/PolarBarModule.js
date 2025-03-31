import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend } from 'chart.js';
import { PolarArea } from 'react-chartjs-2';
import { generateChart } from '../utils/api';
import './BarChartModule.css';

// Register ChartJS components
ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

function PolarBarModule({ data, options, onOptionsChange }) {
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
      
      // Generate colors if not provided
      const backgroundColors = options.colors || 
        values.map((_, i) => getDefaultColor(i, options.colorOpacity || 0.7));
      
      const borderColors = options.borderColors || 
        values.map((_, i) => getDefaultColor(i, 1));
      
      setChartData({
        labels: categories,
        datasets: [
          {
            label: options.dataLabel || 'Values',
            data: values,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: options.borderWidth || 1,
          },
        ],
      });
      
      // Generate server-side chart
      setIsLoading(true);
      generateChart(categories, values, { ...options, chartType: 'polarBar' })
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
  const getDefaultColor = (index, alpha = 1) => {
    const defaultColors = [
      `rgba(66, 133, 244, ${alpha})`,   // Blue
      `rgba(52, 168, 83, ${alpha})`,    // Green
      `rgba(251, 188, 5, ${alpha})`,    // Yellow
      `rgba(234, 67, 53, ${alpha})`,    // Red
      `rgba(143, 68, 173, ${alpha})`,   // Purple
      `rgba(22, 160, 133, ${alpha})`,   // Teal
      `rgba(243, 156, 18, ${alpha})`,   // Orange
      `rgba(127, 140, 141, ${alpha})`   // Gray
    ];
    return defaultColors[index % defaultColors.length];
  };

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
            return `${context.label}: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      r: {
        ticks: {
          font: {
            size: options.tickFontSize || 12,
            family: options.fontFamily || 'Arial',
            color: options.fontColor || '#333333'
          },
          backdropColor: options.backgroundColor || 'rgba(255, 255, 255, 0.75)'
        },
        grid: {
          color: options.gridColor || 'rgba(0, 0, 0, 0.1)'
        },
        angleLines: {
          color: options.gridColor || 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: options.labelFontSize || 12,
            family: options.fontFamily || 'Arial',
            color: options.fontColor || '#333333'
          }
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
      link.download = 'bioplot-polar-bar-chart.png';
      link.href = serverImage;
      link.click();
    } 
    // Fallback to client-side chart
    else if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = 'bioplot-polar-bar-chart.png';
      link.href = url;
      link.click();
    }
  };

  const loadSampleData = () => {
    const sampleCategories = ['Category A', 'Category B', 'Category C', 'Category D', 'Category E', 'Category F'];
    const sampleValues = [11, 16, 7, 14, 12, 9];
    
    onOptionsChange({
      title: 'Polar Bar Chart',
      dataLabel: 'Sample Data',
      colorOpacity: 0.7,
      showLegend: true
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
            <label htmlFor="dataLabel">Data Label</label>
            <input
              type="text"
              id="dataLabel"
              name="dataLabel"
              value={options.dataLabel || ''}
              onChange={handleOptionChange}
              placeholder="Data Label"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="colorOpacity">Color Opacity</label>
            <input
              type="range"
              id="colorOpacity"
              name="colorOpacity"
              min="0.1"
              max="1"
              step="0.1"
              value={options.colorOpacity || 0.7}
              onChange={handleOptionChange}
            />
            <span>{options.colorOpacity || 0.7}</span>
          </div>
          
          <div className="form-group">
            <label htmlFor="borderWidth">Border Width</label>
            <input
              type="number"
              id="borderWidth"
              name="borderWidth"
              value={options.borderWidth || 1}
              onChange={handleOptionChange}
              min="0"
              max="10"
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
            <label htmlFor="backgroundColor">Background Color</label>
            <input
              type="color"
              id="backgroundColor"
              name="backgroundColor"
              value={options.backgroundColor || '#FFFFFF'}
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
            <label htmlFor="labelFontSize">Label Font Size</label>
            <input
              type="number"
              id="labelFontSize"
              name="labelFontSize"
              value={options.labelFontSize || 12}
              onChange={handleOptionChange}
              min="8"
              max="24"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="tickFontSize">Tick Font Size</label>
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
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="sortBars"
                checked={options.sortBars || false}
                onChange={handleOptionChange}
              />
              Sort Segments by Value (Descending)
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
              Begin Scale at Zero
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
              <PolarArea 
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

export default PolarBarModule;
