import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import { generateChart } from '../../utils/api';

const Plot = createPlotlyComponent(Plotly);

function CircosPlot({ data, onOptionsChange }) {
  const [options, setOptions] = useState({
    title: 'Circos Plot',
    showLegend: true,
    colorScheme: 'Category10',
    fontSize: 12,
    showLabels: true,
    labelSize: 10,
    bundling: true,
    opacity: 0.8
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
          chartType: 'circos'
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
    
    // Extract source, target and values
    const sources = dataRows.map(row => row[0]);
    const targets = dataRows.map(row => row[1]);
    const values = dataRows.map(row => parseFloat(row[2] || "1"));
    
    // Get unique nodes
    const nodes = [...new Set([...sources, ...targets])];
    
    // Create colors based on the scheme
    const colors = getColors(nodes.length, options.colorScheme);
    
    // Create node positions in a circle
    const nodePositions = {};
    const radius = 1;
    nodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / nodes.length;
      nodePositions[node] = {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      };
    });
    
    // Create the circos plot data
    const circosData = [
      // Nodes
      {
        type: 'scatter',
        mode: 'markers+text',
        x: nodes.map(node => nodePositions[node].x),
        y: nodes.map(node => nodePositions[node].y),
        text: nodes,
        textposition: 'top center',
        textfont: {
          size: parseInt(options.labelSize),
          color: options.showLabels ? '#000000' : 'rgba(0,0,0,0)'
        },
        marker: {
          size: 10,
          color: colors,
          line: {
            width: 1,
            color: '#000000'
          }
        },
        hoverinfo: 'text',
        hovertext: nodes,
        showlegend: false
      }
    ];
    
    // Add links between nodes
    for (let i = 0; i < sources.length; i++) {
      const source = sources[i];
      const target = targets[i];
      const value = values[i];
      
      if (source === target) continue;
      
      const sourcePos = nodePositions[source];
      const targetPos = nodePositions[target];
      
      // Create a curved path between nodes
      const path = [];
      if (options.bundling) {
        // Create a curved path with control points
        const midX = (sourcePos.x + targetPos.x) / 2;
        const midY = (sourcePos.y + targetPos.y) / 2;
        const dx = targetPos.x - sourcePos.x;
        const dy = targetPos.y - sourcePos.y;
        const norm = Math.sqrt(dx * dx + dy * dy);
        const normal = { x: -dy / norm, y: dx / norm };
        
        // Control point is perpendicular to the midpoint
        const curvature = 0.2;
        const ctrlX = midX + normal.x * curvature;
        const ctrlY = midY + normal.y * curvature;
        
        // Create a quadratic Bezier curve
        const steps = 20;
        for (let t = 0; t <= 1; t += 1/steps) {
          const x = (1-t)*(1-t)*sourcePos.x + 2*(1-t)*t*ctrlX + t*t*targetPos.x;
          const y = (1-t)*(1-t)*sourcePos.y + 2*(1-t)*t*ctrlY + t*t*targetPos.y;
          path.push([x, y]);
        }
      } else {
        // Simple straight line
        path.push([sourcePos.x, sourcePos.y]);
        path.push([targetPos.x, targetPos.y]);
      }
      
      // Add the link
      circosData.push({
        type: 'scatter',
        mode: 'lines',
        x: path.map(p => p[0]),
        y: path.map(p => p[1]),
        line: {
          width: Math.max(1, Math.min(5, value)),
          color: colors[nodes.indexOf(source)],
          opacity: parseFloat(options.opacity)
        },
        hoverinfo: 'text',
        hovertext: `${source} → ${target}: ${value}`,
        showlegend: false
      });
    }
    
    setChartData(circosData);
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
      link.download = 'circos-plot.png';
      link.href = serverImage;
      link.click();
    } else if (chartRef.current) {
      Plotly.downloadImage(chartRef.current.el, {
        format: 'png',
        filename: 'circos-plot'
      });
    }
  };

  const colorSchemeOptions = ['Category10', 'Set1', 'Set2', 'Paired'];

  const layout = {
    title: options.title,
    font: {
      size: parseInt(options.fontSize)
    },
    showlegend: options.showLegend,
    xaxis: {
      zeroline: false,
      showgrid: false,
      showticklabels: false,
      range: [-1.2, 1.2]
    },
    yaxis: {
      zeroline: false,
      showgrid: false,
      showticklabels: false,
      range: [-1.2, 1.2],
      scaleanchor: 'x'
    },
    margin: {
      l: 50,
      r: 50,
      b: 50,
      t: 80,
      pad: 4
    },
    hovermode: 'closest'
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
          <h3>Circos Plot Options</h3>
          
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
            <label htmlFor="labelSize">Label Size</label>
            <input
              type="number"
              id="labelSize"
              name="labelSize"
              value={options.labelSize}
              onChange={handleOptionChange}
              min="8"
              max="24"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="opacity">Link Opacity</label>
            <input
              type="range"
              id="opacity"
              name="opacity"
              value={options.opacity}
              onChange={handleOptionChange}
              min="0.1"
              max="1"
              step="0.1"
            />
            <span>{options.opacity}</span>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="showLabels"
                checked={options.showLabels}
                onChange={handleOptionChange}
              />
              Show Node Labels
            </label>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="bundling"
                checked={options.bundling}
                onChange={handleOptionChange}
              />
              Enable Edge Bundling
            </label>
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
                <img src={serverImage} alt="Generated circos plot" />
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

export default CircosPlot;
