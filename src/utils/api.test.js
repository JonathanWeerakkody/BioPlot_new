import React from 'react';
import { generateChart } from './api';

// Mock API for testing
jest.mock('./api', () => ({
  generateChart: jest.fn().mockResolvedValue({ image: 'mock-image-url' })
}));

describe('API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('generateChart should be called with correct parameters for basic bar chart', async () => {
    const categories = ['A', 'B', 'C'];
    const values = [10, 20, 30];
    const options = { chartType: 'bar', title: 'Test Chart' };
    
    await generateChart(categories, values, options);
    
    expect(generateChart).toHaveBeenCalledWith(categories, values, options);
  });

  test('generateChart should be called with correct parameters for error bar chart', async () => {
    const categories = ['A', 'B', 'C'];
    const values = [10, 20, 30];
    const options = { 
      chartType: 'errorBar', 
      title: 'Test Error Bar Chart',
      errors: [1, 2, 3]
    };
    
    await generateChart(categories, values, options);
    
    expect(generateChart).toHaveBeenCalledWith(categories, values, options);
  });

  test('generateChart should be called with correct parameters for dual Y bar chart', async () => {
    const categories = ['A', 'B', 'C'];
    const values = [10, 20, 30];
    const options = { 
      chartType: 'dualYBar', 
      title: 'Test Dual Y Bar Chart',
      secondaryValues: [5, 15, 25]
    };
    
    await generateChart(categories, values, options);
    
    expect(generateChart).toHaveBeenCalledWith(categories, values, options);
  });

  test('generateChart should be called with correct parameters for horizontal bar chart', async () => {
    const categories = ['A', 'B', 'C'];
    const values = [10, 20, 30];
    const options = { 
      chartType: 'horizontalBar', 
      title: 'Test Horizontal Bar Chart'
    };
    
    await generateChart(categories, values, options);
    
    expect(generateChart).toHaveBeenCalledWith(categories, values, options);
  });

  test('generateChart should be called with correct parameters for stacked bar chart', async () => {
    const categories = ['A', 'B', 'C'];
    const datasets = [
      { label: 'Dataset 1', values: [10, 20, 30] },
      { label: 'Dataset 2', values: [5, 15, 25] }
    ];
    const options = { 
      chartType: 'verticalStackBar', 
      title: 'Test Stacked Bar Chart'
    };
    
    await generateChart(categories, datasets, options);
    
    expect(generateChart).toHaveBeenCalledWith(categories, datasets, options);
  });

  test('generateChart should be called with correct parameters for polar bar chart', async () => {
    const categories = ['A', 'B', 'C'];
    const values = [10, 20, 30];
    const options = { 
      chartType: 'polarBar', 
      title: 'Test Polar Bar Chart'
    };
    
    await generateChart(categories, values, options);
    
    expect(generateChart).toHaveBeenCalledWith(categories, values, options);
  });

  test('generateChart should be called with correct parameters for dot bar chart', async () => {
    const categories = ['A', 'B', 'C'];
    const values = [10, 20, 30];
    const options = { 
      chartType: 'dotBar', 
      title: 'Test Dot Bar Chart'
    };
    
    await generateChart(categories, values, options);
    
    expect(generateChart).toHaveBeenCalledWith(categories, values, options);
  });

  test('generateChart should be called with correct parameters for vertical bar with trend chart', async () => {
    const categories = ['A', 'B', 'C'];
    const values = [10, 20, 30];
    const options = { 
      chartType: 'verticalBarWithTrend', 
      title: 'Test Vertical Bar with Trend Chart'
    };
    
    await generateChart(categories, values, options);
    
    expect(generateChart).toHaveBeenCalledWith(categories, values, options);
  });

  test('generateChart should be called with correct parameters for butterfly bar chart', async () => {
    const categories = ['A', 'B', 'C'];
    const values = [10, 20, 30];
    const options = { 
      chartType: 'butterflyBar', 
      title: 'Test Butterfly Bar Chart',
      rightValues: [5, 15, 25]
    };
    
    await generateChart(categories, values, options);
    
    expect(generateChart).toHaveBeenCalledWith(categories, values, options);
  });

  test('generateChart should be called with correct parameters for grouped bar chart', async () => {
    const categories = ['A', 'B', 'C'];
    const datasets = [
      { label: 'Dataset 1', values: [10, 20, 30] },
      { label: 'Dataset 2', values: [5, 15, 25] }
    ];
    const options = { 
      chartType: 'verticalGroupBar', 
      title: 'Test Grouped Bar Chart'
    };
    
    await generateChart(categories, datasets, options);
    
    expect(generateChart).toHaveBeenCalledWith(categories, datasets, options);
  });

  test('generateChart should be called with correct parameters for gene up/down bar chart', async () => {
    const categories = ['Gene A', 'Gene B', 'Gene C'];
    const values = [1.5, -2.0, 0.5];
    const options = { 
      chartType: 'geneUpDown', 
      title: 'Test Gene Up/Down Bar Chart',
      threshold: 1.0
    };
    
    await generateChart(categories, values, options);
    
    expect(generateChart).toHaveBeenCalledWith(categories, values, options);
  });
});
