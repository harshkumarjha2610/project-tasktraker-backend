const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    console.error('❌  MONGODB_URI environment variable is missing.');
    throw new Error('MONGODB_URI environment variable is missing.');
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅  MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌  MongoDB connection error: ${err.message}`);
    throw err;
  }
};

// Handle unexpected disconnects
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting reconnect…');
});

mongoose.connection.on('error', (err) => {
  console.error('❌  Mongoose error:', err.message);
});

module.exports = connectDB;
