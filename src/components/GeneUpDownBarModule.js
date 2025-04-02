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

function GeneUpDownBarModule({ data, options, onOptionsChange }) {
  const [chartData, setChartData] = useState(null);
  const [serverImage, setServerImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);
  
  // Update chart data when input data or options change
  useEffect(() => {
    if (data && data.genes && data.values) {
      // Apply sorting if enabled
      let genes = [...data.genes];
      let values = [...data.values];
      
      if (options.sortBars) {
        // Create pairs and sort
        const pairs = genes.map((gene, i) => ({ gene, value: values[i] }));
        pairs.sort((a, b) => b.value - a.value);
        
        // Extract sorted arrays
        genes = pairs.map(pair => pair.gene);
        values = pairs.map(pair => pair.value);
      }
      
      // Create datasets with different colors for positive and negative values
      const positiveValues = [];
      const negativeValues = [];
      
      values.forEach(value => {
        if (value >= 0) {
          positiveValues.push(value);
          negativeValues.push(null);
        } else {
          positiveValues.push(null);
          negativeValues.push(value);
        }
      });
      
      setChartData({
        labels: genes,
        datasets: [
          {
            label: 'Up-regulated',
            data: positiveValues,
            backgroundColor: options.upBarColor || '#FF0000',
            borderColor: options.borderColor || 'rgba(0, 0, 0, 0.1)',
            borderWidth: options.borderWidth || 1,
          },
          {
            label: 'Down-regulated',
            data: negativeValues,
            backgroundColor: options.downBarColor || '#00FF00',
            borderColor: options.borderColor || 'rgba(0, 0, 0, 0.1)',
            borderWidth: options.borderWidth || 1,
          }
        ],
      });
      
      // Generate server-side chart
      setIsLoading(true);
      generateChart(genes, values, { ...options, chartType: 'geneUpDown' })
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
        display: true,
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
          text: options.xAxisLabel || 'Genes',
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
          text: options.yAxisLabel || 'Log2 Fold Change',
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
      link.download = 'bioplot-gene-updown-chart.png';
      link.href = serverImage;
      link.click();
    } 
    // Fallback to client-side chart
    else if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = 'bioplot-gene-updown-chart.png';
      link.href = url;
      link.click();
    }
  };

  const loadSampleData = () => {
    const sampleGenes = ['miR-1', 'miR-2', 'miR-3', 'miR-4', 'miR-5', 'miR-6'];
    const sampleValues = [3.3, 2.5, 2.3, -2.2, -3.4, -3.8];
    
    onOptionsChange({
      title: 'Gene Expression Fold Change',
      xAxisLabel: 'miRNAs',
      yAxisLabel: 'log2FC',
      upBarColor: '#FF0000',
      downBarColor: '#00FF00'
    });
    
    return { genes: sampleGenes, values: sampleValues };
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
            <label htmlFor="upBarColor">Up-regulated Bar Color</label>
            <input
              type="color"
              id="upBarColor"
              name="upBarColor"
              value={options.upBarColor || '#FF0000'}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="downBarColor">Down-regulated Bar Color</label>
            <input
              type="color"
              id="downBarColor"
              name="downBarColor"
              value={options.downBarColor || '#00FF00'}
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
              Sort Bars by Value (Descending)
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

export default GeneUpDownBarModule;
