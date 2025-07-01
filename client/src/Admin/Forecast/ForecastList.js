import { useEffect, useState, useRef } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import Header from "../../Layout/Header";
import SearchBar from "../../Layout/components/Input/SearchBar";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import PencilIcon from '@heroicons/react/24/outline/PencilIcon';
import PlusIcon from '@heroicons/react/24/outline/PlusIcon';
import ChartBarIcon from '@heroicons/react/24/outline/ChartBarIcon';
import TableCellsIcon from '@heroicons/react/24/outline/TableCellsIcon';
import EyeIcon from '@heroicons/react/24/outline/EyeIcon';
import dayjs from "dayjs";
import PpiForecastLineGraph from '../components/PPIForecastLineGraph';
import ProductPriceForecastLineGraph from '../components/ProductPriceForecastLineGraph';

function ForecastList() {
  const navigate = useNavigate();
  const [forecasts, setForecasts] = useState([]);
  const [filteredForecasts, setFilteredForecasts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('createdAt');
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // table, graphs
  const [graphType, setGraphType] = useState("ppi"); // ppi, product
  const mainContentRef = useRef(null);

  const monthOrder = [
    "january", "february", "march", "april", "may", "june",
    "july", "august", "september", "october", "november", "december"
  ];

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scroll({
        top: 0,
        behavior: "smooth"
      });
    }
    fetchForecasts();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    applySearch(searchText);
    // eslint-disable-next-line
  }, [searchText, forecasts]);

  useEffect(() => {
    if (viewMode === "table") {
      handleSort(sortBy, sortOrder);
    }
    // eslint-disable-next-line
  }, [forecasts, viewMode]);

  const applySearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    const filtered = forecasts.filter(forecast =>
      forecast.year?.toString().includes(lowercasedValue) ||
      forecast.month?.toLowerCase().includes(lowercasedValue) ||
      forecast.index?.toString().includes(lowercasedValue)
    );
    setFilteredForecasts(filtered);
  };

  const fetchForecasts = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API}/api/get`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.data && Array.isArray(response.data.forecasts)) {
        setForecasts(response.data.forecasts);
        setFilteredForecasts(response.data.forecasts);
      } else {
        setForecasts([]);
        setFilteredForecasts([]);
      }
    } catch (error) {
      setForecasts([]);
      setFilteredForecasts([]);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API}/api/delete/${deleteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success('Forecast deleted successfully!');
      setShowConfirm(false);
      setDeleteId(null);
      fetchForecasts();
    } catch (error) {
      toast.error('Failed to delete forecast');
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/forecast/edit/${id}`);
  };

  const handleCreateForecast = () => {
    navigate('/admin/forecast/create');
  };

  const handleSort = (column, order = null) => {
    const newSortOrder = order ? order : (sortOrder === 'asc' ? 'desc' : 'asc');
    setSortOrder(newSortOrder);
    setSortBy(column);

    const sortedForecasts = [...filteredForecasts].sort((a, b) => {
      let aValue = a[column];
      let bValue = b[column];

      // For createdAt, sort by date
      if (column === "createdAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        if (typeof aValue === "string") aValue = aValue.toLowerCase();
        if (typeof bValue === "string") bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return newSortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return newSortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    setFilteredForecasts(sortedForecasts);
  };

  // Helper to get the latest forecast (by year and month)
  const getLatestForecast = () => {
    if (!forecasts.length) return null;
    return [...forecasts].sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return monthOrder.indexOf(b.month?.toLowerCase()) - monthOrder.indexOf(a.month?.toLowerCase());
    })[0];
  };

  // Check if latest forecast is behind current month
  const isForecastBehind = () => {
    const latest = getLatestForecast();
    if (!latest) return false;
    const now = dayjs();
    const forecastDate = dayjs(`${latest.year}-${(monthOrder.indexOf(latest.month?.toLowerCase()) + 1).toString().padStart(2, "0")}-01`);
    return forecastDate.isBefore(now.startOf("month"));
  };

  // Forecast Card Component
  const ForecastCard = ({ forecast }) => (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#ed003f]">
            {forecast.month} {forecast.year}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              className="p-2 rounded-md text-gray-600 hover:text-[#ed003f] hover:bg-gray-100 transition-colors duration-200"
              onClick={() => handleEdit(forecast._id)}
              title="Edit forecast"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
            <button
              className="p-2 rounded-md text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors duration-200"
              onClick={() => confirmDelete(forecast._id)}
              title="Delete forecast"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">PPI Index:</span>
            <span className="text-lg font-semibold text-[#ed003f]">{forecast.index}</span>
          </div>
          
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={() => handleEdit(forecast._id)}
              className="w-full py-2 px-4 bg-[#ed003f] text-white rounded-md hover:bg-red-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2"
            >
              <EyeIcon className="w-4 h-4" />
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="drawer lg:drawer-open">
        <ToastContainer />
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
            {/* Note on how to update */}
            <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-400 rounded">
              <strong>How to update your PPI:</strong><br />
              Visit <a href="https://psa.gov.ph/statistics/manufacturing/producer-price-survey" target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">this link</a> and navigate to the bottom where attachments are placed. Download the attachment named <b>Table 1</b>. Upon opening the file, you will see the first table named <b>Manufacturing</b>. Copy the PPI value of the missing month and upload it in the <b>New Forecast Screen</b>.
            </div>
            
            {/* Warning if forecast is behind */}
            {isForecastBehind() && (
              <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900 rounded">
                <b>Warning:</b> Your latest forecast is behind the current month. Update your PPI by visiting <a href="https://psa.gov.ph/statistics/manufacturing/producer-price-survey" target="_blank" rel="noopener noreferrer" className="underline text-yellow-900">this site</a>.
              </div>
            )}

            <div className="max-w-7xl mx-auto">
              {/* Header Section */}
              <div className="mb-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Forecast Management</h1>
                    <p className="text-gray-600">Manage PPI forecasts and view forecast graphs</p>
                  </div>
                  
                  {/* Controls */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {viewMode === "table" && (
                      <SearchBar 
                        searchText={searchText} 
                        styleClass="w-full sm:w-auto" 
                        setSearchText={setSearchText}
                        placeholder="Search forecasts..."
                      />
                    )}
                    
                    <div className="flex items-center gap-2">
                      {/* View Toggle */}
                      <div className="bg-white rounded-md p-1 border border-gray-200">
                        <button
                          onClick={() => setViewMode("table")}
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === "table" 
                              ? "bg-[#ed003f] text-white" 
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <TableCellsIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setViewMode("graphs")}
                          className={`p-2 rounded-md transition-colors ${
                            viewMode === "graphs" 
                              ? "bg-[#ed003f] text-white" 
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          <ChartBarIcon className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button
                        className="btn bg-[#ed003f] text-white font-bold border-none hover:bg-red-700 transition flex items-center gap-2"
                        onClick={handleCreateForecast}
                      >
                        <PlusIcon className="w-4 h-4" />
                        New Forecast
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Display */}
              {viewMode === "table" ? (
                <TitleCard
                  title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>All Forecasts</span>}
                  topMargin="mt-2"
                >
                  <div className="overflow-x-auto w-full">
                    <table className="table w-full">
                      <thead>
                        <tr>
                          <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>
                            <button onClick={() => handleSort('year')}>
                              Year {sortBy === 'year' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>
                            <button onClick={() => handleSort('month')}>
                              Month {sortBy === 'month' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>
                            <button onClick={() => handleSort('index')}>
                              Index {sortBy === 'index' && (sortOrder === 'asc' ? '↑' : '↓')}
                            </button>
                          </th>
                          <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Edit</th>
                          <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Delete</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredForecasts.length > 0 ? (
                          filteredForecasts.map((forecast) => (
                            <tr key={forecast._id}>
                              <td>{forecast.year}</td>
                              <td>{forecast.month}</td>
                              <td>{forecast.index}</td>
                              <td>
                                <button
                                  className="btn btn-square btn-ghost"
                                  onClick={() => handleEdit(forecast._id)}
                                  title="Edit"
                                >
                                  <PencilIcon className="w-5 h-5 text-[#ed003f]" />
                                </button>
                              </td>
                              <td>
                                <button
                                  className="btn btn-square btn-ghost"
                                  onClick={() => confirmDelete(forecast._id)}
                                  title="Delete"
                                >
                                  <TrashIcon className="w-5 h-5 text-[#ed003f]" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="5" className="text-center text-gray-500 py-8">
                              No forecasts found
                              {searchText && (
                                <div className="mt-2">
                                  <button 
                                    className="btn btn-sm bg-[#ed003f] text-white border-none hover:bg-red-700"
                                    onClick={() => setSearchText("")}
                                  >
                                    Clear Search
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </TitleCard>
              ) : (
                /* Graphs View */
                <div className="space-y-6">
                  {/* Graph Type Toggle */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-6">
                      <button
                        className={`btn w-full sm:w-auto ${graphType === 'ppi'
                          ? 'bg-[#ed003f] text-white border-[#ed003f]'
                          : 'bg-white text-[#ed003f] border-[#ed003f] hover:bg-red-50'
                        }`}
                        onClick={() => setGraphType('ppi')}
                      >
                        Producer's Price Index Forecast
                      </button>
                      <button
                        className={`btn w-full sm:w-auto ${graphType === 'product'
                          ? 'bg-[#ed003f] text-white border-[#ed003f]'
                          : 'bg-white text-[#ed003f] border-[#ed003f] hover:bg-red-50'
                        }`}
                        onClick={() => setGraphType('product')}
                      >
                        Product Price Forecast
                      </button>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-red-200 p-4">
                      {graphType === 'ppi' && <PpiForecastLineGraph />}
                      {graphType === 'product' && <ProductPriceForecastLineGraph />}
                    </div>
                  </div>

                  {/* Forecast Cards Grid */}
                  <TitleCard
                    title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>Forecast Data Cards</span>}
                    topMargin="mt-2"
                  >
                    {filteredForecasts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredForecasts.map((forecast) => (
                          <ForecastCard key={forecast._id} forecast={forecast} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-16">
                        <ChartBarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No forecasts found</h3>
                        <p className="text-gray-600 mb-6">
                          Get started by creating your first forecast
                        </p>
                        <button
                          onClick={handleCreateForecast}
                          className="px-6 py-3 bg-[#ed003f] text-white rounded-md hover:bg-red-700 transition-colors duration-200 font-medium"
                        >
                          Create Forecast
                        </button>
                      </div>
                    )}
                  </TitleCard>
                </div>
              )}
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                  <h3 className="text-lg font-bold mb-4 text-[#ed003f]">Confirm Deletion</h3>
                  <p className="mb-6">Are you sure you want to delete this forecast?</p>
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn"
                      onClick={() => { setShowConfirm(false); setDeleteId(null); }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn"
                      style={{ backgroundColor: '#ed003f', color: '#fff', border: 'none' }}
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
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

export default ForecastList;