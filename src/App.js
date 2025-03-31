import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import BarChartModule from './components/BarChartModule';
import GeneUpDownBarModule from './components/GeneUpDownBarModule';
import ErrorBarModule from './components/ErrorBarModule';
import DualYBarModule from './components/DualYBarModule';
import ButterflyBarModule from './components/ButterflyBarModule';
import VerticalBarWithTrendModule from './components/VerticalBarWithTrendModule';
import PolarBarModule from './components/PolarBarModule';
import HorizontalBarModule from './components/HorizontalBarModule';
import GroupedBarModule from './components/GroupedBarModule';
import StackedBarModule from './components/StackedBarModule';
import DotBarModule from './components/DotBarModule';
import BiologicalGraphSelector from './components/BiologicalGraphSelector';

// Import biological graph components
import GeneExpressionHeatmap from './components/biological/GeneExpressionHeatmap';
import PolarBarChart from './components/biological/PolarBarChart';
import ButterflyBarChart from './components/biological/ButterflyBarChart';
import GeneUpDownBarChart from './components/biological/GeneUpDownBarChart';
import ErrorBarChart from './components/biological/ErrorBarChart';
import VerticalBarWithTrend from './components/biological/VerticalBarWithTrend';
import CircosPlot from './components/biological/CircosPlot';
import ManhattanPlot from './components/biological/ManhattanPlot';

import './App.css';

function App() {
  const [sampleData, setSampleData] = useState({});

  useEffect(() => {
    // Load sample data for each graph type
    const loadSampleData = async () => {
      try {
        const dataTypes = [
          'gene_up_down_bar',
          'errorbar',
          'dual_y_bar',
          'butterfly_bar',
          'vertical_bar_with_trend',
          'vertical_bar_with_trend_demo2'
        ];

        const loadedData = {};

        for (const dataType of dataTypes) {
          const response = await fetch(`/sample_data/${dataType}.txt`);
          if (response.ok) {
            const text = await response.text();
            loadedData[dataType] = text.split('\n');
          }
        }

        // Add sample data for more complex graph types
        // These would typically come from a backend API
        loadedData['heatmap'] = [
          'Gene\tSample1\tSample2\tSample3\tSample4',
          'Gene1\t5.2\t3.4\t2.1\t4.5',
          'Gene2\t2.3\t1.2\t4.5\t3.2',
          'Gene3\t3.1\t4.2\t1.3\t2.4',
          'Gene4\t1.2\t2.3\t3.4\t4.5',
          'Gene5\t4.5\t3.6\t2.7\t1.8'
        ];

        loadedData['circos'] = [
          'Source\tTarget\tValue',
          'Gene1\tGene2\t5',
          'Gene1\tGene3\t3',
          'Gene2\tGene4\t2',
          'Gene3\tGene5\t4',
          'Gene4\tGene1\t1',
          'Gene5\tGene2\t3'
        ];

        loadedData['manhattan'] = [
          'Chromosome\tPosition\tP-value',
          '1\t1000\t0.001',
          '1\t2000\t0.01',
          '1\t3000\t0.05',
          '2\t1500\t0.0001',
          '2\t2500\t0.02',
          '3\t1000\t0.003',
          '3\t2000\t0.0005',
          '4\t1500\t0.01',
          '5\t2000\t0.000001'
        ];

        setSampleData(loadedData);
      } catch (error) {
        console.error('Error loading sample data:', error);
      }
    };

    loadSampleData();
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Original graph routes */}
          <Route path="/bar" element={<BarChartModule />} />
          <Route path="/gene-up-down" element={<GeneUpDownBarModule />} />
          <Route path="/error-bar" element={<ErrorBarModule />} />
          <Route path="/dual-y-bar" element={<DualYBarModule />} />
          <Route path="/butterfly-bar" element={<ButterflyBarModule />} />
          <Route path="/vertical-bar-trend" element={<VerticalBarWithTrendModule />} />
          <Route path="/polar-bar" element={<PolarBarModule />} />
          <Route path="/horizontal-bar" element={<HorizontalBarModule />} />
          <Route path="/grouped-bar" element={<GroupedBarModule />} />
          <Route path="/stacked-bar" element={<StackedBarModule />} />
          <Route path="/dot-bar" element={<DotBarModule />} />
          
          {/* Biological graph selector */}
          <Route path="/biological" element={<BiologicalGraphSelector />} />
          
          {/* Biological graph routes with sample data */}
          <Route path="/biological/heatmap" element={
            <GeneExpressionHeatmap data={sampleData.heatmap || []} />
          } />
          <Route path="/biological/polar-bar" element={
            <PolarBarChart data={sampleData.butterfly_bar || []} />
          } />
          <Route path="/biological/butterfly-bar" element={
            <ButterflyBarChart data={sampleData.butterfly_bar || []} />
          } />
          <Route path="/biological/gene-up-down" element={
            <GeneUpDownBarChart data={sampleData.gene_up_down_bar || []} />
          } />
          <Route path="/biological/error-bar" element={
            <ErrorBarChart data={sampleData.errorbar || []} />
          } />
          <Route path="/biological/vertical-bar-trend" element={
            <VerticalBarWithTrend data={sampleData.vertical_bar_with_trend || []} />
          } />
          <Route path="/biological/circos-plot" element={
            <CircosPlot data={sampleData.circos || []} />
          } />
          <Route path="/biological/manhattan-plot" element={
            <ManhattanPlot data={sampleData.manhattan || []} />
          } />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
