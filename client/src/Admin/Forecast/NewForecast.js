import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from '../../Layout/Header';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';

function NewForecast() {
    const navigate = useNavigate();
    const [forecastData, setForecastData] = useState({
        productId: '',
        forecastedDemand: '',
        forecastDate: '',
    });
    const [products, setProducts] = useState([]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                console.log('Fetching products from:', `${process.env.REACT_APP_API}/api/product/all`);
                const { data } = await axios.get(`${process.env.REACT_APP_API}/api/product/all`);
                setProducts(data.products);
            } catch (error) {
                console.error('Error fetching products:', error);
                console.log('Fetch Products Error Details:', error.response || error.message);
                toast.error('Failed to fetch products.');
            }
        };
        fetchProducts();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForecastData({ ...forecastData, [name]: value });
    };

    const validateForm = () => {
        if (!forecastData.productId.trim()) {
            toast.error('Product ID is required.');
            return false;
        }
        if (!forecastData.forecastedDemand.trim()) {
            toast.error('Forecasted demand is required.');
            return false;
        }
        if (!forecastData.forecastDate.trim()) {
            toast.error('Forecast date is required.');
            return false;
        }
        return true;
    };

    const createForecast = async () => {
        if (!validateForm()) return;

        try {
            const token = sessionStorage.getItem('token');
            console.log('Creating forecast at:', `${process.env.REACT_APP_API}/api/forecast/create`);
            await axios.post(
                `${process.env.REACT_APP_API}/api/forecast/create`,
                forecastData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            toast.success('Forecast created successfully!');
            setTimeout(() => navigate('/admin/forecast/list'), 3000);
        } catch (error) {
            console.error('Error creating forecast:', error);
            console.log('Create Forecast Error Details:', error.response || error.message);
            toast.error('Failed to create forecast.');
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
                        <TitleCard title="Create New Forecast">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label>Product</label>
                                    <select
                                        name="productId"
                                        value={forecastData.productId}
                                        onChange={handleInputChange}
                                        className="select select-bordered w-full"
                                    >
                                        <option value="">Select a product</option>
                                        {products.map((product) => (
                                            <option key={product._id} value={product._id}>
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
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
                                    <button className="btn btn-primary" onClick={createForecast}>
                                        Create Forecast
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

export default NewForecast;