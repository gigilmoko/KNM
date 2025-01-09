import { useEffect, useState } from "react";
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
  const [activeTab, setActiveTab] = useState("monthly"); // Default to monthly
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "",
        data: [],
        backgroundColor: "rgba(53, 162, 235, 1)",
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
              backgroundColor: "rgba(53, 162, 235, 1)",
            },
          ],
        });
      }
    } catch (error) {
      console.error(`Error fetching ${activeTab} data:`, error);
      setError(`Failed to fetch ${activeTab} data.`);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === "monthly") {
      fetchData(
        "months",
        (item) =>
          new Date(item._id.year, item._id.month - 1).toLocaleString("default", {
            month: "long",
          }),
        "totalAmount"
      );
    } else if (activeTab === "weekly") {
      fetchData("weekly", (item) => item.day, "count");
    } else if (activeTab === "daily") {
      fetchData("daily", (item) => item.interval, "totalAmount");
    }
    setLoading(false);
  }, [activeTab]);

  return (
    <TitleCard title={"Revenue"}>
      <div className="flex justify-center w-full mb-4">
        <div className="flex space-x-4 max-w-md w-full justify-center">
          <button
            className={`btn btn-primary ${
              activeTab === "monthly" ? "border-2 border-blue-500" : ""
            }`}
            onClick={() => setActiveTab("monthly")}
          >
            Monthly
          </button>
          <button
            className={`btn btn-primary ${
              activeTab === "weekly" ? "border-2 border-blue-500" : ""
            }`}
            onClick={() => setActiveTab("weekly")}
          >
            Weekly
          </button>
          <button
            className={`btn btn-primary ${
              activeTab === "daily" ? "border-2 border-blue-500" : ""
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
        <div className="text-center text-red-500">{error}</div>
      ) : (
        <Bar options={{ responsive: true }} data={chartData} />
      )}
    </TitleCard>
  );
}

export default BarChart;
