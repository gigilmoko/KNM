import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import Header from "../../Layout/Header";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from "../../Layout/RightSidebar";
import ModalLayout from "../../Layout/ModalLayout";

// Generate years from 1950 to current year
const currentYear = new Date().getFullYear();
const years = [];
for (let y = currentYear; y >= 1950; y--) {
  years.push(y);
}
const monthsList = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function NewForecast() {
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(monthsList[0]);
  const [index, setIndex] = useState("");
  const [loading, setLoading] = useState(false);
  const [existingForecasts, setExistingForecasts] = useState([]);
  const [availableMonths, setAvailableMonths] = useState(monthsList);
  const navigate = useNavigate();

  // Fetch all forecasts on mount or when year changes
  useEffect(() => {
    const fetchForecasts = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API}/api/get`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.data && Array.isArray(response.data.forecasts)) {
          setExistingForecasts(response.data.forecasts);
        } else {
          setExistingForecasts([]);
        }
      } catch (error) {
        setExistingForecasts([]);
      }
    };
    fetchForecasts();
  }, []);

  // Update available months when year or existingForecasts changes
  useEffect(() => {
    const takenMonths = existingForecasts
      .filter(f => Number(f.year) === Number(year))
      .map(f => f.month);
    const filteredMonths = monthsList.filter(m => !takenMonths.includes(m));
    setAvailableMonths(filteredMonths);
    // If current selected month is not available, set to first available
    if (!filteredMonths.includes(month)) {
      setMonth(filteredMonths[0] || "");
    }
  }, [year, existingForecasts]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `${process.env.REACT_APP_API}/api/create`,
        { year, month, index },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Forecast created successfully!");
      setTimeout(() => navigate("/admin/forecast/list"), 1000);
    } catch (error) {
      toast.error("Failed to create forecast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <ToastContainer />
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-2 sm:px-4 md:px-6 bg-base-200">
            <div className="max-w-xl mx-auto mt-8">
              <div className="bg-white rounded-lg shadow border border-red-400">
                <div className="px-6 py-4 border-b border-red-200 bg-red-600 rounded-t-lg">
                  <h2 className="text-xl font-bold text-white">Add New PPI Forecast</h2>
                </div>
                <form className="px-6 py-6 space-y-5" onSubmit={handleSubmit}>
                  <div>
                    <label className="block mb-1 font-semibold text-red-700">Year</label>
                    <select
                      className="input input-bordered w-full bg-red-50 border-red-400 text-red-900"
                      value={year}
                      onChange={(e) => setYear(Number(e.target.value))}
                      required
                    >
                      {years.map((y) => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-red-700">Month</label>
                    <select
                      className="input input-bordered w-full bg-red-50 border-red-400 text-red-900"
                      value={month}
                      onChange={(e) => setMonth(e.target.value)}
                      required
                      disabled={availableMonths.length === 0}
                    >
                      {availableMonths.length === 0 ? (
                        <option>No months available</option>
                      ) : (
                        availableMonths.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))
                      )}
                    </select>
                    {availableMonths.length === 0 && (
                      <p className="text-xs text-red-600 mt-1">All months for {year} already have entries.</p>
                    )}
                  </div>
                  <div>
                    <label className="block mb-1 font-semibold text-red-700">Index</label>
                    <input
                      type="number"
                      step="any"
                      className="input input-bordered w-full bg-red-50 border-red-400 text-red-900"
                      value={index}
                      onChange={(e) => setIndex(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="btn bg-red-600 hover:bg-red-700 text-white border-none px-8"
                      disabled={loading || availableMonths.length === 0}
                    >
                      {loading ? "Saving..." : "Create Forecast"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="h-16"></div>
          </main>
        </div>
        <LeftSidebar />
      </div>
      <RightSidebar />
      <ModalLayout />
    </>
  );
}

export default NewForecast;