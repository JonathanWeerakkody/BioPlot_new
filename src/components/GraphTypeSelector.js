import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './GraphTypeSelector.css';

// Import graph type images
import barChartImg from '../assets/bar_chart.png';
import errorBarImg from '../assets/error_bar.png';
import dualYBarImg from '../assets/dual_y_bar.png';
import horizontalBarImg from '../assets/horizontal_bar.png';
import stackedBarImg from '../assets/stacked_bar.png';
import polarBarImg from '../assets/polar_bar.png';
import dotBarImg from '../assets/dot_bar.png';
import trendBarImg from '../assets/trend_bar.png';
import butterflyBarImg from '../assets/butterfly_bar.png';
import groupedBarImg from '../assets/grouped_bar.png';
import geneUpDownImg from '../assets/gene_up_down.png';

function GraphTypeSelector() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const graphTypes = [
    {
      id: 'bar',
      name: 'Basic Bar Chart',
      description: 'Simple vertical bar chart for comparing values across categories',
      image: barChartImg,
      path: '/bar-chart'
    },
    {
      id: 'error-bar',
      name: 'Error Bar Chart',
      description: 'Bar chart with error bars to show data variability',
      image: errorBarImg,
      path: '/error-bar'
    },
    {
      id: 'dual-y',
      name: 'Dual Y-Axis Bar Chart',
      description: 'Bar chart with two Y-axes for comparing different scales',
      image: dualYBarImg,
      path: '/dual-y-bar'
    },
    {
      id: 'horizontal',
      name: 'Horizontal Bar Chart',
      description: 'Bar chart with horizontal orientation, ideal for long category names',
      image: horizontalBarImg,
      path: '/horizontal-bar'
    },
    {
      id: 'stacked',
      name: 'Stacked Bar Chart',
      description: 'Bar chart with stacked segments to show part-to-whole relationships',
      image: stackedBarImg,
      path: '/stacked-bar'
    },
    {
      id: 'polar',
      name: 'Polar Bar Chart',
      description: 'Bar chart in polar coordinates for circular visualization',
      image: polarBarImg,
      path: '/polar-bar'
    },
    {
      id: 'dot',
      name: 'Dot Bar Chart',
      description: 'Bar chart with dots overlaid to highlight specific values',
      image: dotBarImg,
      path: '/dot-bar'
    },
    {
      id: 'trend',
      name: 'Bar Chart with Trend Line',
      description: 'Bar chart with a trend line to show patterns over time',
      image: trendBarImg,
      path: '/trend-bar'
    },
    {
      id: 'butterfly',
      name: 'Butterfly Bar Chart',
      description: 'Mirrored bar chart for comparing two groups across categories',
      image: butterflyBarImg,
      path: '/butterfly-bar'
    },
    {
      id: 'grouped',
      name: 'Grouped Bar Chart',
      description: 'Bar chart with grouped bars for comparing multiple datasets',
      image: groupedBarImg,
      path: '/grouped-bar'
    },
    {
      id: 'gene-up-down',
      name: 'Gene Up/Down Bar Chart',
      description: 'Specialized bar chart for visualizing gene expression changes',
      image: geneUpDownImg,
      path: '/gene-up-down'
    }
  ];
  
  const filteredGraphTypes = graphTypes.filter(type => 
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleGraphTypeSelect = (path) => {
    navigate(path);
  };
  
  return (
    <div className="graph-type-selector">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search graph types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="graph-types-grid">
        {filteredGraphTypes.map((type) => (
          <div 
            key={type.id} 
            className="graph-type-card"
            onClick={() => handleGraphTypeSelect(type.path)}
          >
            <div className="graph-type-image">
              <img src={type.image} alt={type.name} />
            </div>
            <div className="graph-type-info">
              <h3>{type.name}</h3>
              <p>{type.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GraphTypeSelector;
