import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import { removeNotificationMessage } from "../../Layout/common/headerSlice";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from "../../Layout/Header";
import SearchBar from "../../Layout/components/Input/SearchBar";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import { toast, ToastContainer } from 'react-toastify';

function TruckOrder() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { truckId } = useParams();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [truck, setTruck] = useState(null);
    const [orders, setOrders] = useState([]);
    const [assignedOrders, setAssignedOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        mainContentRef.current.scroll({
            top: 0,
            behavior: "smooth"
        });
        fetchTruckDetails();
        fetchOrders();
    }, []);

    useEffect(() => {
        applySearch(searchText);
    }, [searchText, orders]);

    useEffect(() => {
        if (newNotificationMessage !== "") {
            if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
            if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
            dispatch(removeNotificationMessage());
        }
    }, [newNotificationMessage]);

    const fetchTruckDetails = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API}/api/truck/${truckId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setTruck(response.data.truck);

            // Fetch the assigned orders from the truck's orders array
            const assignedOrdersPromises = response.data.truck.orders.map(async (orderId) => {
                const orderResponse = await axios.get(`${process.env.REACT_APP_API}/api/orders/single/${orderId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                return orderResponse.data.order;
            });

            const ordersDetails = await Promise.all(assignedOrdersPromises);
            setAssignedOrders(ordersDetails);

        } catch (error) {
            console.error('Error fetching truck details:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API}/api/truck/orders/preparing`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = orders.filter(order => 
            order.paymentInfo.toLowerCase().includes(lowercasedValue) ||
            order.status.toLowerCase().includes(lowercasedValue) ||
            order.city.toLowerCase().includes(lowercasedValue) ||
            order.barangay.toLowerCase().includes(lowercasedValue)
        );
        setFilteredOrders(filtered);
    };

    // Handle Remove All Orders
    const removeAllTruckOrders = async () => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_API}/api/truck/${truckId}/remove/allOrders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAssignedOrders([]); // Clear the assigned orders from state
            window.location.reload();
            toast.success("All orders removed successfully.");
            
        } catch (error) {
            console.error('Error removing all orders:', error);
            toast.error("Error removing all orders.");
        }
    };

    // Handle Remove Single Order
    const removeSingleTruckOrder = async (orderId) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_API}/api/truck/${truckId}/remove/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAssignedOrders(assignedOrders.filter(order => order._id !== orderId)); // Remove the order from state
            window.location.reload();
            toast.success("Order removed successfully.");
            
        } catch (error) {
            console.error('Error removing order:', error);
            toast.error("Error removing order.");
        }
    };

    // Handle Add Order
    const addTruckOrder = async (orderId) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.put(`${process.env.REACT_APP_API}/api/truck/${truckId}/addOrder/${orderId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setAssignedOrders([...assignedOrders, orders.find(order => order._id === orderId)]); // Add the order to state\
            window.location.reload();
            toast.success("Order added successfully.");
        } catch (error) {
            console.error('Error adding order:', error);
            toast.error("Error adding order.");
        }
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
                            title="Truck Details"
                            topMargin="mt-2"
                        >
                            {truck ? (
                                <div className="overflow-x-auto w-full">
                                    <table className="table w-full ">
                                        <thead>
                                            <tr>
                                                <th>Truck ID</th>
                                                <th>Model</th>
                                                <th>Plate Number</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>{truck._id}</td>
                                                <td>{truck.model}</td>
                                                <td>{truck.plateNo}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p>Loading truck details...</p>
                            )}
                        </TitleCard>
                        
                        <TitleCard
    title={<div className="flex justify-between items-center">
        <span>Assigned Orders</span>
        <button
            className="btn btn-danger"
            onClick={removeAllTruckOrders}
        >
            Remove All Orders
        </button>
    </div>}
    topMargin="mt-6"
>
    <div className="overflow-x-auto w-full">
        <table className="table w-full">
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Payment Info</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>City</th>
                    <th>Barangay</th>
                    <th>Created At</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                {assignedOrders.length > 0 ? (
                    assignedOrders.map((order) => (
                        <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{order.paymentInfo}</td>
                            <td>${order.totalPrice}</td>
                            <td>{order.status}</td>
                            <td>{order.deliveryAddress?.city || 'N/A'}</td>
                            <td>{order.deliveryAddress?.barangay || 'N/A'}</td>
                            <td>{new Date(order.createdAt).toLocaleString()}</td>
                            <td>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => removeSingleTruckOrder(order._id)}
                                >
                                    Remove
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="8" className="text-center">No assigned orders found</td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
</TitleCard>


                        <TitleCard
                            title="Prepared Orders"
                            topMargin="mt-6"
                            TopSideButtons={<SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} />}
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Payment Info</th>
                                            <th>Total Price</th>
                                            <th>Status</th>
                                            <th>City</th>
                                            <th>Barangay</th>
                                            <th>Created At</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredOrders.length > 0 ? (
                                            filteredOrders.map((order) => (
                                                <tr key={order._id}>
                                                    <td>{order._id}</td>
                                                    <td>{order.paymentInfo}</td>
                                                    <td>${order.totalPrice}</td>
                                                    <td>{order.status}</td>
                                                    <td>{order.deliveryAddress?.city || 'N/A'}</td>
                                                    <td>{order.deliveryAddress?.barangay || 'N/A'}</td>
                                                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-primary btn-sm"
                                                            onClick={() => addTruckOrder(order._id)}
                                                        >
                                                            Add Order
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center">No orders found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </TitleCard>
                    </main>
                </div>
                <LeftSidebar />
            </div>
            <RightSidebar />
            <NotificationContainer />
            <ModalLayout />
        </>
    );
}

export default TruckOrder;
