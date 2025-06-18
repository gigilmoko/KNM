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

const COLORS = [
  "#ed003f", "#3b82f6", "#10b981", "#f59e42", "#6366f1", "#fbbf24", "#ef4444",
  "#22d3ee", "#a21caf", "#f472b6", "#84cc16", "#eab308", "#0ea5e9", "#d97706",
  "#be185d", "#0d9488", "#facc15", "#7c3aed", "#f43f5e", "#65a30d", "#f87171",
  "#2563eb", "#fde68a", "#fbbf24", "#f59e42", "#6366f1", "#fbbf24", "#ef4444",
  "#22d3ee", "#a21caf", "#f472b6", "#84cc16", "#eab308", "#0ea5e9", "#d97706",
  "#be185d", "#0d9488", "#facc15", "#7c3aed", "#f43f5e", "#65a30d", "#f87171",
  "#2563eb", "#fde68a"
];

const ProductPriceForecastLineGraph = () => {
  const [labels, setLabels] = useState([]);
  const [datasets, setDatasets] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    axios
      .get("https://forecast-fnn2.onrender.com/forecast/products")
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const forecastDates = res.data[0].forecasts.map(f => f.date);
          setLabels(forecastDates);

          const datasets = res.data.map((product, idx) => ({
            label: product.product_name,
            data: product.forecasts.map(f => f.price),
            borderColor: COLORS[idx % COLORS.length],
            backgroundColor: COLORS[idx % COLORS.length],
            fill: false,
            tension: 0.3,
            pointRadius: 2,
          }));

          setDatasets(datasets);
        } else {
          setError("Unexpected API response format.");
          setLabels([]);
          setDatasets([]);
        }
      })
      .catch(() => {
        setLabels([]);
        setDatasets([]);
        setError("Failed to fetch forecast data.");
      });
  }, []);

  const data = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { color: "#ed003f", boxWidth: 12, font: { size: 10 } }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ₱${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: { color: "#ed003f" },
        grid: { color: "rgba(237,0,63,0.08)" },
      },
      y: {
        ticks: { color: "#ed003f" },
        grid: { color: "rgba(237,0,63,0.08)" },
        title: { display: true, text: "Price", color: "#ed003f" },
      },
    },
  };

  return (
    <div className="bg-white border border-red-200 rounded-lg p-4 shadow w-full max-w-5xl mx-auto">
      <div className="mb-2 text-center">
        <span className="text-lg font-bold text-red-700">Product Price Forecast</span>
      </div>
      <div className="w-full h-[300px] sm:h-[400px] md:h-[500px]">
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <Line data={data} options={options} />
        )}
      </div>
      <div className="mt-4 text-xs text-gray-500 text-center">
        <span>
          {datasets.length > 20 && "Legend: Hover on the lines to see product names. Too many products may make the graph crowded."}
        </span>
      </div>
    </div>
  );
};

export default ProductPriceForecastLineGraph;