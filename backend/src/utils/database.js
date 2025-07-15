'use strict';

const { MongoClient } = require('mongodb');

const dbConnString = process.env.DB_CONN_STRING;
const dbName = 'ai-videos-manager';
let cachedClient = null;
let cachedDb = null;

/**
 * Connect to MongoDB database
 * @returns {Promise<import('mongodb').Db>} MongoDB database instance
 */
async function connectToDatabase() {
  // If we already have a connection, use it
  if (cachedDb) {
    return cachedDb;
  }

  // If no connection, create a new one
  const client = new MongoClient(dbConnString);
  await client.connect();
  const db = client.db(dbName);
  
  // Cache the client and connection
  cachedClient = client;
  cachedDb = db;
  
  return db;
}

/**
 * Get a collection from the database
 * @param {string} collectionName - Name of the collection
 * @returns {Promise<import('mongodb').Collection>} MongoDB collection
 */
async function getCollection(collectionName) {
  const db = await connectToDatabase();
  return db.collection(collectionName);
}

/**
 * Close the database connection
 * This is typically not needed in Lambda functions as the container gets recycled,
 * but it's good practice to have this method available for cleanup
 * @returns {Promise<void>}
 */
async function closeConnection() {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedDb = null;
  }
}

/**
 * Execute a database operation with proper connection handling
 * @param {Function} operation - Async function that performs database operations
 * @param {boolean} shouldClose - Whether to close the connection after operation (default: false)
 * @returns {Promise<any>} Result of the operation
 */
async function withDatabase(operation, shouldClose = false) {
  try {
    const db = await connectToDatabase();
    const result = await operation(db);
    
    if (shouldClose) {
      await closeConnection();
    }
    
    return result;
  } catch (err) {
    // If there's an error, we might want to close the connection to prevent issues
    if (shouldClose) {
      await closeConnection();
    }
    throw err;
  }
}

// Register a handler for Lambda container shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing MongoDB connection');
  await closeConnection();
});

module.exports = {
  connectToDatabase,
  getCollection,
  closeConnection,
  withDatabase,
}; 