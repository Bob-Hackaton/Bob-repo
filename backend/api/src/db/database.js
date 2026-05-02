const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn('⚠️  MONGODB_URI is not defined in .env file. Falling back to Mock DB Storage.');
  
  const store = new Map();
  
  const mockMongoose = {
    connect: async () => {
      console.log('✅ Connected to Mock DB (Memory)');
      return { connection: { name: 'mock-db' } };
    },
    connection: {
      on: () => {},
      close: async () => {},
      name: 'mock-db'
    },
    Schema: mongoose.Schema,
    model: (name, schema) => {
      // Return a "Constructor" function
      function Model(data) {
        Object.assign(this, data);
        this.save = async function() {
          store.set(this.jobId, this);
          return this;
        };
      }
      
      // Add static methods to the constructor
      Model.findOne = async (query) => store.get(query.jobId);
      Model.findOneAndUpdate = async (query, update) => {
        const item = store.get(query.jobId);
        if (!item) return null;
        
        Object.keys(update).forEach(key => {
          if (key.includes('.')) {
            const parts = key.split('.');
            let target = item;
            for (let i = 0; i < parts.length - 1; i++) {
              if (!target[parts[i]]) target[parts[i]] = {};
              target = target[parts[i]];
            }
            target[parts[parts.length - 1]] = update[key];
          } else {
            item[key] = update[key];
          }
        });
        return item;
      };
      Model.find = async () => Array.from(store.values());
      Model.deleteOne = async (query) => ({ deletedCount: store.delete(query.jobId) ? 1 : 0 });
      
      return Model;
    }
  };
  
  module.exports = mockMongoose;
} else {
  mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  });
  
  module.exports = mongoose;
}
