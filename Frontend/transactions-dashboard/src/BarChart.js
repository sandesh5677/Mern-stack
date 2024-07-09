import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ selectedMonth }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    fetchBarChartData();
  }, [selectedMonth]);

  const fetchBarChartData = async () => {
    try {
      const response = await axios.get(`/bar-chart?month=${selectedMonth}`);
      const data = response.data;

      const labels = data.map(item => item.range);
      const counts = data.map(item => item.count);

      setChartData({
        labels: labels,
        datasets: [
          {
            label: 'Number of Items',
            backgroundColor: 'rgba(75,192,192,1)',
            borderColor: 'rgba(0,0,0,1)',
            borderWidth: 1,
            data: counts,
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
    }
  };

  return (
    <div>
      <h2>Transactions Bar Chart</h2>
      <Bar
        data={chartData}
        options={{
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true,
              },
            }],
          },
        }}
      />
    </div>
  );
};

export default BarChart;
