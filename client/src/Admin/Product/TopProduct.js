import { useRef, useEffect, useState } from "react";
import axios from "axios";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from "../../Layout/Header";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import { ToastContainer } from 'react-toastify';
import { CalendarIcon, DocumentArrowDownIcon, ChartBarIcon, FunnelIcon } from '@heroicons/react/24/outline';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function TopProduct() {
    const mainContentRef = useRef(null);
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        mainContentRef.current?.scroll({
            top: 0,
            behavior: "smooth"
        });
        // Set default date range to last 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        
        setDateRange({
            from: thirtyDaysAgo.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0]
        });
    }, []);

    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            fetchTopProducts();
        } else {
            setTopProducts([]);
        }
        // eslint-disable-next-line
    }, [dateRange]);

    const fetchTopProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API}/api/predictions/get-top-products`,
                {
                    startDate: dateRange.from,
                    endDate: dateRange.to
                }
            );
            console.log("Fetched top products:", res.data);
            setTopProducts(res.data.topProducts || []);
        } catch (err) {
            console.error("Error fetching top products:", err);
            setTopProducts([]);
        }
        setLoading(false);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        const now = new Date();
        const formattedNow = now.toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });

        // Header
        doc.setFontSize(20);
        doc.setTextColor(237, 0, 63);
        doc.text("Top Products Report", 14, 20);

        // Date range
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Date Range: ${new Date(dateRange.from).toLocaleDateString()} to ${new Date(dateRange.to).toLocaleDateString()}`, 14, 30);

        const tableColumn = [
            "Rank",
            "Product Name",
            "Category",
            "Price",
            "Stock",
            "Orders",
            "Total Revenue"
        ];

        const tableRows = topProducts.map(({ product, quantity }, index) => [
            `#${index + 1}`,
            product.name,
            product.category?.name || "Unknown",
            `₱${Number(product.price).toFixed(2)}`,
            product.stock,
            quantity,
            `₱${(Number(product.price) * quantity).toFixed(2)}`
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 40,
            headStyles: {
                fillColor: [237, 0, 63],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            alternateRowStyles: {
                fillColor: [249, 249, 249]
            },
            didDrawPage: function (data) {
                doc.setFontSize(10);
                doc.setTextColor(150);
                doc.text(`Generated on: ${formattedNow}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
            }
        });

        doc.save(`top-products-report_${dateRange.from}_to_${dateRange.to}.pdf`);
    };

    const setQuickDateRange = (days) => {
        const today = new Date();
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - days);
        
        setDateRange({
            from: pastDate.toISOString().split('T')[0],
            to: today.toISOString().split('T')[0]
        });
    };

    const getTotalRevenue = () => {
        return topProducts.reduce((total, { product, quantity }) => {
            return total + (Number(product.price) * quantity);
        }, 0);
    };

    const getTotalOrders = () => {
        return topProducts.reduce((total, { quantity }) => total + quantity, 0);
    };

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto pt-4 px-4 sm:px-6 bg-base-200" ref={mainContentRef}>
                        <div className="max-w-7xl mx-auto">
                            {/* Header Section */}
                            <div className="mb-6">
                                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#ed003f]">
                                    <h1 className="text-3xl font-bold text-[#ed003f] mb-2 flex items-center">
                                        <ChartBarIcon className="w-8 h-8 mr-3" />
                                        Top Products Analytics
                                    </h1>
                                    <p className="text-gray-600">Analyze your best-performing products by sales volume and revenue.</p>
                                </div>
                            </div>

                            {/* Stats Cards */}
                            {topProducts.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Products</p>
                                                <p className="text-2xl font-bold text-gray-900">{topProducts.length}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <ChartBarIcon className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                                <p className="text-2xl font-bold text-gray-900">{getTotalOrders().toLocaleString()}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                <FunnelIcon className="w-6 h-6 text-green-600" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#ed003f]">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                                <p className="text-2xl font-bold text-gray-900">₱{getTotalRevenue().toLocaleString()}</p>
                                            </div>
                                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                                <DocumentArrowDownIcon className="w-6 h-6 text-[#ed003f]" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Main Content */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                {/* Header Controls */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">Performance Report</h2>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {dateRange.from && dateRange.to ? (
                                                    `${new Date(dateRange.from).toLocaleDateString()} - ${new Date(dateRange.to).toLocaleDateString()}`
                                                ) : (
                                                    'Select date range to view data'
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                            {/* Quick Date Filters */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setQuickDateRange(7)}
                                                    className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                                >
                                                    7 Days
                                                </button>
                                                <button
                                                    onClick={() => setQuickDateRange(30)}
                                                    className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                                >
                                                    30 Days
                                                </button>
                                                <button
                                                    onClick={() => setQuickDateRange(90)}
                                                    className="px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                                                >
                                                    90 Days
                                                </button>
                                            </div>
                                            
                                            {/* Date Range Inputs */}
                                            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                                                <CalendarIcon className="w-4 h-4 text-gray-500" />
                                                <input
                                                    type="date"
                                                    className="border-none bg-transparent text-sm focus:outline-none"
                                                    value={dateRange.from}
                                                    onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
                                                />
                                                <span className="text-gray-400 text-sm">to</span>
                                                <input
                                                    type="date"
                                                    className="border-none bg-transparent text-sm focus:outline-none"
                                                    value={dateRange.to}
                                                    onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
                                                />
                                            </div>

                                            {/* Download Button */}
                                            {topProducts.length > 0 && (
                                                <button
                                                    className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition-colors flex items-center gap-2"
                                                    onClick={handleDownloadPDF}
                                                >
                                                    <DocumentArrowDownIcon className="w-4 h-4" />
                                                    Export PDF
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Table Content */}
                                <div className="overflow-x-auto">
                                    {loading ? (
                                        <div className="flex justify-center items-center py-12">
                                            <div className="flex items-center gap-3">
                                                <div className="loading loading-spinner loading-md text-[#ed003f]"></div>
                                                <span className="text-gray-600">Loading analytics...</span>
                                            </div>
                                        </div>
                                    ) : topProducts.length > 0 ? (
                                        <table className="table w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="text-[#ed003f] font-semibold text-sm">Rank</th>
                                                    <th className="text-[#ed003f] font-semibold text-sm">Product</th>
                                                    <th className="text-[#ed003f] font-semibold text-sm">Category</th>
                                                    <th className="text-[#ed003f] font-semibold text-sm">Price</th>
                                                    <th className="text-[#ed003f] font-semibold text-sm">Stock</th>
                                                    <th className="text-[#ed003f] font-semibold text-sm">Orders</th>
                                                    <th className="text-[#ed003f] font-semibold text-sm">Revenue</th>
                                                    {/* <th className="text-[#ed003f] font-semibold text-sm">Created</th> */}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {topProducts.map(({ product, quantity }, index) => (
                                                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                                                        {/* Rank */}
                                                        <td>
                                                            <div className="flex items-center">
                                                                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                                                                    index === 0 ? 'bg-yellow-500' : 
                                                                    index === 1 ? 'bg-gray-400' : 
                                                                    index === 2 ? 'bg-orange-600' : 'bg-[#ed003f]'
                                                                }`}>
                                                                    {index + 1}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Product */}
                                                        <td>
                                                            <div className="flex items-center gap-3">
                                                                <div className="avatar">
                                                                    <div className="w-12 h-12 rounded-lg ring-2 ring-[#ed003f] ring-offset-2">
                                                                        {product.images && product.images.length > 0 ? (
                                                                            <img 
                                                                                src={product.images[0].url} 
                                                                                alt={product.name} 
                                                                                className="w-full h-full object-cover rounded-lg"
                                                                            />
                                                                        ) : (
                                                                            <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                                                                <span className="text-gray-400 text-xs">No Image</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-gray-900">{product.name}</div>
                                                                    <div className="text-sm text-gray-500 truncate max-w-xs">
                                                                        {product.description}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Category */}
                                                        <td>
                                                            <span className="badge badge-outline text-[#ed003f] border-[#ed003f]">
                                                                {product.category?.name || "Unknown"}
                                                            </span>
                                                        </td>

                                                        {/* Price */}
                                                        <td>
                                                            <span className="font-semibold text-gray-900">
                                                                ₱{Number(product.price).toFixed(2)}
                                                            </span>
                                                        </td>

                                                        {/* Stock */}
                                                        <td>
                                                            <span className={`badge ${product.stock < 10 ? 'badge-error' : 'badge-success'} badge-outline`}>
                                                                {product.stock}
                                                            </span>
                                                        </td>

                                                        {/* Orders */}
                                                        <td>
                                                            <span className="font-bold text-[#ed003f] text-lg">
                                                                {quantity}
                                                            </span>
                                                        </td>

                                                        {/* Revenue */}
                                                        <td>
                                                            <span className="font-bold text-green-600">
                                                                ₱{(Number(product.price) * quantity).toLocaleString()}
                                                            </span>
                                                        </td>

                                                        {/* Created Date */}
                                                        {/* <td>
                                                            <span className="text-sm text-gray-500">
                                                                {product?.createdAt
                                                                    ? new Date(product.createdAt).toLocaleDateString('en-US', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    })
                                                                    : 'N/A'
                                                                }
                                                            </span>
                                                        </td> */}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="max-w-md mx-auto">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <ChartBarIcon className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    {dateRange.from && dateRange.to ? 'No products found' : 'Select date range'}
                                                </h3>
                                                <p className="text-gray-600 mb-6">
                                                    {dateRange.from && dateRange.to ? 
                                                        "No top products found for the selected date range" : 
                                                        "Choose a date range to view your top-performing products"
                                                    }
                                                </p>
                                                {!dateRange.from || !dateRange.to ? (
                                                    <button
                                                        className="btn bg-[#ed003f] text-white border-none hover:bg-red-700"
                                                        onClick={() => setQuickDateRange(30)}
                                                    >
                                                        <CalendarIcon className="w-4 h-4 mr-2" />
                                                        Load Last 30 Days
                                                    </button>
                                                ) : null}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
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

export default TopProduct;