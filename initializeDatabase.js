const axios = require('axios');
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function initializeDatabase() {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;
    await Transaction.insertMany(data);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

initializeDatabase();
