const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// M-DB setup
mongoose.connect('mongodb://localhost:27017/my_database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

const transactionSchema = new mongoose.Schema({
  dateOfSale: Date,
  product: String,
  price: Number,
  description: String,
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// Initialize database from third-party API
// http://localhost:3000/initialize-database
app.get('/initialize-database', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const transactions = response.data;

    // Insert into MongoDB
    await Transaction.insertMany(transactions);
    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Failed to initialize database' });
  }
});

// List all transactions API            --2
// http://localhost:3000/transactions
app.get('/transactions', async (req, res) => {
    try {
      const { month, search, page = 1, per_page = 10 } = req.query;
      const regex = new RegExp(search, 'i');
  
      let query = { };
      if (month) {
        query.dateOfSale = { $regex: new RegExp(month, 'i') };
      }
      if (search) {
        query.$or = [
          { product: regex },
          { description: regex },
          { price: regex },
        ];
      }
  
      const transactions = await Transaction.find(query)
        .skip((page - 1) * per_page)
        .limit(per_page);
  
      res.status(200).json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Statistics API                         --3
//   http://localhost:3000/statistics
app.get('/statistics', async (req, res) => {
    try {
      const { month } = req.query;
  
      const totalSaleAmount = await Transaction.aggregate([
        {
          $match: { dateOfSale: { $regex: new RegExp(month, 'i') } }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$price' },
            count: { $sum: 1 }
          }
        }
      ]);
  
      const totalSoldItems = await Transaction.countDocuments({ dateOfSale: { $regex: new RegExp(month, 'i') } });
      const totalNotSoldItems = await Transaction.countDocuments({ dateOfSale: { $regex: new RegExp(month, 'i') }, price: { $exists: false } });
  
      res.status(200).json({
        totalSaleAmount: totalSaleAmount[0]?.totalAmount || 0,
        totalSoldItems,
        totalNotSoldItems,
      });
    } catch (error) {
      console.error('Error fetching statistics:', error);
      res.status(500).json({ error: 'Failed to fetch statistics' });
    }
  });
  // Bar Chart API          --4
//   http://localhost:3000/bar-chart
app.get('/bar-chart', async (req, res) => {
    try {
      const { month } = req.query;
  
      const priceRanges = [
        { range: '0-100', count: await Transaction.countDocuments({ dateOfSale: { $regex: new RegExp(month, 'i') }, price: { $gte: 0, $lte: 100 } }) },
        { range: '101-200', count: await Transaction.countDocuments({ dateOfSale: { $regex: new RegExp(month, 'i') }, price: { $gte: 101, $lte: 200 } }) },
        { range: '201-300', count: await Transaction.countDocuments({ dateOfSale: { $regex: new RegExp(month, 'i') }, price: { $gte: 201, $lte: 300 } }) },
        // Add more ranges as needed
      ];
  
      res.status(200).json(priceRanges);
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
      res.status(500).json({ error: 'Failed to fetch bar chart data' });
    }
  });
// Pie Chart API                --5
// http://localhost:3000/pie-chart
app.get('/pie-chart', async (req, res) => {
    try {
      const { month } = req.query;
  
      const categoryCounts = await Transaction.aggregate([
        {
          $match: { dateOfSale: { $regex: new RegExp(month, 'i') } }
        },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]);
  
      res.status(200).json(categoryCounts);
    } catch (error) {
      console.error('Error fetching pie chart data:', error);
      res.status(500).json({ error: 'Failed to fetch pie chart data' });
    }
  });
    // Combined Data to API         --5
    // http://localhost:3000/combined-data
app.get('/combined-data', async (req, res) => {
    try {
      const { month } = req.query;
  
      const transactions = await axios.get(`http://localhost:${PORT}/transactions?month=${month}`);
      const statistics = await axios.get(`http://localhost:${PORT}/statistics?month=${month}`);
      const barChart = await axios.get(`http://localhost:${PORT}/bar-chart?month=${month}`);
      const pieChart = await axios.get(`http://localhost:${PORT}/pie-chart?month=${month}`);
  
      const combinedData = {
        transactions: transactions.data,
        statistics: statistics.data,
        barChart: barChart.data,
        pieChart: pieChart.data,
      };
  
      res.status(200).json(combinedData);
    } catch (error) {
      console.error('Error fetching combined data:', error);
      res.status(500).json({ error: 'Failed to fetch combined data' });
    }
  });
  
// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
