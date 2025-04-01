import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import GraphTypeSelector from './components/GraphTypeSelector';
import DataInput from './components/DataInput';
import BarChartModule from './components/BarChartModule';
import GeneUpDownBarModule from './components/GeneUpDownBarModule';
import ErrorBarModule from './components/ErrorBarModule';
import DualYBarModule from './components/DualYBarModule';
import ButterflyBarModule from './components/ButterflyBarModule';
import VerticalBarWithTrendModule from './components/VerticalBarWithTrendModule';
import GroupedBarModule from './components/GroupedBarModule';
import StackedBarModule from './components/StackedBarModule';
import HorizontalBarModule from './components/HorizontalBarModule';
import PolarBarModule from './components/PolarBarModule';
import DotBarModule from './components/DotBarModule';
import ClusterHeatmapModule from './components/ClusterHeatmapModule';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [selectedGraphType, setSelectedGraphType] = useState('');
  const [data, setData] = useState('');

  const startApp = () => {
    setShowLanding(false);
  };

  const renderModule = () => {
    switch (selectedGraphType) {
      case 'bar':
        return <BarChartModule data={data} setData={setData} />;
      case 'gene-up-down':
        return <GeneUpDownBarModule data={data} setData={setData} />;
      case 'error-bar':
        return <ErrorBarModule data={data} setData={setData} />;
      case 'dual-y':
        return <DualYBarModule data={data} setData={setData} />;
      case 'butterfly':
        return <ButterflyBarModule data={data} setData={setData} />;
      case 'vertical-trend':
        return <VerticalBarWithTrendModule data={data} setData={setData} />;
      case 'grouped-bar':
        return <GroupedBarModule data={data} setData={setData} />;
      case 'stacked-bar':
        return <StackedBarModule data={data} setData={setData} />;
      case 'horizontal-bar':
        return <HorizontalBarModule data={data} setData={setData} />;
      case 'polar-bar':
        return <PolarBarModule data={data} setData={setData} />;
      case 'dot-bar':
        return <DotBarModule data={data} setData={setData} />;
      case 'cluster-heatmap':
        return <ClusterHeatmapModule data={data} setData={setData} />;
      default:
        return null;
    }
  };

  return (
    <div className="App">
      <Header />
      <main>
        {showLanding ? (
          <LandingPage startApp={startApp} />
        ) : (
          <>
            <GraphTypeSelector
              selectedGraphType={selectedGraphType}
              setSelectedGraphType={setSelectedGraphType}
            />
            {selectedGraphType ? (
              renderModule()
            ) : (
              <DataInput data={data} setData={setData} />
            )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default App;
