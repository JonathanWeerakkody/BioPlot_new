import React, { useState, useEffect } from 'react';
import './DataInput.css';

function DataInput({ onDataChange }) {
  const [inputType, setInputType] = useState('simple');
  const [csvData, setCsvData] = useState('');
  const [categories, setCategories] = useState('');
  const [values, setValues] = useState('');
  const [errors, setErrors] = useState('');
  const [secondaryValues, setSecondaryValues] = useState('');
  const [datasets, setDatasets] = useState([
    { label: 'Dataset 1', values: '' },
    { label: 'Dataset 2', values: '' }
  ]);
  const [errorMessage, setErrorMessage] = useState('');

  // Process data when input changes
  useEffect(() => {
    try {
      if (inputType === 'simple') {
        // Process simple input
        if (categories.trim() && values.trim()) {
          const categoriesArray = categories.split(',').map(item => item.trim());
          const valuesArray = values.split(',').map(item => parseFloat(item.trim()));
          
          // Validate data
          if (categoriesArray.length !== valuesArray.length) {
            setErrorMessage('Categories and values must have the same number of items');
            return;
          }
          
          if (valuesArray.some(isNaN)) {
            setErrorMessage('All values must be valid numbers');
            return;
          }
          
          // Process errors if provided
          let errorsArray = [];
          if (errors.trim()) {
            errorsArray = errors.split(',').map(item => parseFloat(item.trim()));
            if (errorsArray.length !== valuesArray.length) {
              setErrorMessage('Errors must have the same number of items as values');
              return;
            }
            if (errorsArray.some(isNaN)) {
              setErrorMessage('All errors must be valid numbers');
              return;
            }
          }
          
          // Process secondary values if provided
          let secondaryValuesArray = [];
          if (secondaryValues.trim()) {
            secondaryValuesArray = secondaryValues.split(',').map(item => parseFloat(item.trim()));
            if (secondaryValuesArray.length !== valuesArray.length) {
              setErrorMessage('Secondary values must have the same number of items as primary values');
              return;
            }
            if (secondaryValuesArray.some(isNaN)) {
              setErrorMessage('All secondary values must be valid numbers');
              return;
            }
          }
          
          // Clear error message
          setErrorMessage('');
          
          // Create data object
          const data = {
            categories: categoriesArray,
            values: valuesArray
          };
          
          // Add errors if provided
          if (errorsArray.length > 0) {
            data.errors = errorsArray;
          }
          
          // Add secondary values if provided
          if (secondaryValuesArray.length > 0) {
            data.secondaryValues = secondaryValuesArray;
          }
          
          // Send data to parent component
          onDataChange(data);
        }
      } else if (inputType === 'multiple') {
        // Process multiple datasets input
        if (categories.trim() && datasets.some(ds => ds.values.trim())) {
          const categoriesArray = categories.split(',').map(item => item.trim());
          
          // Process datasets
          const processedDatasets = [];
          for (const dataset of datasets) {
            if (dataset.values.trim()) {
              const valuesArray = dataset.values.split(',').map(item => parseFloat(item.trim()));
              
              // Validate data
              if (valuesArray.length !== categoriesArray.length) {
                setErrorMessage(`Dataset "${dataset.label}" must have the same number of values as categories`);
                return;
              }
              
              if (valuesArray.some(isNaN)) {
                setErrorMessage(`All values in dataset "${dataset.label}" must be valid numbers`);
                return;
              }
              
              processedDatasets.push({
                label: dataset.label,
                values: valuesArray
              });
            }
          }
          
          if (processedDatasets.length === 0) {
            setErrorMessage('At least one dataset must have values');
            return;
          }
          
          // Clear error message
          setErrorMessage('');
          
          // Create data object
          const data = {
            categories: categoriesArray,
            datasets: processedDatasets
          };
          
          // For butterfly charts, we need left and right values
          if (processedDatasets.length >= 2) {
            data.leftValues = processedDatasets[0].values;
            data.rightValues = processedDatasets[1].values;
          }
          
          // Send data to parent component
          onDataChange(data);
        }
      } else if (inputType === 'csv') {
        // Process CSV input
        if (csvData.trim()) {
          const rows = csvData.trim().split('\n');
          if (rows.length < 2) {
            setErrorMessage('CSV must have at least two rows (header and data)');
            return;
          }
          
          const headers = rows[0].split(',').map(item => item.trim());
          if (headers.length < 2) {
            setErrorMessage('CSV must have at least two columns (categories and values)');
            return;
          }
          
          const categoriesArray = [];
          const datasetsMap = {};
          
          // Initialize datasets
          for (let i = 1; i < headers.length; i++) {
            datasetsMap[headers[i]] = [];
          }
          
          // Process data rows
          for (let i = 1; i < rows.length; i++) {
            const cells = rows[i].split(',').map(item => item.trim());
            if (cells.length !== headers.length) {
              setErrorMessage(`Row ${i + 1} has a different number of columns than the header`);
              return;
            }
            
            categoriesArray.push(cells[0]);
            
            for (let j = 1; j < cells.length; j++) {
              const value = parseFloat(cells[j]);
              if (isNaN(value)) {
                setErrorMessage(`Value at row ${i + 1}, column ${j + 1} is not a valid number`);
                return;
              }
              datasetsMap[headers[j]].push(value);
            }
          }
          
          // Clear error message
          setErrorMessage('');
          
          // Create datasets array
          const processedDatasets = Object.entries(datasetsMap).map(([label, values]) => ({
            label,
            values
          }));
          
          // Create data object
          const data = {
            categories: categoriesArray,
            values: processedDatasets[0].values,
            datasets: processedDatasets
          };
          
          // For dual-y charts and butterfly charts
          if (processedDatasets.length >= 2) {
            data.secondaryValues = processedDatasets[1].values;
            data.leftValues = processedDatasets[0].values;
            data.rightValues = processedDatasets[1].values;
          }
          
          // Send data to parent component
          onDataChange(data);
        }
      }
    } catch (error) {
      setErrorMessage(`Error processing data: ${error.message}`);
    }
  }, [inputType, categories, values, errors, secondaryValues, datasets, csvData, onDataChange]);

  const handleAddDataset = () => {
    setDatasets([...datasets, { label: `Dataset ${datasets.length + 1}`, values: '' }]);
  };

  const handleRemoveDataset = (index) => {
    if (datasets.length > 1) {
      const newDatasets = [...datasets];
      newDatasets.splice(index, 1);
      setDatasets(newDatasets);
    }
  };

  const handleDatasetChange = (index, field, value) => {
    const newDatasets = [...datasets];
    newDatasets[index] = { ...newDatasets[index], [field]: value };
    setDatasets(newDatasets);
  };

  return (
    <div className="data-input">
      <h3>Data Input</h3>
      
      <div className="input-type-selector">
        <button 
          className={inputType === 'simple' ? 'active' : ''} 
          onClick={() => setInputType('simple')}
        >
          Simple Input
        </button>
        <button 
          className={inputType === 'multiple' ? 'active' : ''} 
          onClick={() => setInputType('multiple')}
        >
          Multiple Datasets
        </button>
        <button 
          className={inputType === 'csv' ? 'active' : ''} 
          onClick={() => setInputType('csv')}
        >
          CSV Input
        </button>
      </div>
      
      {inputType === 'simple' && (
        <div className="simple-input">
          <div className="form-group">
            <label htmlFor="categories">Categories (comma-separated)</label>
            <input
              type="text"
              id="categories"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="e.g., Category A, Category B, Category C"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="values">Values (comma-separated)</label>
            <input
              type="text"
              id="values"
              value={values}
              onChange={(e) => setValues(e.target.value)}
              placeholder="e.g., 10, 20, 30"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="errors">Errors (optional, comma-separated)</label>
            <input
              type="text"
              id="errors"
              value={errors}
              onChange={(e) => setErrors(e.target.value)}
              placeholder="e.g., 2, 3, 1"
            />
            <small>Required for Error Bar charts</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="secondaryValues">Secondary Values (optional, comma-separated)</label>
            <input
              type="text"
              id="secondaryValues"
              value={secondaryValues}
              onChange={(e) => setSecondaryValues(e.target.value)}
              placeholder="e.g., 5, 15, 25"
            />
            <small>Required for Dual Y-Axis charts</small>
          </div>
        </div>
      )}
      
      {inputType === 'multiple' && (
        <div className="multiple-input">
          <div className="form-group">
            <label htmlFor="categories-multiple">Categories (comma-separated)</label>
            <input
              type="text"
              id="categories-multiple"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              placeholder="e.g., Category A, Category B, Category C"
            />
          </div>
          
          <div className="datasets">
            {datasets.map((dataset, index) => (
              <div key={index} className="dataset-row">
                <div className="dataset-label">
                  <input
                    type="text"
                    value={dataset.label}
                    onChange={(e) => handleDatasetChange(index, 'label', e.target.value)}
                    placeholder={`Dataset ${index + 1}`}
                  />
                </div>
                <div className="dataset-values">
                  <input
                    type="text"
                    value={dataset.values}
                    onChange={(e) => handleDatasetChange(index, 'values', e.target.value)}
                    placeholder="e.g., 10, 20, 30"
                  />
                </div>
                <button 
                  className="remove-dataset"
                  onClick={() => handleRemoveDataset(index)}
                  disabled={datasets.length <= 1}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          
          <button className="add-dataset" onClick={handleAddDataset}>
            Add Dataset
          </button>
        </div>
      )}
      
      {inputType === 'csv' && (
        <div className="csv-input">
          <div className="form-group">
            <label htmlFor="csv-data">CSV Data</label>
            <textarea
              id="csv-data"
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              placeholder="Category,Value1,Value2\nA,10,5\nB,20,15\nC,30,25"
              rows={8}
            />
            <small>First column: categories, other columns: datasets</small>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      <div className="data-format-help">
        <details>
          <summary>Data Format Help</summary>
          <div className="help-content">
            <h4>Simple Input</h4>
            <p>Enter comma-separated categories and values. For Error Bar charts, add errors. For Dual Y-Axis charts, add secondary values.</p>
            
            <h4>Multiple Datasets</h4>
            <p>Enter comma-separated categories and values for each dataset. Required for Stacked Bar, Grouped Bar, and Butterfly Bar charts.</p>
            
            <h4>CSV Input</h4>
            <p>Enter data in CSV format. First row is header (first column is categories, other columns are datasets). Each subsequent row contains a category and its values.</p>
            
            <h4>Examples:</h4>
            <pre>
              Simple: Categories: A, B, C | Values: 10, 20, 30{'\n'}
              Multiple: Categories: A, B, C | Dataset 1: 10, 20, 30 | Dataset 2: 5, 15, 25{'\n'}
              CSV:{'\n'}
              Category,Value1,Value2{'\n'}
              A,10,5{'\n'}
              B,20,15{'\n'}
              C,30,25
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}

export default DataInput;
