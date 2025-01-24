import { useEffect, useState, useRef } from 'react';
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
  const chartRef = useRef(null);
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
        console.log(data.user); // Log user data if needed
    } catch (error) {
        console.error('Failed to load profile.');
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

    // Default labels and data
    let labels = [];
    let data = [];

    if (response.data.success) {
      if (type === 'monthly') {
        response.data.data.forEach(item => {
          const month = new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'long' });
          labels.push(month);
          data.push(item.count);
        });
      } else if (type === 'weekly') {
        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
        const weeklyData = {};

        daysOfWeek.forEach(day => {
          weeklyData[day] = 0;
        });

        response.data.data.forEach(item => {
          if (weeklyData[item.day] !== undefined) {
            weeklyData[item.day] = item.count;
          }
        });

        labels = daysOfWeek;
        data = daysOfWeek.map(day => weeklyData[day]);
      } else if (type === 'daily') {
        response.data.data.forEach(item => {
          labels.push(item.interval); // Use interval as label
          data.push(item.count);
        });
      }
    } else {
      console.error("Invalid data format: ", response.data);
    }

    setChartData({
      labels,
      datasets: [{
        fill: true,
        label: 'Users',
        data,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }],
    });
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
      <div id="lineChart">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </TitleCard>
  );
}

export default LineChart;