import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';

// Generate years from 1950 to current year
const currentYear = new Date().getFullYear();
const years = [];
for (let y = currentYear; y >= 1950; y--) {
  years.push(y);
}
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const UpdateForecast = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [forecastData, setForecastData] = useState({
    year: currentYear,
    month: months[0],
    index: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/get/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (data && data.forecast) {
          setForecastData({
            year: data.forecast.year,
            month: data.forecast.month,
            index: data.forecast.index,
          });
        } else {
          toast.error('Forecast not found.');
        }
      } catch (error) {
        toast.error('Failed to fetch forecast details.');
      }
    };

    if (id) {
      fetchForecast();
    } else {
      toast.error('Invalid forecast ID.');
    }
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForecastData({ ...forecastData, [name]: value });
  };

  const updateForecast = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API}/api/update/${id}`,
        forecastData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      toast.success('Forecast updated successfully!');
      setTimeout(() => navigate('/admin/forecast/list'), 1000);
    } catch (error) {
      toast.error('Failed to update forecast.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="drawer lg:drawer-open">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-base-200">
            <TitleCard title="Update Forecast">
              <form
                className="grid grid-cols-1 gap-4 max-w-lg mx-auto"
                onSubmit={e => { e.preventDefault(); updateForecast(); }}
              >
                <div>
                  <label className="block mb-1 font-semibold text-red-700">Year</label>
                  <select
                    name="year"
                    className="input input-bordered w-full bg-red-50 border-red-400 text-red-900"
                    value={forecastData.year}
                    onChange={handleInputChange}
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
                    name="month"
                    className="input input-bordered w-full bg-red-50 border-red-400 text-red-900"
                    value={forecastData.month}
                    onChange={handleInputChange}
                    required
                  >
                    {months.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-red-700">Index</label>
                  <input
                    type="number"
                    step="any"
                    name="index"
                    className="input input-bordered w-full bg-red-50 border-red-400 text-red-900"
                    value={forecastData.index}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="submit"
                    className="btn bg-red-600 hover:bg-red-700 text-white border-none px-8"
                    disabled={loading}
                  >
                    {loading ? "Updating..." : "Update Forecast"}
                  </button>
                </div>
              </form>
            </TitleCard>
          </main>
        </div>
        <LeftSidebar />
        <RightSidebar />
        <ModalLayout />
      </div>
    </>
  );
};

export default UpdateForecast;