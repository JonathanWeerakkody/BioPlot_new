import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Chart } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function ClusterHeatmapModule({ data, setData }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [plotData, setPlotData] = useState(null);
  const [plotOptions, setPlotOptions] = useState({
    title: 'Cluster Heatmap',
    subtitle: 'Gene Expression Data',
    xAxisLabel: 'Samples',
    yAxisLabel: 'Genes',
    colorScheme: 'viridis',
    fontSize: 12,
    width: 800,
    height: 600,
    marginTop: 50,
    marginRight: 50,
    marginBottom: 100,
    marginLeft: 100,
    distanceMetric: 'euclidean',
    linkageMethod: 'complete',
    normalizeData: true,
    logTransform: false,
    showDendrograms: true,
    showGroupAnnotations: true
  });
  
  const chartRef = useRef(null);
  
  // Sample data for demonstration
  const sampleData = `Group\tA\tA\tA\tB\tB\tB
sample\tA-1\tA-2\tA-3\tB-1\tB-2\tB-3
ICA1\t5.7\t11.7\t9.9\t5.7\t4.5\t3.2
DBNDD1\t9.43\t10.67\t9.39\t3.4\t2.5\t2.3
ALS2\t10.59\t9.89\t8.5\t4.2\t5.75\t2.5
CASP10\t10.38\t10.2\t8.5\t5.1\t2.8\t2.4
CFLAR\t5.75\t10.85\t10.9\t3.9\t4.2\t2.8
TFPI\t9.82\t10.45\t8.5\t2.5\t3.4\t3.5
NDUFAF7\t8.9\t11.02\t10.33\t5.75\t2.4\t5.75
RBM5\t10.59\t10.67\t9.94\t6.55\t5.75\t5.55
MTMR7\t2.5\t5.2\t3.5\t9.21\t9.76\t11.47
SLC7A2\t3.5\t4.2\t2.5\t9.21\t11.78\t5.75
ARF5\t4.5\t3.2\t2.7\t9.89\t10.72\t8.81
SARM1\t3.5\t2.2\t1.9\t10.85\t9.76\t9.73
POLDIP2\t3.5\t4.2\t3.5\t11.33\t9.76\t10.49
PLXND1\t5.1\t1.2\t5.75\t11.22\t9.76\t8.81`;

  const loadSampleData = () => {
    setData(sampleData);
  };

  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlotOptions({
      ...plotOptions,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleNumberOptionChange = (e) => {
    const { name, value } = e.target;
    setPlotOptions({
      ...plotOptions,
      [name]: Number(value)
    });
  };

  const generatePlot = async () => {
    if (!data) {
      setError('No data provided');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post('/api/cluster_heatmap', {
        data: data,
        options: plotOptions
      });

      if (response.data.error) {
        setError(response.data.error);
      } else {
        setPlotData(response.data);
      }
    } catch (err) {
      setError('Error generating plot: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const exportPlot = (format) => {
    if (!chartRef.current) return;
    
    const canvas = chartRef.current.canvas;
    
    if (format === 'png') {
      const link = document.createElement('a');
      link.download = 'cluster_heatmap.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    } else if (format === 'svg') {
      // Convert canvas to SVG
      // This is a simplified approach - in a real implementation,
      // you might need a more sophisticated conversion
      const svgData = new XMLSerializer().serializeToString(canvas);
      const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
      const svgUrl = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.download = 'cluster_heatmap.svg';
      link.href = svgUrl;
      link.click();
    } else if (format === 'pdf') {
      // For PDF, you might need a library like jsPDF
      alert('PDF export not implemented in this demo');
    }
  };

  return (
    <div className="module-container">
      <div className="options-container">
        <h3>Cluster Heatmap Options</h3>
        
        <div className="option-section">
          <h4>Data Options</h4>
          <button onClick={loadSampleData}>Load Sample Data</button>
          <div className="option-row">
            <label>
              <input
                type="checkbox"
                name="normalizeData"
                checked={plotOptions.normalizeData}
                onChange={handleOptionChange}
              />
              Normalize Data (Z-score)
            </label>
          </div>
          <div className="option-row">
            <label>
              <input
                type="checkbox"
                name="logTransform"
                checked={plotOptions.logTransform}
                onChange={handleOptionChange}
              />
              Log Transform Data
            </label>
          </div>
        </div>
        
        <div className="option-section">
          <h4>Clustering Options</h4>
          <div className="option-row">
            <label>
              Distance Metric:
              <select
                name="distanceMetric"
                value={plotOptions.distanceMetric}
                onChange={handleOptionChange}
              >
                <option value="euclidean">Euclidean</option>
                <option value="manhattan">Manhattan</option>
                <option value="correlation">Pearson Correlation</option>
              </select>
            </label>
          </div>
          <div className="option-row">
            <label>
              Linkage Method:
              <select
                name="linkageMethod"
                value={plotOptions.linkageMethod}
                onChange={handleOptionChange}
              >
                <option value="complete">Complete</option>
                <option value="average">Average</option>
                <option value="single">Single</option>
                <option value="ward">Ward</option>
              </select>
            </label>
          </div>
          <div className="option-row">
            <label>
              <input
                type="checkbox"
                name="showDendrograms"
                checked={plotOptions.showDendrograms}
                onChange={handleOptionChange}
              />
              Show Dendrograms
            </label>
          </div>
          <div className="option-row">
            <label>
              <input
                type="checkbox"
                name="showGroupAnnotations"
                checked={plotOptions.showGroupAnnotations}
                onChange={handleOptionChange}
              />
              Show Group Annotations
            </label>
          </div>
        </div>
        
        <div className="option-section">
          <h4>Appearance Options</h4>
          <div className="option-row">
            <label>
              Color Scheme:
              <select
                name="colorScheme"
                value={plotOptions.colorScheme}
                onChange={handleOptionChange}
              >
                <option value="viridis">Viridis</option>
                <option value="plasma">Plasma</option>
                <option value="inferno">Inferno</option>
                <option value="magma">Magma</option>
                <option value="cividis">Cividis</option>
                <option value="coolwarm">Coolwarm</option>
                <option value="RdBu">Red-Blue</option>
                <option value="RdYlBu">Red-Yellow-Blue</option>
              </select>
            </label>
          </div>
          <div className="option-row">
            <label>
              Title:
              <input
                type="text"
                name="title"
                value={plotOptions.title}
                onChange={handleOptionChange}
              />
            </label>
          </div>
          <div className="option-row">
            <label>
              Subtitle:
              <input
                type="text"
                name="subtitle"
                value={plotOptions.subtitle}
                onChange={handleOptionChange}
              />
            </label>
          </div>
          <div className="option-row">
            <label>
              X-Axis Label:
              <input
                type="text"
                name="xAxisLabel"
                value={plotOptions.xAxisLabel}
                onChange={handleOptionChange}
              />
            </label>
          </div>
          <div className="option-row">
            <label>
              Y-Axis Label:
              <input
                type="text"
                name="yAxisLabel"
                value={plotOptions.yAxisLabel}
                onChange={handleOptionChange}
              />
            </label>
          </div>
          <div className="option-row">
            <label>
              Font Size:
              <input
                type="number"
                name="fontSize"
                min="8"
                max="24"
                value={plotOptions.fontSize}
                onChange={handleNumberOptionChange}
              />
            </label>
          </div>
          <div className="option-row">
            <label>
              Width:
              <input
                type="number"
                name="width"
                min="400"
                max="1200"
                value={plotOptions.width}
                onChange={handleNumberOptionChange}
              />
            </label>
          </div>
          <div className="option-row">
            <label>
              Height:
              <input
                type="number"
                name="height"
                min="400"
                max="1200"
                value={plotOptions.height}
                onChange={handleNumberOptionChange}
              />
            </label>
          </div>
          <div className="option-row">
            <label>
              Margin Top:
              <input
                type="number"
                name="marginTop"
                min="10"
                max="200"
                value={plotOptions.marginTop}
                onChange={handleNumberOptionChange}
              />
            </label>
          </div>
          <div className="option-row">
            <label>
              Margin Right:
              <input
                type="number"
                name="marginRight"
                min="10"
                max="200"
                value={plotOptions.marginRight}
                onChange={handleNumberOptionChange}
              />
            </label>
          </div>
          <div className="option-row">
            <label>
              Margin Bottom:
              <input
                type="number"
                name="marginBottom"
                min="10"
                max="200"
                value={plotOptions.marginBottom}
                onChange={handleNumberOptionChange}
              />
            </label>
          </div>
          <div className="option-row">
            <label>
              Margin Left:
              <input
                type="number"
                name="marginLeft"
                min="10"
                max="200"
                value={plotOptions.marginLeft}
                onChange={handleNumberOptionChange}
              />
            </label>
          </div>
        </div>
        
        <div className="option-section">
          <button onClick={generatePlot} disabled={loading || !data}>
            {loading ? 'Generating...' : 'Generate Plot'}
          </button>
        </div>
        
        {plotData && (
          <div className="option-section">
            <h4>Export Options</h4>
            <button onClick={() => exportPlot('png')}>Export as PNG</button>
            <button onClick={() => exportPlot('svg')}>Export as SVG</button>
            <button onClick={() => exportPlot('pdf')}>Export as PDF</button>
          </div>
        )}
      </div>
      
      <div className="plot-container">
        {error && <div className="error-message">{error}</div>}
        {loading && <div className="loading-message">Generating plot...</div>}
        
        {plotData && (
          <div className="plot-display">
            <h3>{plotOptions.title}</h3>
            <h4>{plotOptions.subtitle}</h4>
            <div className="heatmap-container">
              {/* The actual heatmap will be rendered here when data is received from the backend */}
              <img 
                src={`data:image/png;base64,${plotData.plot}`} 
                alt="Cluster Heatmap" 
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ClusterHeatmapModule;
