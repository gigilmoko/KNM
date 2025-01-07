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
  const [activeTab, setActiveTab] = useState('monthly');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  const getProfile = async () => {
    const config = {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
    };
    try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
        setUser(data.user);
        setLoading(false);
    } catch (error) {
        setError('Failed to load profile.');
        setLoading(false);
    }
};

const fetchData = async (type) => {
  let endpoint;
  if (type === 'monthly') {
    endpoint = '/api/analytics/users/allmonths';
  } else if (type === 'weekly') {
    endpoint = '/api/analytics/users/weekly';
  } else if (type === 'daily') {
    endpoint = '/api/analytics/users/daily';
  }

  try {
    const token = sessionStorage.getItem("token");
    const response = await axios.get(`${process.env.REACT_APP_API}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("Fetched data:", response.data); // Log full response

    // Check if the response structure matches expectations
    if (response.data.success && Array.isArray(response.data.data)) {
      const labels = [];
      const data = [];

      response.data.data.forEach(item => {
        if (type === 'monthly') {
          const month = new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'long' });
          labels.push(month);
        } else if (type === 'weekly') {
          labels.push(`Week ${item.week}`);
        } else if (type === 'daily') {
          const date = new Date(item._id).toLocaleDateString();
          labels.push(date);
        }
        data.push(item.count);
      });

      setChartData({
        labels,
        datasets: [{
          fill: true,
          label: 'Users',
          data, // Updated data directly here
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }],
      });
    } else if (response.data.count !== undefined) {
      // Handle the case where only the count is returned
      setChartData({
        labels: ['Total'],
        datasets: [{
          fill: true,
          label: 'Users',
          data: [response.data.count], // Use the count data directly
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        }],
      });
    } else {
      console.error("Invalid data format: ", response.data);
    }
  } catch (error) {
    console.error("Error fetching data: ", error);
  }
};





  useEffect(() => {
    getProfile();
    fetchData(activeTab);
  }, [activeTab]); // Fetch data when activeTab changes

  return (
    <TitleCard title={"Number of Users"}>
      <div className="flex justify-center space-x-4 mb-4">
        <button
          className={`btn btn-primary ${activeTab === 'monthly' ? 'border-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly
        </button>
        <button
          className={`btn btn-primary ${activeTab === 'weekly' ? 'border-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly
        </button>
        <button
          className={`btn btn-primary ${activeTab === 'daily' ? 'border-2 border-blue-500' : ''}`}
          onClick={() => setActiveTab('daily')}
        >
          Daily
        </button>
      </div>
      <Line data={chartData} options={options} />
    </TitleCard>
  );
}

export default LineChart;
