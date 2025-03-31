import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import { generateChart } from '../../utils/api';

const Plot = createPlotlyComponent(Plotly);

function GeneUpDownBarChart({ data, onOptionsChange }) {
  const [options, setOptions] = useState({
    title: 'Gene Expression Up/Down Regulation',
    xAxisLabel: 'Genes',
    yAxisLabel: 'Log2 Fold Change',
    upColor: '#FF4444',
    downColor: '#00FF00',
    showValues: true,
    fontSize: 12,
    barWidth: 0.8,
    sortBars: false,
    threshold: 0
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
          chartType: 'geneUpDownBar'
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
    
    // Extract genes and fold changes
    const genes = dataRows.map(row => row[0]);
    const foldChanges = dataRows.map(row => parseFloat(row[1]));
    
    // Sort data if needed
    if (options.sortBars) {
      const indices = Array.from(Array(genes.length).keys());
      indices.sort((a, b) => foldChanges[b] - foldChanges[a]);
      
      const sortedGenes = indices.map(i => genes[i]);
      const sortedFoldChanges = indices.map(i => foldChanges[i]);
      
      genes.splice(0, genes.length, ...sortedGenes);
      foldChanges.splice(0, foldChanges.length, ...sortedFoldChanges);
    }
    
    // Separate up and down regulated genes
    const upRegulated = [];
    const downRegulated = [];
    const upRegulatedGenes = [];
    const downRegulatedGenes = [];
    
    foldChanges.forEach((fc, i) => {
      if (fc >= options.threshold) {
        upRegulated.push(fc);
        upRegulatedGenes.push(genes[i]);
        downRegulated.push(null);
        downRegulatedGenes.push(null);
      } else {
        upRegulated.push(null);
        upRegulatedGenes.push(null);
        downRegulated.push(fc);
        downRegulatedGenes.push(genes[i]);
      }
    });
    
    // Create the gene up/down bar data
    const barData = [
      {
        type: 'bar',
        x: genes,
        y: upRegulated,
        name: 'Up-regulated',
        marker: {
          color: options.upColor
        },
        hoverinfo: 'text',
        hovertext: genes.map((gene, i) => upRegulated[i] !== null ? `${gene}: ${upRegulated[i]}` : null).filter(Boolean),
        text: options.showValues ? upRegulated.map(v => v !== null ? v.toFixed(2) : null) : null,
        textposition: 'outside',
        width: parseFloat(options.barWidth)
      },
      {
        type: 'bar',
        x: genes,
        y: downRegulated,
        name: 'Down-regulated',
        marker: {
          color: options.downColor
        },
        hoverinfo: 'text',
        hovertext: genes.map((gene, i) => downRegulated[i] !== null ? `${gene}: ${downRegulated[i]}` : null).filter(Boolean),
        text: options.showValues ? downRegulated.map(v => v !== null ? v.toFixed(2) : null) : null,
        textposition: 'outside',
        width: parseFloat(options.barWidth)
      }
    ];
    
    setChartData(barData);
    setIsLoading(false);
  };

  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setOptions(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
    }));
    
    if (onOptionsChange) {
      onOptionsChange({
        [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value
      });
    }
  };

  const downloadChart = () => {
    if (serverImage) {
      const link = document.createElement('a');
      link.download = 'gene-up-down-bar-chart.png';
      link.href = serverImage;
      link.click();
    } else if (chartRef.current) {
      Plotly.downloadImage(chartRef.current.el, {
        format: 'png',
        filename: 'gene-up-down-bar-chart'
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
      zeroline: true,
      zerolinecolor: '#969696',
      zerolinewidth: 2
    },
    barmode: 'group',
    bargap: 0.15,
    bargroupgap: 0.1,
    margin: {
      l: 80,
      r: 50,
      b: 100,
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
          <h3>Gene Up/Down Bar Chart Options</h3>
          
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
            <label htmlFor="upColor">Up-regulated Color</label>
            <input
              type="color"
              id="upColor"
              name="upColor"
              value={options.upColor}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="downColor">Down-regulated Color</label>
            <input
              type="color"
              id="downColor"
              name="downColor"
              value={options.downColor}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="threshold">Threshold</label>
            <input
              type="number"
              id="threshold"
              name="threshold"
              value={options.threshold}
              onChange={handleOptionChange}
              step="0.1"
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
                <img src={serverImage} alt="Generated gene up/down bar chart" />
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

export default GeneUpDownBarChart;
