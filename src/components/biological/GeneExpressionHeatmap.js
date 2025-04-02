import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import { generateChart } from '../../utils/api';

const Plot = createPlotlyComponent(Plotly);

function GeneExpressionHeatmap({ data, onOptionsChange }) {
  const [options, setOptions] = useState({
    title: 'Gene Expression Heatmap',
    xAxisLabel: 'Samples',
    yAxisLabel: 'Genes',
    colorScale: 'Viridis',
    showDendrogram: true,
    clusterRows: true,
    clusterColumns: false,
    fontSize: 12
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
          chartType: 'heatmap'
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
    const genes = rows.slice(1).map(row => row[0]);
    
    // Extract the expression values
    const expressionValues = rows.slice(1).map(row => 
      row.slice(1).map(val => parseFloat(val))
    );
    
    // Create the heatmap data
    const heatmapData = [{
      z: expressionValues,
      x: headers.slice(1),
      y: genes,
      type: 'heatmap',
      colorscale: options.colorScale.toLowerCase(),
      showscale: true,
      hoverongaps: false
    }];
    
    setChartData(heatmapData);
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
      link.download = 'gene-expression-heatmap.png';
      link.href = serverImage;
      link.click();
    } else if (chartRef.current) {
      Plotly.downloadImage(chartRef.current.el, {
        format: 'png',
        filename: 'gene-expression-heatmap'
      });
    }
  };

  const colorScaleOptions = [
    'Viridis', 'Plasma', 'Inferno', 'Magma', 'Cividis',
    'Warm', 'Cool', 'YlOrRd', 'YlGnBu', 'RdBu', 'Portland',
    'Jet', 'Hot', 'Greys', 'Greens', 'Blues', 'Reds'
  ];

  const layout = {
    title: options.title,
    xaxis: {
      title: options.xAxisLabel,
      tickangle: -45
    },
    yaxis: {
      title: options.yAxisLabel
    },
    font: {
      size: parseInt(options.fontSize)
    },
    margin: {
      l: 100,
      r: 50,
      b: 100,
      t: 50,
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
          <h3>Heatmap Options</h3>
          
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
            <label htmlFor="colorScale">Color Scale</label>
            <select
              id="colorScale"
              name="colorScale"
              value={options.colorScale}
              onChange={handleOptionChange}
            >
              {colorScaleOptions.map(scale => (
                <option key={scale} value={scale}>{scale}</option>
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
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="showDendrogram"
                checked={options.showDendrogram}
                onChange={handleOptionChange}
              />
              Show Dendrogram
            </label>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="clusterRows"
                checked={options.clusterRows}
                onChange={handleOptionChange}
              />
              Cluster Rows
            </label>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="clusterColumns"
                checked={options.clusterColumns}
                onChange={handleOptionChange}
              />
              Cluster Columns
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
              <div className="loading">Generating heatmap...</div>
            ) : serverImage ? (
              <div className="server-image">
                <img src={serverImage} alt="Generated heatmap" />
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

export default GeneExpressionHeatmap;
