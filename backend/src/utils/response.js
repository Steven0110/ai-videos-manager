'use strict';

/**
 * Create a successful response object
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code (default: 200)
 * @returns {Object} Response object
 */
function success(data, statusCode = 200) {
  console.log('......success.......');
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(data),
  };
}

/**
 * Create an error response object
 * @param {string} message - Error message
 * @param {Error} error - Error object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @returns {Object} Response object
 */
function error(message, error, statusCode = 500) {
  console.log('......error.......');
  console.error(`${message}:`, error);
  
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      message,
      error: error.message,
    }),
  };
}

module.exports = {
  success,
  error,
};