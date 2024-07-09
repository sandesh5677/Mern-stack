import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Statistics = ({ selectedMonth }) => {
  const [totalSaleAmount, setTotalSaleAmount] = useState(0);
  const [totalSoldItems, setTotalSoldItems] = useState(0);
  const [totalNotSoldItems, setTotalNotSoldItems] = useState(0);

  useEffect(() => {
    fetchStatistics();
  }, [selectedMonth]);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`/statistics?month=${selectedMonth}`);
      setTotalSaleAmount(response.data.totalSaleAmount);
      setTotalSoldItems(response.data.totalSoldItems);
      setTotalNotSoldItems(response.data.totalNotSoldItems);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  return (
    <div>
      <h2>Transactions Statistics</h2>
      <p>Total Sale Amount: {totalSaleAmount}</p>
      <p>Total Sold Items: {totalSoldItems}</p>
      <p>Total Not Sold Items: {totalNotSoldItems}</p>
    </div>
  );
};

export default Statistics;
