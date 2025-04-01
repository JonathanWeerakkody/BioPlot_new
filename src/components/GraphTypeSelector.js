import React from 'react';
import './GraphTypeSelector.css';

function GraphTypeSelector({ selectedGraphType, setSelectedGraphType }) {
  const graphTypes = [
    { id: 'bar', name: 'Bar Chart' },
    { id: 'gene-up-down', name: 'Gene Up/Down Bar' },
    { id: 'error-bar', name: 'Error Bar' },
    { id: 'dual-y', name: 'Dual Y Bar' },
    { id: 'butterfly', name: 'Butterfly Bar' },
    { id: 'vertical-trend', name: 'Vertical Bar with Trend' },
    { id: 'grouped-bar', name: 'Grouped Bar' },
    { id: 'stacked-bar', name: 'Stacked Bar' },
    { id: 'horizontal-bar', name: 'Horizontal Bar' },
    { id: 'polar-bar', name: 'Polar Bar' },
    { id: 'dot-bar', name: 'Dot Bar' },
    { id: 'cluster-heatmap', name: 'Cluster Heatmap' }
  ];

  return (
    <div className="graph-type-selector">
      <h2>Select Graph Type</h2>
      <div className="graph-type-grid">
        {graphTypes.map((type) => (
          <div
            key={type.id}
            className={`graph-type-item ${selectedGraphType === type.id ? 'selected' : ''}`}
            onClick={() => setSelectedGraphType(type.id)}
          >
            {type.name}
          </div>
        ))}
      </div>
    </div>
  );
}

export default GraphTypeSelector;
