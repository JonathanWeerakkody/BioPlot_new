import axios from 'axios';

// API base URL - will use environment variable in production
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Generate a chart using the backend API
 * @param {Array} categories - Array of category labels
 * @param {Array|Object} values - Array of values or array of dataset objects
 * @param {Object} options - Chart options
 * @returns {Promise} - Promise that resolves to the API response
 */
export const generateChart = async (categories, values, options) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-chart`, {
      categories,
      values,
      options
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating chart:', error);
    throw error;
  }
};
