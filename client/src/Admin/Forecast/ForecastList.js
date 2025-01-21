import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import { toast, ToastContainer } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const ForecastList = () => {
    const [forecasts, setForecasts] = useState([]);
    const [chartData, setChartData] = useState({});
    const [forecastPeriod, setForecastPeriod] = useState('monthly');
    const [forecastMethod, setForecastMethod] = useState('movingAverage');

    useEffect(() => {
        fetchForecasts();
    }, [forecastPeriod, forecastMethod]);

    const fetchForecasts = async () => {
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API}/api/forecast`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                params: {
                    period: forecastPeriod,
                    method: forecastMethod,
                },
            });
            if (response.data && response.data.forecastedData) {
                console.log('Fetched forecasts:', response.data.forecastedData); // Log fetched data
                setForecasts(response.data.forecastedData);
                prepareChartData(response.data.forecastedData);
            } else {
                setForecasts([]);
                setChartData({});
            }
        } catch (error) {
            console.error('Error fetching forecasts:', error);
            toast.error('Failed to load forecasts.');
            setForecasts([]);
            setChartData({});
        }
    };

    const prepareChartData = (forecastedData) => {
        if (!forecastedData || forecastedData.length === 0) {
            setChartData({});
            return;
        }

        const labels = forecastedData.map(forecast => forecast.productName);
        const data = forecastedData.map(forecast => forecast.forecastedDemand);

        setChartData({
            labels,
            datasets: [
                {
                    label: 'Forecasted Demand',
                    data,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                },
            ],
        });
    };

    const calculatePercentageChange = (current, previous) => {
        if (previous === 0) return 'N/A';
        return ((current - previous) / previous * 100).toFixed(2);
    };

    const handleForecastPeriodChange = (period) => {
        setForecastPeriod(period);
    };

    const handleForecastMethodChange = (method) => {
        setForecastMethod(method);
    };

    return (
        <>
            <ToastContainer />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6 bg-base-200">
                        <TitleCard title="Demand Forecast">
                            <div className="mb-6">
                                <div className="flex justify-end space-x-4 mb-4">
                                    <button className={`btn ${forecastPeriod === 'monthly' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleForecastPeriodChange('monthly')}>Monthly</button>
                                    <button className={`btn ${forecastPeriod === 'quarterly' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleForecastPeriodChange('quarterly')}>Quarterly</button>
                                    <button className={`btn ${forecastPeriod === 'yearly' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleForecastPeriodChange('yearly')}>Yearly</button>
                                </div>
                                <div className="flex justify-end space-x-4 mb-4">
                                    <button className={`btn ${forecastMethod === 'movingAverage' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleForecastMethodChange('movingAverage')}>Moving Average</button>
                                    <button className={`btn ${forecastMethod === 'exponentialSmoothing' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleForecastMethodChange('exponentialSmoothing')}>Exponential Smoothing</button>
                                    <button className={`btn ${forecastMethod === 'regression' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => handleForecastMethodChange('regression')}>Regression</button>
                                </div>
                                {chartData.labels ? <Line data={chartData} /> : <p>No data available</p>}
                            </div>
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th>Forecasted Quantity</th>
                                            <th>Percentage Change</th>
                                            <th>Trend</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {forecasts.length > 0 ? (
                                            forecasts.map((forecast, index) => {
                                                const previousForecast = forecasts[index - 1];
                                                const percentageChange = previousForecast ? calculatePercentageChange(forecast.forecastedDemand, previousForecast.forecastedDemand) : 'N/A';
                                                const trend = previousForecast ? (forecast.forecastedDemand > previousForecast.forecastedDemand ? '⬆️' : '⬇️') : '-';
                                                const trendColor = previousForecast ? (forecast.forecastedDemand > previousForecast.forecastedDemand ? 'text-green-500' : 'text-red-500') : '';

                                                return (
                                                    <tr key={forecast.productName}>
                                                        <td>{forecast.productName}</td>
                                                        <td>{forecast.forecastedDemand}</td>
                                                        <td>{percentageChange}%</td>
                                                        <td className={trendColor}>{trend}</td>
                                                    </tr>
                                                );
                                            })
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="text-center">No forecasts found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
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
};

export default ForecastList;