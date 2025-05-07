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

const UpdateForecast = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get forecast ID from URL
    const [forecastData, setForecastData] = useState({
        productId: '',
        forecastedDemand: '',
        forecastDate: '',
    });

    useEffect(() => {
        const fetchForecast = async () => {
            try {
                const token = sessionStorage.getItem('token');
                console.log('Fetching forecast from:', `${process.env.REACT_APP_API}/api/forecast/${id}`);
                const { data } = await axios.get(`${process.env.REACT_APP_API}/api/forecast/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log('Fetched forecast:', data.forecast); // Debug log for forecast
                setForecastData({
                    productId: data.forecast.productId,
                    forecastedDemand: data.forecast.forecastedDemand,
                    forecastDate: data.forecast.forecastDate.split('T')[0], // Format date
                    productName: data.forecast.productName, // Assuming productName is part of the forecast data
                });
            } catch (error) {
                console.error('Error fetching forecast:', error);
                if (error.response && error.response.status === 404) {
                    toast.error('Forecast not found. Please check the ID.');
                } else {
                    toast.error('Failed to fetch forecast details.');
                }
            }
        };

        if (id) {
            fetchForecast();
        } else {
            console.error('Invalid forecast ID:', id);
            toast.error('Invalid forecast ID.');
        }
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForecastData({ ...forecastData, [name]: value });
    };

   
    const updateForecast = async () => {
       

        try {
            const token = sessionStorage.getItem('token');
            await axios.put(
                `${process.env.REACT_APP_API}/api/forecast/update/${id}`,
                forecastData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            toast.success('Forecast updated successfully!');
            setTimeout(() => navigate('/admin/forecast/list'), 3000);
        } catch (error) {
            console.error('Error updating forecast:', error);
            toast.error('Failed to update forecast.');
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
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label>Product</label>
                                    <input
                                        type="text"
                                        name="productId"
                                        placeholder={forecastData.productId.name|| 'Product not found'}
                                        readOnly
                                        className="input input-bordered w-full bg-gray-200 cursor-not-allowed"
                                    />
                                </div>
                                <div>
                                    <label>Forecasted Demand</label>
                                    <input
                                        type="number"
                                        name="forecastedDemand"
                                        value={forecastData.forecastedDemand}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div>
                                    <label>Forecast Date</label>
                                    <input
                                        type="date"
                                        name="forecastDate"
                                        value={forecastData.forecastDate}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div className="mt-4">
                                    <button className="btn btn-primary" onClick={updateForecast}>
                                        Update Forecast
                                    </button>
                                </div>
                            </div>
                        </TitleCard>
                    </main>
                </div>
                <LeftSidebar />
                <RightSidebar />
                <ModalLayout />
            </div>
        </>
    );
}

export default UpdateForecast;