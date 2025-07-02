import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { 
  Download, 
  ClipboardList, 
  Truck, 
  CheckCircle,
  Calendar,
  User,
  ShoppingBag,
  DollarSign,
  PhilippinePeso,
  ArrowUpDown
} from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';

const OrderReports = () => {
  const mainContentRef = useRef(null);
  const [activeTab, setActiveTab] = useState('Preparing');
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [shippingOrders, setShippingOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [sortAsc, setSortAsc] = useState(false); // Default to newest first
  const [loading, setLoading] = useState(false);

  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    mainContentRef.current?.scroll({
      top: 0,
      behavior: "smooth"
    });
  }, []);

  useEffect(() => {
    fetchOrderReports();
  }, []);

  const fetchOrderReports = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API}/api/reports/order-reports`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPreparingOrders(response.data.preparingOrders || []);
      setShippingOrders(response.data.shippingOrders || []);
      setDeliveredOrders(response.data.deliveredOrders || []);
    } catch (error) {
      console.error('Error fetching order reports:', error);
      toast.error('Failed to load order reports');
      setPreparingOrders([]);
      setShippingOrders([]);
      setDeliveredOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders by date range
  const filterByDate = (orders) => {
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  };

  // Sorting function for orders by date
  const sortOrders = (orders) => {
    return [...orders].sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
  };

  const setQuickDateRange = (days) => {
    const today = new Date();
    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - days);
    
    setStartDate(pastDate);
    setEndDate(today);
  };

  // Get current orders based on active tab
  const getCurrentOrders = () => {
    switch (activeTab) {
      case 'Preparing':
        return preparingOrders;
      case 'Shipped':
        return shippingOrders;
      case 'Delivered':
        return deliveredOrders;
      default:
        return [];
    }
  };

  const getFilteredOrders = () => {
    return sortOrders(filterByDate(getCurrentOrders()));
  };

  // Calculate statistics
  const getTotalOrders = () => {
    return preparingOrders.length + shippingOrders.length + deliveredOrders.length;
  };

  const getTotalRevenue = () => {
    const allOrders = [...preparingOrders, ...shippingOrders, ...deliveredOrders];
    return filterByDate(allOrders).reduce((total, order) => total + (order.totalPrice || 0), 0);
  };

  const getTabIcon = (tab) => {
    switch (tab) {
      case 'Preparing':
        return <ClipboardList className="w-5 h-5" />;
      case 'Shipped':
        return <Truck className="w-5 h-5" />;
      case 'Delivered':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const renderOrdersTable = () => {
    const filteredOrders = getFilteredOrders();

    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="flex items-center gap-3">
            <div className="loading loading-spinner loading-md text-[#ed003f]"></div>
            <span className="text-gray-600">Loading orders...</span>
          </div>
        </div>
      );
    }

    if (filteredOrders.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {getTabIcon(activeTab)}
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab.toLowerCase()} orders found
            </h3>
            <p className="text-gray-600 mb-6">
              No orders found for the selected date range. Try adjusting your filters.
            </p>
            <button
              className="btn bg-[#ed003f] text-white border-none hover:bg-red-700"
              onClick={() => setQuickDateRange(30)}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Load Last 30 Days
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-[#ed003f] font-semibold text-sm">
                <div className="flex items-center justify-center gap-2">
                  Date & Time
                  <button
                    className="btn btn-xs btn-ghost text-[#ed003f] hover:bg-red-50"
                    onClick={() => setSortAsc((prev) => !prev)}
                    title="Sort by date"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </div>
              </th>
              <th className="text-[#ed003f] font-semibold text-sm text-center">Order ID</th>
              <th className="text-[#ed003f] font-semibold text-sm text-center">Customer</th>
              <th className="text-[#ed003f] font-semibold text-sm text-center">Products</th>
              <th className="text-[#ed003f] font-semibold text-sm text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.KNMOrderId} className="hover:bg-gray-50 transition-colors">
                <td className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : 'N/A'}
                    </span>
                  </div>
                </td>
                <td className="text-center">
                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                    {order.KNMOrderId}
                  </span>
                </td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 bg-[#ed003f] text-white rounded-full flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="font-semibold">
                      {order.user ? `${order.user.fname} ${order.user.lname}` : 'Unknown User'}
                    </span>
                  </div>
                </td>
                <td className="text-center">
                  <div className="space-y-1">
                    {order.orderProducts.map((product, index) => (
                      <div key={product.product?._id || index} className="flex items-center justify-center gap-2">
                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">
                          {product.product?.name || 'Unknown Product'}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <PhilippinePeso className="w-4 h-4 text-green-600" />
                    <span className="font-bold text-green-600">
                      ₱{order.totalPrice ? Number(order.totalPrice).toLocaleString() : '0.00'}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();

    const now = new Date();
    const formattedNow = now.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor('#ed003f');
    const titleText = 'Kababaihan ng Maynila';
    const titleWidth = doc.getTextWidth(titleText);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(titleText, titleX, 20);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor('#000000');
    const subText = `Order Report - ${activeTab}`;
    const subWidth = doc.getTextWidth(subText);
    const subX = (pageWidth - subWidth) / 2;
    doc.text(subText, subX, 30);

    // Date range
    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 14, 40);

    // Prepare table data
    const tableColumn = ['Date & Time', 'Order ID', 'Customer', 'Products Ordered', 'Total Price'];
    const tableRows = [];

    const filteredOrders = getFilteredOrders();

    filteredOrders.forEach(order => {
      const products = order.orderProducts
        .map(product => product.product?.name || 'Unknown Product')
        .join(', ');
      const customerName = order.user ? `${order.user.fname} ${order.user.lname}` : 'Unknown User';
      const totalPrice = order.totalPrice ? `₱${Number(order.totalPrice).toFixed(2)}` : 'N/A';
      const dateTime = order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : 'N/A';
      tableRows.push([dateTime, order.KNMOrderId, customerName, products, totalPrice]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      headStyles: {
        fillColor: [237, 0, 63],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        textColor: '#000000',
        cellPadding: 3,
        fontSize: 9,
        halign: 'center',
        valign: 'middle'
      },
      alternateRowStyles: {
        fillColor: [249, 249, 249]
      },
      tableWidth: 'auto',
      margin: { left: 10, right: 10 },
      didDrawPage: function (data) {
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text(`Generated on: ${formattedNow}`, data.settings.margin.left, doc.internal.pageSize.height - 10);
      }
    });

    doc.save(`order-report-${activeTab.toLowerCase()}_${startDate.toISOString().split('T')[0]}_to_${endDate.toISOString().split('T')[0]}.pdf`);
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
                    <ClipboardList className="w-8 h-8 mr-3" />
                    Order Analytics
                  </h1>
                  <p className="text-gray-600">Track and analyze order performance across different statuses.</p>
                </div>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-900">{getTotalOrders()}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <ClipboardList className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">₱{getTotalRevenue().toLocaleString()}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <PhilippinePeso className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#ed003f]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Current Status</p>
                      <p className="text-2xl font-bold text-gray-900">{getFilteredOrders().length}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      {getTabIcon(activeTab)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {/* Header Controls */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
                      <p className="text-sm text-gray-600 mt-1">
                        {startDate && endDate ? (
                          `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
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
                      </div>
                      
                      {/* Date Range Inputs */}
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <DatePicker
                          selected={startDate}
                          onChange={(date) => setStartDate(date)}
                          selectsStart
                          startDate={startDate}
                          endDate={endDate}
                          className="border-none bg-transparent text-sm focus:outline-none w-20"
                          dateFormat="MM/dd/yyyy"
                        />
                        <span className="text-gray-400 text-sm">to</span>
                        <DatePicker
                          selected={endDate}
                          onChange={(date) => setEndDate(date)}
                          selectsEnd
                          startDate={startDate}
                          endDate={endDate}
                          minDate={startDate}
                          className="border-none bg-transparent text-sm focus:outline-none w-20"
                          dateFormat="MM/dd/yyyy"
                        />
                      </div>

                      {/* Download Button */}
                      {getFilteredOrders().length > 0 && (
                        <button
                          className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition-colors flex items-center gap-2"
                          onClick={generatePDF}
                        >
                          <Download className="w-4 h-4" />
                          Export PDF
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex">
                    {['Preparing', 'Shipped', 'Delivered'].map((tab) => (
                      <button
                        key={tab}
                        className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition-colors ${
                          activeTab === tab
                            ? 'bg-[#ed003f] text-white border-b-2 border-[#ed003f]'
                            : 'text-gray-600 hover:text-[#ed003f] hover:bg-gray-50'
                        }`}
                        onClick={() => setActiveTab(tab)}
                      >
                        {getTabIcon(tab)}
                        {tab}
                        <span className="ml-2 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded-full">
                          {tab === 'Preparing' && preparingOrders.length}
                          {tab === 'Shipped' && shippingOrders.length}
                          {tab === 'Delivered' && deliveredOrders.length}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                  {renderOrdersTable()}
                </div>
              </div>
            </div>
            <div className="h-16"></div>
          </main>
        </div>
        <LeftSidebar />
      </div>
      <RightSidebar />
      <ModalLayout />
    </>
  );
};

export default OrderReports;