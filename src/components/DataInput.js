import React, { useState, useEffect } from 'react';
import './DataInput.css';
import { 
  geneUpDownBarSampleData,
  errorBarSampleData,
  dualYBarSampleData,
  horizontalBarSampleData,
  stackedBarSampleData,
  polarBarSampleData,
  dotBarSampleData,
  verticalBarWithTrendSampleData,
  butterflyBarSampleData,
  groupedBarSampleData
} from '../utils/sampleData';

function DataInput({ onDataSubmit, graphType }) {
  const [inputData, setInputData] = useState('');
  const [error, setError] = useState('');
  const [formatInstructions, setFormatInstructions] = useState('');

  useEffect(() => {
    // Set format instructions based on graph type
    switch(graphType) {
      case 'geneUpDown':
        setFormatInstructions('Input data contain two rows: the first row represents different miRNAs, the second row represents log2 fold change.');
        break;
      case 'errorBar':
        setFormatInstructions('Input data contain three rows: the first row represents categories, the second row represents values, the third row represents error values.');
        break;
      case 'dualYBar':
        setFormatInstructions('Input data contain three rows: the first row represents categories, the second row represents primary Y-axis values, the third row represents secondary Y-axis values.');
        break;
      case 'horizontalBar':
        setFormatInstructions('Input data contain two rows: the first row represents categories, the second row represents values. Categories will be displayed on the Y-axis.');
        break;
      case 'stackedBar':
        setFormatInstructions('Input data contain multiple rows: the first row represents categories, each subsequent row represents a dataset to be stacked (2-4 rows recommended).');
        break;
      case 'polarBar':
        setFormatInstructions('Input data contain two rows: the first row represents categories arranged in a circle, the second row represents values radiating from the center.');
        break;
      case 'dotBar':
        setFormatInstructions('Input data contain two rows: the first row represents categories, the second row represents values. Values will be displayed as dots instead of bars.');
        break;
      case 'verticalBarWithTrend':
        setFormatInstructions('Input data contain three rows: the first row represents categories, the second row represents bar values, the third row represents trend line values.');
        break;
      case 'butterflyBar':
        setFormatInstructions('Input data contain three rows: the first row represents categories, the second row represents left (positive) values, the third row represents right (negative) values.');
        break;
      case 'groupedBar':
        setFormatInstructions('Input data contain multiple rows: the first row represents categories, each subsequent row represents a dataset to be grouped (2-4 rows recommended).');
        break;
      default:
        setFormatInstructions('Input data contain two rows: the first row represents categories, the second row represents values.');
    }
  }, [graphType]);

  const getSampleDataForGraphType = () => {
    switch(graphType) {
      case 'geneUpDown':
        return formatSampleData(geneUpDownBarSampleData);
      case 'errorBar':
        return formatSampleData(errorBarSampleData, true);
      case 'dualYBar':
        return formatDualYSampleData(dualYBarSampleData);
      case 'horizontalBar':
        return formatSampleData(horizontalBarSampleData);
      case 'stackedBar':
        return formatStackedSampleData(stackedBarSampleData);
      case 'polarBar':
        return formatSampleData(polarBarSampleData);
      case 'dotBar':
        return formatSampleData(dotBarSampleData);
      case 'verticalBarWithTrend':
        return formatTrendSampleData(verticalBarWithTrendSampleData);
      case 'butterflyBar':
        return formatButterflySampleData(butterflyBarSampleData);
      case 'groupedBar':
        return formatGroupedSampleData(groupedBarSampleData);
      default:
        return formatSampleData(geneUpDownBarSampleData);
    }
  };

  const formatSampleData = (data, includeErrors = false) => {
    let result = data.categories.join('\t') + '\n';
    result += data.values.join('\t');
    if (includeErrors) {
      result += '\n' + data.errors.join('\t');
    }
    return result;
  };

  const formatDualYSampleData = (data) => {
    let result = data.categories.join('\t') + '\n';
    result += data.primaryValues.join('\t') + '\n';
    result += data.secondaryValues.join('\t');
    return result;
  };

  const formatStackedSampleData = (data) => {
    let result = data.categories.join('\t') + '\n';
    result += data.dataset1.join('\t') + '\n';
    result += data.dataset2.join('\t') + '\n';
    result += data.dataset3.join('\t');
    return result;
  };

  const formatTrendSampleData = (data) => {
    let result = data.categories.join('\t') + '\n';
    result += data.values.join('\t') + '\n';
    result += data.trendValues.join('\t');
    return result;
  };

  const formatButterflySampleData = (data) => {
    let result = data.categories.join('\t') + '\n';
    result += data.maleValues.join('\t') + '\n';
    result += data.femaleValues.join('\t');
    return result;
  };

  const formatGroupedSampleData = (data) => {
    let result = data.categories.join('\t') + '\n';
    result += data.dataset1.join('\t') + '\n';
    result += data.dataset2.join('\t') + '\n';
    result += data.dataset3.join('\t');
    return result;
  };

  const loadSampleData = () => {
    const sampleData = getSampleDataForGraphType();
    setInputData(sampleData);
  };

  const handleSubmit = () => {
    if (!inputData.trim()) {
      setError('Please enter data');
      return;
    }

    try {
      // Parse the input data
      const rows = inputData.trim().split('\n');
      const categories = rows[0].split('\t');
      const values = rows[1].split('\t').map(Number);

      // Additional data parsing based on graph type
      let additionalData = {};
      
      if (graphType === 'errorBar' && rows.length > 2) {
        additionalData.errors = rows[2].split('\t').map(Number);
      } else if (graphType === 'dualYBar' && rows.length > 2) {
        additionalData.secondaryValues = rows[2].split('\t').map(Number);
      } else if (['stackedBar', 'groupedBar'].includes(graphType) && rows.length > 3) {
        additionalData.dataset1 = values;
        additionalData.dataset2 = rows[2].split('\t').map(Number);
        additionalData.dataset3 = rows[3].split('\t').map(Number);
      } else if (graphType === 'verticalBarWithTrend' && rows.length > 2) {
        additionalData.trendValues = rows[2].split('\t').map(Number);
      } else if (graphType === 'butterflyBar' && rows.length > 2) {
        additionalData.maleValues = values;
        additionalData.femaleValues = rows[2].split('\t').map(Number);
      }

      // Submit the data
      onDataSubmit({
        categories,
        values,
        ...additionalData
      });
      
      setError('');
    } catch (err) {
      setError('Invalid data format. Please check your input.');
    }
  };

  return (
    <div className="data-input-container">
      <div className="data-input-header">
        <h3>Data Input</h3>
        <button className="sample-data-button" onClick={loadSampleData}>
          Load Sample Data
        </button>
      </div>
      
      <div className="data-input-instructions">
        <p><strong>Input Format Instructions:</strong></p>
        <p>{formatInstructions}</p>
        <p>Data must be tab-separated. Use point as decimal separator (e.g., 3.14, not 3,14).</p>
        <p>Click "Load Sample Data" to see the expected format for this graph type.</p>
      </div>
      
      <textarea
        className="data-input-textarea"
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
        placeholder="Enter your data here (tab-separated values) or click 'Load Sample Data'"
        rows={10}
      />
      
      {error && <div className="data-input-error">{error}</div>}
      
      <button className="data-input-submit" onClick={handleSubmit}>
        Generate Graph
      </button>
    </div>
  );
}

export default DataInput;
