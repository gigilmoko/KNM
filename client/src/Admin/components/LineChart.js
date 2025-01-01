import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import TitleCard from "../../Layout/components/Cards/TitleCard";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
  Legend
);

function LineChart() {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      fill: true,
      label: 'Users',
      data: [],
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
    }],
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
        const response = await axios.get(`${process.env.REACT_APP_API}/api/analytics/users/allmonths`);
        
        if (response.data.success) {
          const labels = [];
          const data = [];

          // Map the data to labels and values
          response.data.data.forEach(item => {
            const month = new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'long' });
            labels.push(month);
            data.push(item.count);
          });

          // Update chart data
          setChartData({
            labels,
            datasets: [{
              ...chartData.datasets[0],
              data,
            }],
          });
        }
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array to run once when the component mounts

  return (
    <TitleCard title={"Number of Users by Month"}>
      <Line data={chartData} options={options} />
    </TitleCard>
  );
}

export default LineChart;
