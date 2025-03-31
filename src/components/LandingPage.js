import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

// Import sample images
import barChartImg from '../assets/bar_chart.png';
import errorBarImg from '../assets/error_bar.png';
import dualYBarImg from '../assets/dual_y_bar.png';

function LandingPage() {
  return (
    <div className="landing-page">
      <header className="hero">
        <div className="hero-content">
          <h1>BioPlot</h1>
          <p className="tagline">Advanced Biological Data Visualization</p>
          <p className="description">
            Create professional, publication-ready bar graphs for biological data with 
            extensive customization options and specialized chart types.
          </p>
          <div className="cta-buttons">
            <Link to="/select-graph" className="cta-button primary">
              Get Started
            </Link>
            <a href="#features" className="cta-button secondary">
              Learn More
            </a>
          </div>
        </div>
      </header>

      <section id="features" className="features">
        <h2>Powerful Visualization Tools</h2>
        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-chart-bar"></i>
            </div>
            <h3>Multiple Bar Graph Types</h3>
            <p>
              Choose from 10+ specialized bar graph types designed specifically for 
              biological data visualization.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-palette"></i>
            </div>
            <h3>Extensive Customization</h3>
            <p>
              Customize every aspect of your graphs including colors, fonts, 
              borders, and grid lines.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-mobile-alt"></i>
            </div>
            <h3>Responsive Design</h3>
            <p>
              Create and view your visualizations on any device with our 
              fully responsive interface.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-download"></i>
            </div>
            <h3>Export Options</h3>
            <p>
              Download your graphs as high-quality images ready for 
              publications or presentations.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-dna"></i>
            </div>
            <h3>Biological Focus</h3>
            <p>
              Specialized graph types for gene expression, protein analysis, 
              and other biological data.
            </p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">
              <i className="fas fa-code"></i>
            </div>
            <h3>No Coding Required</h3>
            <p>
              Create complex visualizations with our intuitive interface, 
              no programming experience needed.
            </p>
          </div>
        </div>
      </section>

      <section className="graph-showcase">
        <h2>Featured Graph Types</h2>
        <div className="showcase-grid">
          <div className="showcase-item">
            <img src={barChartImg} alt="Basic Bar Chart" />
            <h3>Basic Bar Chart</h3>
            <p>Simple vertical bar chart for comparing values across categories</p>
            <Link to="/bar-chart" className="showcase-link">Try it</Link>
          </div>
          
          <div className="showcase-item">
            <img src={errorBarImg} alt="Error Bar Chart" />
            <h3>Error Bar Chart</h3>
            <p>Bar chart with error bars to show data variability</p>
            <Link to="/error-bar" className="showcase-link">Try it</Link>
          </div>
          
          <div className="showcase-item">
            <img src={dualYBarImg} alt="Dual Y-Axis Bar Chart" />
            <h3>Dual Y-Axis Bar Chart</h3>
            <p>Bar chart with two Y-axes for comparing different scales</p>
            <Link to="/dual-y-bar" className="showcase-link">Try it</Link>
          </div>
        </div>
        
        <div className="view-all-container">
          <Link to="/select-graph" className="view-all-button">
            View All Graph Types
          </Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>BioPlot</h2>
            <p>Advanced Biological Data Visualization</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h3>Navigation</h3>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/select-graph">Graph Types</Link></li>
                <li><a href="#features">Features</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h3>Resources</h3>
              <ul>
                <li><a href="#">Documentation</a></li>
                <li><a href="#">Sample Data</a></li>
                <li><a href="#">Tutorials</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} BioPlot. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
