import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TransactionsTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('March');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, currentPage]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`/transactions?month=${selectedMonth}&search=${searchText}&page=${currentPage}`);
      setTransactions(response.data.transactions);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  return (
    <div>
      <h2>Transactions Table</h2>
      <div>
        <label>Select Month:</label>
        <select value={selectedMonth} onChange={handleMonthChange}>
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>
      <div>
        <input type="text" placeholder="Search transaction" value={searchText} onChange={handleSearchChange} />
        <button onClick={() => setSearchText('')}>Clear</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction._id}>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
        <button onClick={handleNextPage} disabled={currentPage >= totalPages}>Next</button>
      </div>
    </div>
  );
};

export default TransactionsTable;
