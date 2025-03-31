import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

// Import images
import barChartImg from '../assets/bar_chart.png';
import butterflyBarImg from '../assets/butterfly_bar.png';
import dotBarImg from '../assets/dot_bar.png';
import dualYBarImg from '../assets/dual_y_bar.png';
import errorBarImg from '../assets/error_bar.png';
import geneUpDownImg from '../assets/gene_up_down.png';
import groupedBarImg from '../assets/grouped_bar.png';
import horizontalBarImg from '../assets/horizontal_bar.png';
import polarBarImg from '../assets/polar_bar.png';
import stackedBarImg from '../assets/stacked_bar.png';
import trendBarImg from '../assets/trend_bar.png';
import biologicalImg from '../assets/biological.png';

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="hero">
        <h1>BioPlot</h1>
        <p>A powerful web application for creating customized biological data visualizations</p>
      </header>
      
      <section className="features">
        <div className="feature">
          <h2>Easy to Use</h2>
          <p>Simple interface for creating publication-quality graphs with just a few clicks</p>
        </div>
        <div className="feature">
          <h2>Customizable</h2>
          <p>Extensive options to customize every aspect of your visualizations</p>
        </div>
        <div className="feature">
          <h2>Biological Focus</h2>
          <p>Specialized graph types designed specifically for biological data</p>
        </div>
      </section>
      
      <section className="graph-types">
        <h2>Available Graph Types</h2>
        
        <div className="graph-category">
          <h3>Basic Bar Charts</h3>
          <div className="graph-grid">
            <Link to="/bar" className="graph-card">
              <img src={barChartImg} alt="Basic Bar Chart" />
              <h4>Basic Bar Chart</h4>
            </Link>
            <Link to="/horizontal-bar" className="graph-card">
              <img src={horizontalBarImg} alt="Horizontal Bar Chart" />
              <h4>Horizontal Bar Chart</h4>
            </Link>
            <Link to="/grouped-bar" className="graph-card">
              <img src={groupedBarImg} alt="Grouped Bar Chart" />
              <h4>Grouped Bar Chart</h4>
            </Link>
            <Link to="/stacked-bar" className="graph-card">
              <img src={stackedBarImg} alt="Stacked Bar Chart" />
              <h4>Stacked Bar Chart</h4>
            </Link>
            <Link to="/dot-bar" className="graph-card">
              <img src={dotBarImg} alt="Dot Bar Chart" />
              <h4>Dot Bar Chart</h4>
            </Link>
          </div>
        </div>
        
        <div className="graph-category">
          <h3>Specialized Bar Charts</h3>
          <div className="graph-grid">
            <Link to="/gene-up-down" className="graph-card">
              <img src={geneUpDownImg} alt="Gene Up/Down Bar Chart" />
              <h4>Gene Up/Down Bar Chart</h4>
            </Link>
            <Link to="/error-bar" className="graph-card">
              <img src={errorBarImg} alt="Error Bar Chart" />
              <h4>Error Bar Chart</h4>
            </Link>
            <Link to="/dual-y-bar" className="graph-card">
              <img src={dualYBarImg} alt="Dual Y Bar Chart" />
              <h4>Dual Y Bar Chart</h4>
            </Link>
            <Link to="/butterfly-bar" className="graph-card">
              <img src={butterflyBarImg} alt="Butterfly Bar Chart" />
              <h4>Butterfly Bar Chart</h4>
            </Link>
            <Link to="/vertical-bar-trend" className="graph-card">
              <img src={trendBarImg} alt="Vertical Bar with Trend" />
              <h4>Vertical Bar with Trend</h4>
            </Link>
            <Link to="/polar-bar" className="graph-card">
              <img src={polarBarImg} alt="Polar Bar Chart" />
              <h4>Polar Bar Chart</h4>
            </Link>
          </div>
        </div>
        
        <div className="graph-category">
          <h3>Biological Visualizations</h3>
          <div className="graph-grid biological-section">
            <Link to="/biological" className="graph-card biological-card">
              <img src={biologicalImg} alt="Biological Visualizations" />
              <div className="biological-overlay">
                <h4>Explore Biological Graph Types</h4>
                <p>Specialized visualizations for biological data analysis</p>
                <span className="explore-button">Explore</span>
              </div>
            </Link>
          </div>
        </div>
      </section>
      
      <footer>
        <p>&copy; 2025 BioPlot. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
