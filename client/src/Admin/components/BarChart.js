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
  const [activeTab, setActiveTab] = useState('monthly'); // Default to monthly
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: '',
        data: [],
        backgroundColor: 'rgba(53, 162, 235, 1)',
      },
    ],
  });
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem("theme"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const fetchData = async (endpoint, labelFormatter) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API}/api/analytics/orders/${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

      if (response.data.success) {
        const labels = [];
        const data = [];

        response.data.data.forEach(item => {
          labels.push(labelFormatter(item));
          data.push(item.totalAmount);
        });

        setChartData({
          labels,
          datasets: [
            {
              label: `Revenue (${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)})`,
              data,
              backgroundColor: 'rgba(53, 162, 235, 1)',
            },
          ],
        });
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
    }
  };

  useEffect(() => {
    getProfile();
    if (activeTab === 'monthly') {
      fetchData('months', item =>
        new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'long' })
      );
    } else if (activeTab === 'weekly') {
      fetchData('weekly', item => `Day ${item._id.day}`);
    } else if (activeTab === 'daily') {
      fetchData('daily', item => item._id.interval);
    }
  }, [activeTab]);

  return (
    <TitleCard title={"Revenue"}>
      <div className="flex justify-center w-full mb-4">
      <div className="flex space-x-4 max-w-md w-full justify-center">
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
      </div>
      <Bar options={{ responsive: true }} data={chartData} />
    </TitleCard>
  );
}

export default BarChart;
