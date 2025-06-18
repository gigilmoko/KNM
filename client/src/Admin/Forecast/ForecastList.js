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

function ForecastList() {
  const navigate = useNavigate();
  const [forecasts, setForecasts] = useState([]);
  const [filteredForecasts, setFilteredForecasts] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortBy, setSortBy] = useState('createdAt');
  const [deleteId, setDeleteId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const mainContentRef = useRef(null);

  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scroll({
        top: 0,
        behavior: "smooth"
      });
    }
    fetchForecasts();
  }, []);

  useEffect(() => {
    applySearch(searchText);
  }, [searchText, forecasts]);

  useEffect(() => {
    handleSort(sortBy, sortOrder);
    // eslint-disable-next-line
  }, [forecasts]);

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

  return (
    <>
      <div className="drawer lg:drawer-open">
        <ToastContainer />
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
            <TitleCard
              title="All Forecasts"
              topMargin="mt-2"
              TopSideButtons={
                <SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} />
              }
            >
              <div className="overflow-x-auto w-full">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>
                        <button onClick={() => handleSort('year')}>
                          Year {sortBy === 'year' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                      </th>
                      <th>
                        <button onClick={() => handleSort('month')}>
                          Month {sortBy === 'month' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                      </th>
                      <th>
                        <button onClick={() => handleSort('index')}>
                          Index {sortBy === 'index' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </button>
                      </th>
                      <th>Edit</th>
                      <th>Delete</th>
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
                              <PencilIcon className="w-5 text-yellow-500" />
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn btn-square btn-ghost"
                              onClick={() => confirmDelete(forecast._id)}
                            >
                              <TrashIcon className="w-5 text-red-500" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">No forecasts found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </TitleCard>
            {/* Confirmation Modal */}
            {showConfirm && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                  <h3 className="text-lg font-bold mb-4 text-red-700">Confirm Deletion</h3>
                  <p className="mb-6">Are you sure you want to delete this forecast?</p>
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn btn-sm bg-gray-200 text-gray-700"
                      onClick={() => { setShowConfirm(false); setDeleteId(null); }}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-sm bg-red-600 hover:bg-red-700 text-white"
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