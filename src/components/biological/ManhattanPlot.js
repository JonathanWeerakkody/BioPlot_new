import React, { useState, useEffect, useRef } from 'react';
import Plotly from 'plotly.js';
import createPlotlyComponent from 'react-plotly.js/factory';
import { generateChart } from '../../utils/api';

const Plot = createPlotlyComponent(Plotly);

function ManhattanPlot({ data, onOptionsChange }) {
  const [options, setOptions] = useState({
    title: 'Manhattan Plot',
    xAxisLabel: 'Chromosome',
    yAxisLabel: '-log10(p-value)',
    colorScheme: 'Alternating',
    fontSize: 12,
    pointSize: 5,
    significanceThreshold: 5,
    thresholdLineColor: '#FF0000',
    showThresholdLine: true,
    highlightSignificant: true
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
          chartType: 'manhattan'
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
    
    // Extract chromosome, position, and p-value
    const chromosomes = dataRows.map(row => row[0]);
    const positions = dataRows.map(row => parseFloat(row[1]));
    const pValues = dataRows.map(row => parseFloat(row[2]));
    
    // Calculate -log10(p-value)
    const logPValues = pValues.map(p => -Math.log10(p));
    
    // Get unique chromosomes
    const uniqueChromosomes = [...new Set(chromosomes)];
    
    // Create colors based on the scheme
    let colors;
    if (options.colorScheme === 'Alternating') {
      colors = chromosomes.map((chr, i) => {
        const chrIndex = uniqueChromosomes.indexOf(chr);
        return chrIndex % 2 === 0 ? '#1f77b4' : '#ff7f0e';
      });
    } else {
      colors = getColors(uniqueChromosomes.length, options.colorScheme);
      colors = chromosomes.map(chr => colors[uniqueChromosomes.indexOf(chr)]);
    }
    
    // Highlight significant points if enabled
    if (options.highlightSignificant) {
      colors = colors.map((color, i) => {
        return logPValues[i] >= options.significanceThreshold ? '#FF0000' : color;
      });
    }
    
    // Create the Manhattan plot data
    const manhattanData = [{
      type: 'scatter',
      mode: 'markers',
      x: chromosomes.map((chr, i) => `${chr}:${positions[i]}`),
      y: logPValues,
      marker: {
        size: parseInt(options.pointSize),
        color: colors,
        opacity: 0.7
      },
      hoverinfo: 'text',
      hovertext: chromosomes.map((chr, i) => `Chr ${chr}, Pos ${positions[i]}, P-value: ${pValues[i].toExponential(2)}`),
      showlegend: false
    }];
    
    // Add significance threshold line if enabled
    if (options.showThresholdLine) {
      manhattanData.push({
        type: 'scatter',
        mode: 'lines',
        x: [chromosomes[0], chromosomes[chromosomes.length - 1]],
        y: [options.significanceThreshold, options.significanceThreshold],
        line: {
          color: options.thresholdLineColor,
          width: 2,
          dash: 'dash'
        },
        hoverinfo: 'text',
        hovertext: `Significance threshold: ${options.significanceThreshold}`,
        showlegend: false
      });
    }
    
    setChartData(manhattanData);
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
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) : value
    }));
    
    if (onOptionsChange) {
      onOptionsChange({
        [name]: type === 'checkbox' ? checked : 
                type === 'number' ? parseFloat(value) : value
      });
    }
  };

  const downloadChart = () => {
    if (serverImage) {
      const link = document.createElement('a');
      link.download = 'manhattan-plot.png';
      link.href = serverImage;
      link.click();
    } else if (chartRef.current) {
      Plotly.downloadImage(chartRef.current.el, {
        format: 'png',
        filename: 'manhattan-plot'
      });
    }
  };

  const colorSchemeOptions = ['Alternating', 'Category10', 'Set1', 'Set2', 'Paired'];

  const layout = {
    title: options.title,
    font: {
      size: parseInt(options.fontSize)
    },
    xaxis: {
      title: options.xAxisLabel,
      tickangle: -45,
      tickmode: 'array',
      tickvals: [...new Set(chartData ? chartData[0].x : [])].filter((_, i) => i % 10 === 0)
    },
    yaxis: {
      title: options.yAxisLabel,
      zeroline: false
    },
    margin: {
      l: 80,
      r: 50,
      b: 100,
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
          <h3>Manhattan Plot Options</h3>
          
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
            <label htmlFor="pointSize">Point Size</label>
            <input
              type="range"
              id="pointSize"
              name="pointSize"
              value={options.pointSize}
              onChange={handleOptionChange}
              min="1"
              max="10"
              step="1"
            />
            <span>{options.pointSize}</span>
          </div>
          
          <div className="form-group">
            <label htmlFor="significanceThreshold">Significance Threshold (-log10)</label>
            <input
              type="number"
              id="significanceThreshold"
              name="significanceThreshold"
              value={options.significanceThreshold}
              onChange={handleOptionChange}
              step="0.5"
              min="0"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="thresholdLineColor">Threshold Line Color</label>
            <input
              type="color"
              id="thresholdLineColor"
              name="thresholdLineColor"
              value={options.thresholdLineColor}
              onChange={handleOptionChange}
            />
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="showThresholdLine"
                checked={options.showThresholdLine}
                onChange={handleOptionChange}
              />
              Show Threshold Line
            </label>
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                name="highlightSignificant"
                checked={options.highlightSignificant}
                onChange={handleOptionChange}
              />
              Highlight Significant Points
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
                <img src={serverImage} alt="Generated Manhattan plot" />
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

export default ManhattanPlot;
