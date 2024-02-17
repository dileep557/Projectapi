const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  product_title: String,
  product_description: String,
  price: Number,
  dateOfSale: Date
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
