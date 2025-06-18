import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend);

const PpiForecastLineGraph = () => {
  const [labels, setLabels] = useState([]);
  const [ppiData, setPpiData] = useState([]);

  useEffect(() => {
    axios
      .get("https://forecast-fnn2.onrender.com/forecast/ppi")
      .then((res) => {
        console.log("PPI API response:", res.data);
        if (res.data && res.data.labels && res.data.values) {
          setLabels(res.data.labels);
          setPpiData(res.data.values);
        } else if (Array.isArray(res.data)) {
          setLabels(res.data.map((d) => d.date));
          setPpiData(res.data.map((d) => d.value));
        }
      })
      .catch((err) => {
        console.error("PPI API error:", err);
        setLabels([]);
        setPpiData([]);
      });
  }, []);

  const data = {
    labels,
    datasets: [
      {
        label: "PPI Forecast",
        data: ppiData,
        fill: false,
        borderColor: "#ed003f",
        backgroundColor: "#ed003f",
        tension: 0.3,
        pointRadius: 3,
        pointBackgroundColor: "#ed003f",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: true, labels: { color: "#ed003f" } }
    },
    scales: {
      x: {
        ticks: { color: "#ed003f" },
        grid: { color: "rgba(237,0,63,0.08)" },
      },
      y: {
        ticks: { color: "#ed003f" },
        grid: { color: "rgba(237,0,63,0.08)" },
        title: { display: true, text: "PPI", color: "#ed003f" },
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div className="bg-white border border-red-200 rounded-lg p-4 shadow w-full max-w-2xl mx-auto">
      <div className="mb-2 text-center">
        <span className="text-lg font-bold text-red-700">Producer's Price Index Forecast</span>
      </div>
      <div className="w-full h-[300px] sm:h-[400px] md:h-[450px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default PpiForecastLineGraph;