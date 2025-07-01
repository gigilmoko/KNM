import { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from "../../Layout/RightSidebar";
import Header from "../../Layout/Header";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import SearchBar from "../../Layout/components/Input/SearchBar";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import ModalLayout from "../../Layout/ModalLayout";
import moment from 'moment';

function RiderHistory() {
    const mainContentRef = useRef(null);
    const { riderId } = useParams();
    const [sessions, setSessions] = useState([]);
    const [filteredSessions, setFilteredSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [riderName, setRiderName] = useState('');
    const [searchText, setSearchText] = useState('');
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({
        totalSessions: 0,
        completedSessions: 0,
        totalOrders: 0,
        totalRevenue: 0
    });

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
                
                // Fetch rider details and history
                const [historyRes, riderRes] = await Promise.all([
                    axios.get(
                        `${process.env.REACT_APP_API}/api/delivery-session/history/${riderId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    ),
                    axios.get(
                        `${process.env.REACT_APP_API}/api/rider/${riderId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    )
                ]);

                const sessionsData = historyRes.data.sessions || [];
                setSessions(sessionsData);
                setRiderName(`${riderRes.data.rider.fname} ${riderRes.data.rider.lname}`);

                // Calculate statistics
                const totalSessions = sessionsData.length;
                const completedSessions = sessionsData.filter(s => s.status === 'Completed').length;
                const totalOrders = sessionsData.reduce((acc, session) => acc + session.orders.length, 0);
                const totalRevenue = sessionsData.reduce((acc, session) => {
                    return acc + session.orders.reduce((orderAcc, order) => {
                        return orderAcc + (order.payment?.totalAmount || 0);
                    }, 0);
                }, 0);

                setStats({
                    totalSessions,
                    completedSessions,
                    totalOrders,
                    totalRevenue
                });

            } catch (err) {
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

    useEffect(() => {
        applyFiltersAndSort();
        // eslint-disable-next-line
    }, [searchText, sessions, sortBy, sortOrder, statusFilter]);

    const applyFiltersAndSort = () => {
        let filtered = sessions;

        // Apply search filter
        if (searchText.trim()) {
            const lowercasedValue = searchText.toLowerCase();
            filtered = filtered.filter(session =>
                session._id.toLowerCase().includes(lowercasedValue) ||
                session.status.toLowerCase().includes(lowercasedValue) ||
                session.truck?.model?.toLowerCase().includes(lowercasedValue) ||
                session.truck?.plateNo?.toLowerCase().includes(lowercasedValue) ||
                session.orders.some(order =>
                    (order.KNMOrderId && order.KNMOrderId.toLowerCase().includes(lowercasedValue)) ||
                    (order.customer?.name && order.customer.name.toLowerCase().includes(lowercasedValue)) ||
                    (order.customer?.email && order.customer.email.toLowerCase().includes(lowercasedValue))
                )
            );
        }

        // Apply status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(session => session.status === statusFilter);
        }

        // Apply sorting
        const sortedSessions = [...filtered].sort((a, b) => {
            let aValue, bValue;

            switch (sortBy) {
                case 'createdAt':
                    aValue = new Date(a.createdAt);
                    bValue = new Date(b.createdAt);
                    break;
                case 'status':
                    aValue = a.status?.toLowerCase() || '';
                    bValue = b.status?.toLowerCase() || '';
                    break;
                case 'ordersCount':
                    aValue = a.orders?.length || 0;
                    bValue = b.orders?.length || 0;
                    break;
                case 'totalRevenue':
                    aValue = a.orders?.reduce((acc, order) => acc + (order.payment?.totalAmount || 0), 0) || 0;
                    bValue = b.orders?.reduce((acc, order) => acc + (order.payment?.totalAmount || 0), 0) || 0;
                    break;
                case 'truck':
                    aValue = a.truck?.model?.toLowerCase() || '';
                    bValue = b.truck?.model?.toLowerCase() || '';
                    break;
                default:
                    aValue = a[sortBy];
                    bValue = b[sortBy];
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        setFilteredSessions(sortedSessions);
    };

    const formatAddress = (address) => {
        if (!address) return 'N/A';
        const { houseNo, streetName, barangay, city } = address;
        const parts = [houseNo, streetName, barangay, city].filter(Boolean);
        return parts.length > 0 ? parts.join(', ') : 'N/A';
    };

    const formatCurrency = (amount) => {
        return `₱${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    };

    const getStatusBadge = (status) => {
        const statusColors = {
            'Completed': 'badge-success',
            'Ongoing': 'badge-warning',
            'Cancelled': 'badge-error'
        };
        return `badge ${statusColors[status] || 'badge-neutral'}`;
    };

    // Get unique statuses from sessions
    const getUniqueStatuses = () => {
        const statuses = [...new Set(sessions.map(session => session.status))];
        return statuses.filter(Boolean);
    };

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer />
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-2 sm:px-6 bg-base-200" ref={mainContentRef}>
                        
                        {/* Header with Rider Name */}
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-[#ed003f] mb-2">
                                Delivery History - {riderName}
                            </h1>
                            <div className="breadcrumbs text-sm">
                                <ul>
                                    <li><a href="/admin/rider/list" className="text-[#ed003f]">Riders</a></li>
                                    <li>Delivery History</li>
                                </ul>
                            </div>
                        </div>

                        {/* Statistics Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div className="stat bg-white rounded-lg shadow border-l-4 border-[#ed003f]">
                                <div className="stat-title text-gray-600">Total Sessions</div>
                                <div className="stat-value text-[#ed003f]">{stats.totalSessions}</div>
                            </div>
                            <div className="stat bg-white rounded-lg shadow border-l-4 border-green-500">
                                <div className="stat-title text-gray-600">Completed</div>
                                <div className="stat-value text-green-600">{stats.completedSessions}</div>
                            </div>
                            <div className="stat bg-white rounded-lg shadow border-l-4 border-blue-500">
                                <div className="stat-title text-gray-600">Total Orders</div>
                                <div className="stat-value text-blue-600">{stats.totalOrders}</div>
                            </div>
                            <div className="stat bg-white rounded-lg shadow border-l-4 border-yellow-500">
                                <div className="stat-title text-gray-600">Total Revenue</div>
                                <div className="stat-value text-yellow-600">{formatCurrency(stats.totalRevenue)}</div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <TitleCard 
                            title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>Delivery Sessions</span>}
                            topMargin="mt-2"
                            TopSideButtons={
                                <div className="flex flex-wrap gap-2 items-center">
                                    <SearchBar
                                        searchText={searchText}
                                        styleClass="mr-2"
                                        setSearchText={setSearchText}
                                        inputProps={{
                                            style: { borderColor: '#ed003f', borderWidth: '2px' }
                                        }}
                                    />
                                </div>
                            }
                        >
                            {/* Filter and Sort Controls */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                                {/* Sort By Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="select select-bordered w-full text-sm"
                                        style={{ borderColor: '#ed003f' }}
                                    >
                                        <option value="createdAt">Date Created</option>
                                        <option value="status">Status</option>
                                        <option value="ordersCount">Orders Count</option>
                                        <option value="totalRevenue">Total Revenue</option>
                                        <option value="truck">Truck Model</option>
                                    </select>
                                </div>

                                {/* Sort Order Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="select select-bordered w-full text-sm"
                                        style={{ borderColor: '#ed003f' }}
                                    >
                                        <option value="desc">Descending (High to Low)</option>
                                        <option value="asc">Ascending (Low to High)</option>
                                    </select>
                                </div>

                                {/* Status Filter Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="select select-bordered w-full text-sm"
                                        style={{ borderColor: '#ed003f' }}
                                    >
                                        <option value="all">All Statuses</option>
                                        {getUniqueStatuses().map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Results Summary */}
                            <div className="flex justify-between items-center mb-4 text-sm text-gray-600">
                                <span>
                                    Showing {filteredSessions.length} of {sessions.length} sessions
                                </span>
                                <span>
                                    Sorted by {sortBy === 'createdAt' ? 'Date' : 
                                              sortBy === 'ordersCount' ? 'Orders Count' : 
                                              sortBy === 'totalRevenue' ? 'Revenue' : 
                                              sortBy.charAt(0).toUpperCase() + sortBy.slice(1)} 
                                    ({sortOrder === 'desc' ? 'Descending' : 'Ascending'})
                                </span>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="loading loading-spinner loading-lg text-[#ed003f]"></div>
                                    <span className="ml-2">Loading delivery history...</span>
                                </div>
                            ) : error ? (
                                <div className="alert alert-error">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>
                            ) : filteredSessions.length === 0 ? (
                                <div className="text-center py-8">
                                    <div className="text-gray-500 text-lg mb-2">No delivery history found</div>
                                    <p className="text-gray-400">
                                        {sessions.length === 0 
                                            ? "This rider hasn't completed any delivery sessions yet." 
                                            : "No sessions match your search criteria or filters."
                                        }
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {filteredSessions.map((session, index) => (
                                        <div key={session._id} className="card bg-base-100 shadow-md border">
                                            <div className="card-body">
                                                {/* Session Header */}
                                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                                    <div>
                                                        <h3 className="card-title text-[#ed003f]">
                                                            Session #{index + 1}
                                                        </h3>
                                                        <p className="text-sm text-gray-500">ID: {session._id}</p>
                                                    </div>
                                                    <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                                                        <div className={`badge ${getStatusBadge(session.status)} mb-1`}>
                                                            {session.status}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {moment(session.createdAt).format('MMM DD, YYYY')}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Session Info */}
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                                    {/* <div className="space-y-2">
                                                        <div className="flex items-center text-sm">
                                                            <span className="font-semibold text-gray-600 w-20">Start:</span>
                                                            <span>{session.startTime ? moment(session.startTime).format('MMM DD, YYYY hh:mm A') : 'Not started'}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <span className="font-semibold text-gray-600 w-20">End:</span>
                                                            <span>{session.endTime ? moment(session.endTime).format('MMM DD, YYYY hh:mm A') : 'Not completed'}</span>
                                                        </div>
                                                    </div> */}
                                                    <div className="space-y-2">
                                                        <div className="flex items-center text-sm">
                                                            <span className="font-semibold text-gray-600 w-20">Truck:</span>
                                                            <span>{session.truck?.model} ({session.truck?.plateNo})</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <span className="font-semibold text-gray-600 w-20">Orders:</span>
                                                            <span>{session.orders.length} order(s)</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Orders Details */}
                                                <div className="divider">Orders</div>
                                                <div className="overflow-x-auto">
                                                    <table className="table table-zebra w-full text-sm">
                                                        <thead>
                                                            <tr>
                                                                <th className="text-[#ed003f]">Order ID</th>
                                                                <th className="text-[#ed003f]">Customer</th>
                                                                <th className="text-[#ed003f]">Address</th>
                                                                <th className="text-[#ed003f]">Products</th>
                                                                <th className="text-[#ed003f]">Amount</th>
                                                                <th className="text-[#ed003f]">Status</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {session.orders.map(order => (
                                                                <tr key={order._id}>
                                                                    <td className="font-mono text-xs">
                                                                        {order.KNMOrderId || `KNM-${order._id.slice(-5).toUpperCase()}`}
                                                                    </td>
                                                                    <td>
                                                                        <div>
                                                                            <div className="font-semibold">{order.customer?.name || 'N/A'}</div>
                                                                            <div className="text-xs text-gray-500">{order.customer?.email || ''}</div>
                                                                        </div>
                                                                    </td>
                                                                    <td className="max-w-xs">
                                                                        <div className="text-xs" title={formatAddress(order.address)}>
                                                                            {formatAddress(order.address)}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="max-w-xs">
                                                                            {order.products && order.products.length > 0 ? (
                                                                                <div className="space-y-1">
                                                                                    {order.products.slice(0, 2).map(product => (
                                                                                        <div key={product._id} className="text-xs">
                                                                                            {product.name} (x{product.quantity})
                                                                                        </div>
                                                                                    ))}
                                                                                    {order.products.length > 2 && (
                                                                                        <div className="text-xs text-gray-500">
                                                                                            +{order.products.length - 2} more items
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ) : (
                                                                                <span className="text-gray-500 text-xs">No products</span>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td className="font-semibold">
                                                                        {formatCurrency(order.payment?.totalAmount)}
                                                                    </td>
                                                                    <td>
                                                                        <div className={`badge badge-sm ${getStatusBadge(order.status)}`}>
                                                                            {order.status}
                                                                        </div>
                                                                        {order.deliveredAt && (
                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                                {moment(order.deliveredAt).format('MMM DD, hh:mm A')}
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Session Summary */}
                                                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="font-semibold">Session Total:</span>
                                                        <span className="font-bold text-[#ed003f]">
                                                            {formatCurrency(
                                                                session.orders.reduce((acc, order) => 
                                                                    acc + (order.payment?.totalAmount || 0), 0
                                                                )
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TitleCard>
                        
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