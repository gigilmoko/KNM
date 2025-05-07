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
  const [sortOrder, setSortOrder] = useState('asc');
  const [sortBy, setSortBy] = useState('forecastDate');
  const mainContentRef = useRef(null);

  useEffect(() => {
    mainContentRef.current.scroll({
        top: 0,
        behavior: "smooth"
    });
    fetchForecasts();
  }, []);

  useEffect(() => {
    applySearch(searchText);
  }, [searchText, forecasts]);

  const fetchForecasts = async () => {
    try {
        const token = sessionStorage.getItem("token"); // Fetch token from session storage
        const response = await axios.get(`${process.env.REACT_APP_API}/api/forecast/all`, {
            headers: {
                Authorization: `Bearer ${token}`, // Include token in the request headers
                'Content-Type': 'application/json',
            },
        });
        if (response.data && Array.isArray(response.data.forecasts)) { // Fix: Use response.data.forecasts
            setForecasts(response.data.forecasts);
            setFilteredForecasts(response.data.forecasts);
        } else {
            console.error('Data fetched is not an array:', response.data.forecasts);
            setForecasts([]);
            setFilteredForecasts([]);
        }
    } catch (error) {
        console.error('Failed to fetch forecasts', error);
        setForecasts([]);
        setFilteredForecasts([]);
    }
  };

  const applySearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    const filtered = forecasts.filter(forecast => 
        forecast.productId.name.toLowerCase().includes(lowercasedValue) ||
        forecast.forecastedDemand.toString().includes(lowercasedValue)
    );
    setFilteredForecasts(filtered);
  };

  const deleteCurrentForecast = async (id, index) => {
    try {
        const token = sessionStorage.getItem("token");
        const response = await axios.delete(`${process.env.REACT_APP_API}/api/forecast/delete/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        toast.success('Forecast deleted successfully!');
        setForecasts(forecasts.filter((_, i) => i !== index));
        setFilteredForecasts(filteredForecasts.filter((_, i) => i !== index));
    } catch (error) {
        console.error('Failed to delete forecast', error);
        toast.error('Failed to delete forecast');
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/forecast/edit/${id}`);
  };

  const handleSort = (column) => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder);
    setSortBy(column);

    const sortedForecasts = [...filteredForecasts].sort((a, b) => {
        if (a[column] < b[column]) return sortOrder === 'asc' ? -1 : 1;
        if (a[column] > b[column]) return sortOrder === 'asc' ? 1 : -1;
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
                                          <button onClick={() => handleSort('productId.name')}>
                                            Product {sortBy === 'productId.name' && (sortOrder === 'asc' ? '↑' : '↓')}
                                          </button>
                                        </th>
                                        <th>
                                          <button onClick={() => handleSort('forecastedDemand')}>
                                            Demand {sortBy === 'forecastedDemand' && (sortOrder === 'asc' ? '↑' : '↓')}
                                          </button>
                                        </th>
                                        <th>
                                          <button onClick={() => handleSort('forecastDate')}>
                                            Date {sortBy === 'forecastDate' && (sortOrder === 'asc' ? '↑' : '↓')}
                                          </button>
                                        </th>
                                        <th>Edit</th>
                                        <th>Delete</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredForecasts.length > 0 ? (
                                        filteredForecasts.map((forecast, index) => (
                                            <tr key={forecast._id}>
                                                <td>{forecast.productId.name}</td>
                                                <td>{forecast.forecastedDemand}</td>
                                                <td>{new Date(forecast.forecastDate).toLocaleDateString()}</td>
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
                                                    <button className="btn btn-square btn-ghost" onClick={() => deleteCurrentForecast(forecast._id, index)}>
                                                        <TrashIcon className="w-5 text-red-500" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="text-center">No forecasts found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </TitleCard>
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