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
      borderColor: '#df1f47',
      backgroundColor: 'rgba(223, 31, 71, 0.15)',
      pointBackgroundColor: '#df1f47',
      pointBorderColor: '#df1f47',
      tension: 0.4,
    }],
  });
  const [activeTab, setActiveTab] = useState('monthly');

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#df1f47',
          font: { weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: '#df1f47',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#fff0f4',
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: { color: '#fde8ee' },
        ticks: { color: '#df1f47', font: { weight: 'bold' } }
      },
      y: {
        grid: { color: '#fde8ee' },
        ticks: { color: '#df1f47', font: { weight: 'bold' } }
      }
    },
    maintainAspectRatio: false,
  };

  const getProfile = async () => {
    const config = {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      },
    };
    try {
      await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
    } catch (error) {
      // ignore
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
          daysOfWeek.forEach(day => { weeklyData[day] = 0; });
          response.data.data.forEach(item => {
            if (weeklyData[item.day] !== undefined) {
              weeklyData[item.day] = item.count;
            }
          });
          labels = daysOfWeek;
          data = daysOfWeek.map(day => weeklyData[day]);
        } else if (type === 'daily') {
          response.data.data.forEach(item => {
            labels.push(item.interval);
            data.push(item.count);
          });
        }
      }

      setChartData({
        labels,
        datasets: [{
          fill: true,
          label: 'Users',
          data,
          borderColor: '#df1f47',
          backgroundColor: 'rgba(223, 31, 71, 0.15)',
          pointBackgroundColor: '#df1f47',
          pointBorderColor: '#df1f47',
          tension: 0.4,
        }],
      });
    } catch (error) {
      // ignore
    }
  };

  useEffect(() => {
    getProfile();
    fetchData(activeTab);
    // eslint-disable-next-line
  }, [activeTab]);

  return (
    <TitleCard title={"Number of Users"}>
      <div className="flex justify-center flex-wrap gap-2 sm:gap-4 mb-4">
        <button
          className={`btn rounded-full px-4 py-2 text-sm sm:text-base font-semibold transition-all duration-200 ${
            activeTab === 'monthly'
              ? "bg-[#df1f47] text-white border-2 border-[#df1f47] shadow"
              : "bg-white text-[#df1f47] border-2 border-[#df1f47] hover:bg-[#fff0f4]"
          }`}
          onClick={() => setActiveTab('monthly')}
        >
          Monthly
        </button>
        <button
          className={`btn rounded-full px-4 py-2 text-sm sm:text-base font-semibold transition-all duration-200 ${
            activeTab === 'weekly'
              ? "bg-[#df1f47] text-white border-2 border-[#df1f47] shadow"
              : "bg-white text-[#df1f47] border-2 border-[#df1f47] hover:bg-[#fff0f4]"
          }`}
          onClick={() => setActiveTab('weekly')}
        >
          Weekly
        </button>
        <button
          className={`btn rounded-full px-4 py-2 text-sm sm:text-base font-semibold transition-all duration-200 ${
            activeTab === 'daily'
              ? "bg-[#df1f47] text-white border-2 border-[#df1f47] shadow"
              : "bg-white text-[#df1f47] border-2 border-[#df1f47] hover:bg-[#fff0f4]"
          }`}
          onClick={() => setActiveTab('daily')}
        >
          Daily
        </button>
      </div>
      <div id="lineChart" className="w-full h-[300px] sm:h-[400px] md:h-[420px]">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </TitleCard>
  );
}

export default LineChart;