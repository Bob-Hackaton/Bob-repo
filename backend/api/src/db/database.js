const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;
const isProduction = process.env.NODE_ENV === 'production';

// Track connection state for graceful fallback
let connectionState = 'disconnected';

// Connect to MongoDB if URI is provided
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
  .then(() => {
    connectionState = 'connected';
    console.log('✅ Connected to MongoDB Atlas');
    console.log('📦 Database:', mongoose.connection.name);
  })
  .catch((error) => {
    connectionState = 'error';
    if (isProduction) {
      console.error('❌ MongoDB connection error:', error.message);
      process.exit(1);
    } else {
      console.error('⚠️  MongoDB connection failed, running in mock mode:', error.message);
    }
  });
} else {
  if (isProduction) {
    console.error('❌ MONGODB_URI is not defined in .env file');
    process.exit(1);
  } else {
    console.warn('⚠️  MONGODB_URI not defined — running in mock mode for local development');
    console.warn('   Set MONGODB_URI in .env for production or to persist data');
  }
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  connectionState = 'disconnected';
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  connectionState = 'error';
  console.error('❌ MongoDB error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  if (connectionState === 'connected') {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
  }
  process.exit(0);
});

// Export connection state accessor
module.exports = mongoose;
module.exports.isConnected = () => connectionState === 'connected';
module.exports.connectionMode = () => connectionState === 'connected' ? 'mongodb' : 'mock';

// Made with Bob
