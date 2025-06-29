import { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import TitleCard from "../../Layout/components/Cards/TitleCard";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function BarChart() {
  const chartRef = useRef(null);
  const [activeTab, setActiveTab] = useState("monthly");
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "",
        data: [],
        backgroundColor: "#df1f47",
      },
    ],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async (endpoint, labelFormatter, valueKey) => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(
        `${process.env.REACT_APP_API}/api/analytics/orders/${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const labels = [];
        const data = [];

        response.data.data.forEach((item) => {
          labels.push(labelFormatter(item));
          data.push(item[valueKey]);
        });

        setChartData({
          labels,
          datasets: [
            {
              label: `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Revenue`,
              data,
              backgroundColor: "#df1f47",
              borderRadius: 8,
              barPercentage: 0.7,
              categoryPercentage: 0.6,
              maxBarThickness: 40,
            },
          ],
        });
      }
    } catch (error) {
      setError(`Failed to fetch ${activeTab} data.`);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError("");
    if (activeTab === "monthly") {
      fetchData(
        "months",
        (item) =>
          new Date(item._id.year, item._id.month - 1).toLocaleString("default", {
            month: "long",
          }),
        "totalPrice" // <-- changed from "totalAmount" to "totalPrice"
      );
    } else if (activeTab === "weekly") {
      fetchData("weekly", (item) => item.day, "count");
    } else if (activeTab === "daily") {
      fetchData("daily", (item) => item.interval, "totalAmount");
    }
    setLoading(false);
    // eslint-disable-next-line
  }, [activeTab]);

  // Chart options for modern, responsive look
  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#df1f47",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#fff0f4",
        borderWidth: 1,
        padding: 12,
      },
    },
    scales: {
      x: {
        grid: {
          color: "#fde8ee",
        },
        ticks: {
          color: "#df1f47",
          font: { weight: "bold" },
        },
      },
      y: {
        grid: {
          color: "#fde8ee",
        },
        ticks: {
          color: "#df1f47",
          font: { weight: "bold" },
        },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <TitleCard title={"Revenue"}>
      <div className="flex justify-center w-full mb-4">
        <div className="flex space-x-2 sm:space-x-4 max-w-md w-full justify-center">
          <button
            className={`btn rounded-full px-4 py-2 text-sm sm:text-base font-semibold transition-all duration-200 ${
              activeTab === "monthly"
                ? "bg-[#df1f47] text-white border-2 border-[#df1f47] shadow"
                : "bg-white text-[#df1f47] border-2 border-[#df1f47] hover:bg-[#fff0f4]"
            }`}
            onClick={() => setActiveTab("monthly")}
          >
            Monthly
          </button>
          <button
            className={`btn rounded-full px-4 py-2 text-sm sm:text-base font-semibold transition-all duration-200 ${
              activeTab === "weekly"
                ? "bg-[#df1f47] text-white border-2 border-[#df1f47] shadow"
                : "bg-white text-[#df1f47] border-2 border-[#df1f47] hover:bg-[#fff0f4]"
            }`}
            onClick={() => setActiveTab("weekly")}
          >
            Weekly
          </button>
          <button
            className={`btn rounded-full px-4 py-2 text-sm sm:text-base font-semibold transition-all duration-200 ${
              activeTab === "daily"
                ? "bg-[#df1f47] text-white border-2 border-[#df1f47] shadow"
                : "bg-white text-[#df1f47] border-2 border-[#df1f47] hover:bg-[#fff0f4]"
            }`}
            onClick={() => setActiveTab("daily")}
          >
            Daily
          </button>
        </div>
      </div>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-[#df1f47]">{error}</div>
      ) : (
        <div id="barChart" className="w-full h-[300px] sm:h-[400px] md:h-[420px]">
          <Bar ref={chartRef} options={options} data={chartData} />
        </div>
      )}
    </TitleCard>
  );
}

export default BarChart;