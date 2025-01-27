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

function NewDelivery() {
    const navigate = useNavigate();
    const [deliveryData, setDeliveryData] = useState({
        riderId: '',
        truckId: '',
        orderIds: [],
    });
    const [riders, setRiders] = useState([]);
    const [trucks, setTrucks] = useState([]);
    const [orders, setOrders] = useState([]);
    const [addedOrders, setAddedOrders] = useState([]);
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    // Fetch data for riders, trucks, and orders
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                const riderResponse = await axios.get(
                    `${process.env.REACT_APP_API}/api/delivery-session/riders/available`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const truckResponse = await axios.get(
                    `${process.env.REACT_APP_API}/api/delivery-session/truck/available`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                const orderResponse = await axios.get(
                    `${process.env.REACT_APP_API}/api/truck/orders/preparing`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setRiders(riderResponse.data.data);
                setTrucks(truckResponse.data.data);
                setOrders(orderResponse.data.orders);
            } catch (error) {
                console.error(error);
                toast.error('Failed to fetch data.');
            }
        };

        fetchData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setDeliveryData({ ...deliveryData, [name]: value });
    };

    const validateForm = () => {
        if (!deliveryData.riderId.trim()) {
            toast.error('Rider ID is required.');
            return false;
        }
        if (!deliveryData.truckId.trim()) {
            toast.error('Truck ID is required.');
            return false;
        }
        if (addedOrders.length === 0) {
            toast.error('At least one Order ID is required.');
            return false;
        }
        return true;
    };

    const createDeliverySession = async () => {
        if (!validateForm()) return;

        try {
            const token = sessionStorage.getItem('token');
            await axios.post(
                `${process.env.REACT_APP_API}/api/delivery-session/new`,
                { ...deliveryData, orderIds: addedOrders.map(order => order._id) },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            toast.success('Delivery session created successfully!');
            setTimeout(() => navigate('/admin/delivery/list'), 3000);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create delivery session.');
        }
    };

    const handleAddOrder = (orderId) => {
        const orderToAdd = orders.find(order => order._id === orderId);
        if (orderToAdd && !addedOrders.some(order => order._id === orderId)) {
            // Add to the addedOrders array
            setAddedOrders((prev) => [...prev, orderToAdd]);
            
            // Remove from available orders
            setOrders((prev) => prev.filter((order) => order._id !== orderId));
        }
    };

    const handleRemoveOrder = (orderId) => {
        const orderToRemove = addedOrders.find(order => order._id === orderId);
        if (orderToRemove) {
            // Remove from addedOrders array
            setAddedOrders((prev) => prev.filter((order) => order._id !== orderId));
    
            // Add back the removed order to available orders
            setOrders((prev) => [...prev, orderToRemove]);
        }
    };

    const handleSort = (column) => {
        const newSortOrder = sortBy === column && sortOrder === 'asc' ? 'desc' : 'asc';
        setSortBy(column);
        setSortOrder(newSortOrder);
    };

    const sortedOrders = [...orders].sort((a, b) => {
        if (sortBy === 'totalPrice') {
            return sortOrder === 'asc' ? a.totalPrice - b.totalPrice : b.totalPrice - a.totalPrice;
        } else {
            return sortOrder === 'asc' ? a._id.localeCompare(b._id) : b._id.localeCompare(a._id);
        }
    });

    return (
        <>
            <ToastContainer />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6 bg-base-200">
                        <TitleCard title="Create New Delivery Session">
                            <div className="grid grid-cols-1 gap-4">
                                {/* Rider Dropdown */}
                                <div>
                                    <label>Rider</label>
                                    <select
                                        name="riderId"
                                        value={deliveryData.riderId}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    >
                                        <option value="">Select Rider</option>
                                        {riders.map((rider) => (
                                            <option key={rider._id} value={rider._id}>
                                                {rider.fname} {rider.middlei}. {rider.lname}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Truck Dropdown */}
                                <div>
                                    <label>Truck</label>
                                    <select
                                        name="truckId"
                                        value={deliveryData.truckId}
                                        onChange={handleInputChange}
                                        className="input input-bordered w-full"
                                    >
                                        <option value="">Select Truck</option>
                                        {trucks.map((truck) => (
                                            <option key={truck._id} value={truck._id}>
                                                {truck.model} - {truck.plateNo}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Available Orders Table */}
                                <div>
                                    <label>Available Orders</label>
                                    <div className="border p-4 rounded-md mb-4 overflow-x-auto">
                                        <table className="table w-full">
                                            <thead>
                                                <tr>
                                                    <th>
                                                        <button onClick={() => handleSort('totalPrice')}>
                                                            Total Price {sortBy === 'totalPrice' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                        </button>
                                                    </th>
                                                    <th>
                                                        <button onClick={() => handleSort('_id')}>
                                                            Order ID {sortBy === '_id' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                        </button>
                                                    </th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {sortedOrders.map((order) => (
                                                    <tr key={order._id}>
                                                        <td>{order.totalPrice}</td>
                                                        <td>{order._id}</td>
                                                        <td>{order.status}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleAddOrder(order._id)}
                                                            >
                                                                Add
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Added Orders Table */}
                                <div>
                                    <label>Added Orders</label>
                                    <div className="border p-4 rounded-md mb-4 overflow-x-auto">
                                        <table className="table w-full">
                                            <thead>
                                                <tr>
                                                    <th>Order ID</th>
                                                    <th>Total Price</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {addedOrders.map((order) => (
                                                    <tr key={order._id}>
                                                        <td>{order._id}</td>
                                                        <td>{order.totalPrice}</td>
                                                        <td>{order.status}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleRemoveOrder(order._id)}
                                                            >
                                                                Remove
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Create Delivery Button */}
                                <div className="mt-4">
                                    <button className="btn btn-primary" onClick={createDeliverySession}>
                                        Create Delivery Session
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

export default NewDelivery;