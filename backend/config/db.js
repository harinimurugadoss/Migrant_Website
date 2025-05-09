const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
  try {
    // Create an in-memory MongoDB instance
    mongod = await MongoMemoryServer.create();
    const mongoURI = mongod.getUri();
    
    // Connect to the in-memory database
    const conn = await mongoose.connect(mongoURI + 'tn-migrant-portal');

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
