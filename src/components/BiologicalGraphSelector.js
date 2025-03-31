import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../BiologicalGraphSelector.css';

// Import images
import heatmapImg from '../../assets/heatmap.png';
import polarBarImg from '../../assets/polar_bar.png';
import butterflyBarImg from '../../assets/butterfly_bar.png';
import geneUpDownImg from '../../assets/gene_up_down.png';
import errorBarImg from '../../assets/error_bar.png';
import verticalBarTrendImg from '../../assets/trend_bar.png';
import circosPlotImg from '../../assets/circos_plot.png';
import manhattanPlotImg from '../../assets/manhattan_plot.png';

function BiologicalGraphSelector() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const graphTypes = [
    {
      id: 'gene-expression-heatmap',
      name: 'Gene Expression Heatmap',
      description: 'Visualize gene expression patterns across multiple samples with a customizable heatmap.',
      image: heatmapImg,
      path: '/biological/heatmap'
    },
    {
      id: 'polar-bar',
      name: 'Polar Bar Chart',
      description: 'Display categorical data in a circular layout for biological pathway analysis.',
      image: polarBarImg,
      path: '/biological/polar-bar'
    },
    {
      id: 'butterfly-bar',
      name: 'Butterfly Bar Chart',
      description: 'Compare two sets of values for the same categories in opposite directions.',
      image: butterflyBarImg,
      path: '/biological/butterfly-bar'
    },
    {
      id: 'gene-up-down',
      name: 'Gene Up/Down Regulation',
      description: 'Visualize up and down regulated genes with customizable thresholds.',
      image: geneUpDownImg,
      path: '/biological/gene-up-down'
    },
    {
      id: 'error-bar',
      name: 'Error Bar Chart',
      description: 'Display mean values with standard deviation or standard error for biological experiments.',
      image: errorBarImg,
      path: '/biological/error-bar'
    },
    {
      id: 'vertical-bar-trend',
      name: 'Vertical Bar with Trend',
      description: 'Show categorical data with a trend line to highlight patterns over time or conditions.',
      image: verticalBarTrendImg,
      path: '/biological/vertical-bar-trend'
    },
    {
      id: 'circos-plot',
      name: 'Circos Plot',
      description: 'Visualize relationships between genomic positions or other biological entities.',
      image: circosPlotImg,
      path: '/biological/circos-plot'
    },
    {
      id: 'manhattan-plot',
      name: 'Manhattan Plot',
      description: 'Display results from genome-wide association studies (GWAS) to identify significant variants.',
      image: manhattanPlotImg,
      path: '/biological/manhattan-plot'
    }
  ];
  
  const filteredGraphTypes = graphTypes.filter(graph => 
    graph.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    graph.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="biological-graph-selector">
      <h1>Biological Graph Types</h1>
      <p className="intro-text">
        Choose from specialized graph types designed specifically for biological data visualization.
        Each graph type includes customization options relevant to biological research.
      </p>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search graph types..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <div className="graph-grid">
        {filteredGraphTypes.map(graph => (
          <Link to={graph.path} key={graph.id} className="graph-card">
            <div className="graph-image">
              <img src={graph.image} alt={graph.name} />
            </div>
            <div className="graph-info">
              <h3>{graph.name}</h3>
              <p>{graph.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default BiologicalGraphSelector;
