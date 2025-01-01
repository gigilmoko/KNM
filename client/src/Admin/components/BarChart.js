import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import TitleCard from "../../Layout/components/Cards/TitleCard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Store 1',
        data: [],
        backgroundColor: 'rgba(53, 162, 235, 1)',
      },
    ],
  });

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  useEffect(() => {
    // Fetch the data from the API
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/analytics/orders/months`);
        
        if (response.data.success) {
          const labels = [];
          const data = [];

          // Map the data to labels (months) and total amounts
          response.data.data.forEach(item => {
            const month = new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'long' });
            labels.push(month);
            data.push(item.totalAmount);
          });

          // Update chart data
          setChartData({
            labels,
            datasets: [
              {
                label: 'Store 1', // Only one store
                data,
                backgroundColor: 'rgba(53, 162, 235, 1)', // Color for the bar chart
              },
            ],
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to fetch data once when component mounts

  return (
    <TitleCard title={"Revenue"}>
      <Bar options={options} data={chartData} />
    </TitleCard>
  );
}

export default BarChart;
