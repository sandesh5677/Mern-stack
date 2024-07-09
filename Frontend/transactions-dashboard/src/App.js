import React, { useState } from 'react';
import TransactionsTable from './TransactionsTable';
import Statistics from './Statistics';
import BarChart from './BarChart';

const App = () => {
  const [selectedMonth, setSelectedMonth] = useState('March');

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
  };

  return (
    <div className="App">
      <h1>MERN Stack Transactions Dashboard</h1>
      <div>
        <label>Select Month:</label>
        <select value={selectedMonth} onChange={(e) => handleMonthChange(e.target.value)}>
          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
            <option key={month} value={month}>{month}</option>
          ))}
        </select>
      </div>
      <TransactionsTable />
      <Statistics selectedMonth={selectedMonth} />
      <BarChart selectedMonth={selectedMonth} />
    </div>
  );
};

export default App;
