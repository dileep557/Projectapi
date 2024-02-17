const express = require('express');
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

mongoose.connect('mongodb://localhost:27017/your_database_name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// List Transactions API
app.get('/transactions', async (req, res) => {
  const { page = 1, per_page = 10, search_text = '' } = req.query;

  const query = search_text ? {
    $or: [
      { product_title: { $regex: search_text, $options: 'i' } },
      { product_description: { $regex: search_text, $options: 'i' } },
      { price: { $regex: search_text, $options: 'i' } }
    ]
  } : {};

  try {
    const transactions = await Transaction.find(query)
      .skip((page - 1) * per_page)
      .limit(parseInt(per_page));

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Statistics API
app.get('/statistics', async (req, res) => {
  const selectedMonth = req.query.month;

  const startOfMonth = new Date(selectedMonth);
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(startOfMonth.getMonth() + 1);

  try {
    const totalSaleAmount = await Transaction.aggregate([
      {
        $match: {
          dateOfSale: {
            $gte: startOfMonth,
            $lt: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          total_sale_amount: { $sum: '$price' }
        }
      }
    ]);

    const totalSoldItems = await Transaction.countDocuments({
      dateOfSale: { $gte: startOfMonth, $lt: endOfMonth }
    });

    const totalNotSoldItems = await Transaction.countDocuments({ dateOfSale: { $exists: false } });

    res.json({
      total_sale_amount: totalSaleAmount.length ? totalSaleAmount[0].total_sale_amount : 0,
      total_sold_items: totalSoldItems,
      total_not_sold_items: totalNotSoldItems
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
