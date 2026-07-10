const mongoose = require('mongoose');

// Timeout in milliseconds before giving up on a connection attempt
const CONNECTION_TIMEOUT_MS = 35000;

/**
 * Attempt to connect to a single MongoDB URI.
 * Resolves with the connection if successful, rejects with the error if it fails
 * or times out within CONNECTION_TIMEOUT_MS.
 *
 * @param {string} uri - The MongoDB connection string to try.
 * @returns {Promise<mongoose.Connection>}
 */
const tryConnect = (uri) => {
  return new Promise((resolve, reject) => {
    // Abort the attempt after CONNECTION_TIMEOUT_MS if mongoose hasn't resolved
    const timer = setTimeout(() => {
      reject(new Error('Connection timeout'));
    }, CONNECTION_TIMEOUT_MS);

    mongoose
      .connect(uri, {
        // serverSelectionTimeoutMS controls how long the driver waits to find
        // an available server. We align it with our manual timeout.
        serverSelectionTimeoutMS: CONNECTION_TIMEOUT_MS,
        connectTimeoutMS: CONNECTION_TIMEOUT_MS,
      })
      .then((conn) => {
        clearTimeout(timer);
        resolve(conn);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
};

/**
 * connectDB — exported reusable function.
 *
 * Priority:
 *   1. MongoDB Atlas  (MONGO_URI_ATLAS)
 *   2. Local MongoDB  (MONGO_URI_LOCAL)
 *   3. Terminate the process with a clear error message.
 *
 * No duplicate connections: mongoose keeps a single internal connection pool.
 * Calling connectDB() a second time while already connected is safe because
 * mongoose ignores duplicate connect() calls when already connected.
 */
const connectDB = async () => {
  const LOCAL_URI =
    process.env.MONGO_URI ||
    process.env.MONGO_URI_LOCAL ||
    "mongodb://127.0.0.1:27017/sdn302_db";

  const DIVIDER = '=========================================';

  console.log(DIVIDER);
  console.log('Trying Local MongoDB...');

  try {
    const conn = await tryConnect(LOCAL_URI);
    console.log(`✓ Connected to Local MongoDB (${conn.connection.host})`);
    console.log(DIVIDER);
    return; // Success — stop here
  } catch (localErr) {
    console.log(`✗ Local MongoDB unavailable — ${localErr.message}`);
    console.log('');
    console.log('Application terminated.');
    console.log(DIVIDER);
    process.exit(1);
  }
};

module.exports = connectDB;
