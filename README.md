# BioPlot - Cluster Heatmap Module

This repository contains the BioPlot web application with a new Cluster Heatmap Module for visualizing gene expression data with hierarchical clustering.

## Features

The Cluster Heatmap Module includes the following features:

### Data Input
- Accepts tab-delimited data with group names, sample names, and gene expression values
- Includes sample dataset for demonstration and testing
- Supports user-uploaded data in the same format

### Clustering Functionality
- Hierarchical clustering for both rows (genes) and columns (samples)
- Multiple distance metrics:
  - Euclidean
  - Manhattan
  - Pearson correlation
- Various linkage methods:
  - Complete
  - Average
  - Single
  - Ward

### Visualization
- Clear, visually appealing heatmap that plots genes against samples
- Dendrograms alongside the heatmap to visualize clustering results
- Color-coded group annotations for samples

### Customization Options
- Multiple color schemes for the heatmap
- Data normalization (z-score) and log transformation
- Adjustable plot elements:
  - Axis labels
  - Plot title and subtitle
  - Font sizes
  - Margins and dimensions

### Interactive Features
- Hover tooltips with detailed information
- Zooming capabilities for detailed view

### Export Options
- Export the heatmap in various formats (PNG, PDF, SVG)

## Usage

1. Select "Cluster Heatmap" from the graph type selector
2. Input data in the required format or use the "Load Sample Data" button
3. Adjust clustering and visualization options as needed
4. Click "Generate Plot" to create the heatmap
5. Use the export buttons to save the visualization in your preferred format

## Implementation Details

The module is implemented with:
- React frontend for the user interface
- Python backend (Flask) for data processing and visualization
- Libraries:
  - Frontend: React, Chart.js
  - Backend: NumPy, Pandas, Matplotlib, SciPy, Seaborn

## Deployment

The application is configured for deployment on Vercel with the following considerations:
- Python runtime specified as python@3.9 in vercel.json
- Dependencies listed in api/requirements.txt
- Frontend build process handled by Vercel's default React configuration
