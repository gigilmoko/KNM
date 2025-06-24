import { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from "../../Layout/RightSidebar";
import Header from "../../Layout/Header";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import ModalLayout from "../../Layout/ModalLayout";

function RiderHistory() {
    const mainContentRef = useRef(null);
    const { riderId } = useParams();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        mainContentRef.current?.scroll({
            top: 0,
            behavior: "smooth"
        });
    }, []);

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            setError('');
            try {
                const token = sessionStorage.getItem("token");
                const res = await axios.get(
                    `${process.env.REACT_APP_API}/api/delivery-session/history/${riderId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                console.log("Fetched rider history:", res.data); // <-- log the fetched data
                setSessions(res.data.sessions || []);
            } catch (err) {
                // Show backend error message if available
                if (err.response && err.response.data && err.response.data.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Failed to fetch rider history');
                }
                setSessions([]);
            }
            setLoading(false);
        };
        if (riderId) fetchHistory();
    }, [riderId]);

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer />
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-2 sm:px-6 bg-base-200" ref={mainContentRef}>
                        <h1 className="text-xl font-bold text-[#ed003f] mb-4">Rider Delivery History</h1>
                        <div className="bg-white p-4 rounded shadow">
                            {loading ? (
                                <p>Loading...</p>
                            ) : error ? (
                                <p className="text-red-500">{error}</p>
                            ) : sessions.length === 0 ? (
                                <p>No delivery history found for this rider.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="table w-full text-xs sm:text-sm">
                                        <thead>
                                            <tr>
                                                <th>Session ID</th>
                                                <th>Status</th>
                                                <th>Orders</th>
                                                <th>Products Ordered</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sessions.map(session => (
                                                <tr key={session._id}>
                                                    <td>{session._id}</td>
                                                    <td>{session.status}</td>
                                                    <td>
                                                        <div>
                                                            <span className="font-semibold">Start Time:</span> {session.startTime ? session.startTime : 'n/a'}
                                                            <br />
                                                            <span className="font-semibold">End Time:</span> {session.endTime ? session.endTime : 'n/a'}
                                                        </div>
                                                        <ul className="list-disc ml-4 mt-2">
                                                            {session.orders.map(order => (
                                                                <li key={order._id}>
                                                                    <span className="font-semibold">Order:</span> {order.KNMOrderId || order._id}
                                                                    <br />
                                                                    <span className="font-semibold">Status:</span> {order.status}
                                                                    <br />
                                                                    <span className="font-semibold">Delivered At:</span> {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : '-'}
                                                                    <br />
                                                                    <span className="font-semibold">Delivered To:</span> {order.customer?.name || '-'}
                                                                    <br />
                                                                    <span className="font-semibold">Customer Address:</span>{" "}
                                                                    {order.address
                                                                        ? [
                                                                            order.address.houseNo,
                                                                            order.address.streetName,
                                                                            order.address.barangay,
                                                                            order.address.city
                                                                        ].filter(Boolean).join(', ')
                                                                        : '-'}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                    <td>
                                                        <ul className="list-disc ml-4">
                                                            {session.orders.map(order => (
                                                                <li key={order._id}>
                                                                    <span className="font-semibold">
                                                                        Products for Order: {order.KNMOrderId || order._id}
                                                                    </span>
                                                                    <ul>
                                                                        {order.products && order.products.length > 0 ? (
                                                                            order.products.map(product => (
                                                                                <li key={product._id} className="mb-2">
                                                                                    {product.name} ({product.quantity}) &rarr; ₱{product.price}
                                                                                </li>
                                                                            ))
                                                                        ) : (
                                                                            <li>No products</li>
                                                                        )}
                                                                    </ul>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <div className="h-16"></div>
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

export default RiderHistory;