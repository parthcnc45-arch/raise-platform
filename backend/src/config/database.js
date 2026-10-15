const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connect to MongoDB using MONGODB_URI environment variable
 */
async function connectDatabase() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    const errorMsg = 'MONGODB_URI environment variable is not defined.';
    console.error(`[Database Error] ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    console.log('[Database] Connecting to MongoDB...');
    const conn = await mongoose.connect(uri);
    isConnected = conn.connection.readyState === 1;
    console.log(`[Database] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    isConnected = false;
    console.error('[Database Error] Failed to connect to MongoDB:', error.message || error);
    throw error;
  }
}

/**
 * Disconnect gracefully from MongoDB
 */
async function disconnectDatabase() {
  try {
    if (mongoose.connection.readyState !== 0) {
      console.log('[Database] Disconnecting from MongoDB...');
      await mongoose.disconnect();
      isConnected = false;
      console.log('[Database] Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('[Database Error] Error disconnecting from MongoDB:', error.message || error);
    throw error;
  }
}

/**
 * Connection event listeners
 */
mongoose.connection.on('connected', () => {
  isConnected = true;
  console.log('[Database Event] Mongoose connection established');
});

mongoose.connection.on('error', (err) => {
  isConnected = false;
  console.error('[Database Event] Mongoose connection error:', err.message || err);
});

mongoose.connection.on('disconnected', () => {
  isConnected = false;
  console.log('[Database Event] Mongoose connection disconnected');
});

/**
 * Get current database connection status
 */
function getDatabaseStatus() {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const state = mongoose.connection.readyState;
  return {
    state,
    status: stateMap[state] || 'unknown',
    isConnected: state === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
}

module.exports = {
  connectDatabase,
  disconnectDatabase,
  getDatabaseStatus,
  mongoose,
};
