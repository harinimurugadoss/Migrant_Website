const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    let conn;
    
    // Always use in-memory MongoDB for now
    console.log('Using in-memory MongoDB for development/testing.');
    mongod = await MongoMemoryServer.create();
    const mongoURI = mongod.getUri();
    
    conn = await mongoose.connect(mongoURI);
    console.log(`In-memory MongoDB Connected: ${conn.connection.host}`);
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Cleanup function to stop the in-memory server when needed
const closeDatabase = async () => {
  if (mongod) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  }
};

module.exports = { connectDB, closeDatabase };
