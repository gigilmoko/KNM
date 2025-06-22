import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const OrderReports = () => {
  const [activeTab, setActiveTab] = useState('Preparing');
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [shippingOrders, setShippingOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [sortAsc, setSortAsc] = useState(true);

  // Date range state
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());

  useEffect(() => {
    const fetchOrderReports = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API}/api/reports/order-reports`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPreparingOrders(response.data.preparingOrders);
        setShippingOrders(response.data.shippingOrders);
        setDeliveredOrders(response.data.deliveredOrders);
      } catch (error) {
        console.error('Error fetching order reports:', error);
      }
    };

    fetchOrderReports();
  }, []);

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

  const renderOrdersTable = (orders) => (
    <div className="overflow-x-auto">
      <table className="table w-full mt-6 text-xs sm:text-sm">
        <thead>
          <tr>
            <th style={{ color: '#ed003f', fontSize: '0.9rem', textAlign: 'center' }}>
              <div className="flex items-center justify-center gap-1">
                Date & Time
                <button
                  className="ml-1 text-[#ed003f] border border-[#ed003f] rounded px-1 py-0.5 text-xs"
                  onClick={() => setSortAsc((prev) => !prev)}
                  title="Sort"
                  type="button"
                >
                  {sortAsc ? '▲' : '▼'}
                </button>
              </div>
            </th>
            <th style={{ color: '#ed003f', fontSize: '0.9rem', textAlign: 'center' }}>Order ID</th>
            <th style={{ color: '#ed003f', fontSize: '0.9rem', textAlign: 'center' }}>Customer</th>
            <th style={{ color: '#ed003f', fontSize: '0.9rem', textAlign: 'center' }}>Products Ordered</th>
            <th style={{ color: '#ed003f', fontSize: '0.9rem', textAlign: 'center' }}>Total Price</th>
          </tr>
        </thead>
        <tbody>
          {sortOrders(filterByDate(orders)).map(order => (
            <tr key={order.KNMOrderId}>
              <td className="text-center">
                {order.createdAt
                  ? new Date(order.createdAt).toLocaleString()
                  : 'N/A'}
              </td>
              <td className="text-center">{order.KNMOrderId}</td>
              <td className="text-center">{order.user ? `${order.user.fname} ${order.user.lname}` : 'Unknown User'}</td>
              <td className="text-center">
                <div className="flex flex-col items-center">
                  {order.orderProducts.map(product => (
                    <div key={product.product?._id} className="py-0.5">
                      {product.product?.name || 'Unknown Product'}
                    </div>
                  ))}
                </div>
              </td>
              <td className="text-center">{order.totalPrice ? `₱${Number(order.totalPrice).toFixed(2)}` : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const generatePDF = () => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#ed003f');
    const titleText = 'Kababaihan ng Maynila';
    const titleWidth = doc.getTextWidth(titleText);
    const titleX = (pageWidth - titleWidth) / 2;
    doc.text(titleText, titleX, 20);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(15);
    doc.setTextColor('#000000');
    const subText = 'Order Report';
    const subWidth = doc.getTextWidth(subText);
    const subX = (pageWidth - subWidth) / 2;
    doc.text(subText, subX, 35);

    // Prepare table data
    let tableColumn = ['Date & Time', 'Order ID', 'Customer', 'Products Ordered', 'Total Price'];
    let tableRows = [];

    const orders = activeTab === 'Preparing' ? preparingOrders :
                   activeTab === 'Shipped' ? shippingOrders :
                   deliveredOrders;

    sortOrders(filterByDate(orders)).forEach(order => {
      const products = order.orderProducts
        .map(product => product.product?.name || 'Unknown Product')
        .join('\n');
      const customerName = order.user ? `${order.user.fname} ${order.user.lname}` : 'Unknown User';
      const totalPrice = order.totalPrice ? `${Number(order.totalPrice).toFixed(2)}` : 'N/A';
      const dateTime = order.createdAt
        ? new Date(order.createdAt).toLocaleString()
        : 'N/A';
      tableRows.push([dateTime, order.KNMOrderId, customerName, products, totalPrice]);
    });

autoTable(doc, {
  head: [tableColumn],
  body: tableRows,
  startY: 45,
  headStyles: {
    fillColor: [237, 0, 63],
    textColor: 255,
    halign: 'center'
  },
  styles: {
    textColor: '#000000',
    cellPadding: 3,
    fontSize: 10,
    halign: 'center',
    valign: 'middle'
  },
  // Remove columnStyles.cellWidth to allow responsive sizing
  tableWidth: 'auto', // or 'wrap'
  margin: { left: 10, right: 10 }
});

doc.save('Order_Reports.pdf');
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-2 sm:p-6 bg-base-200">
            <TitleCard
              title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>Order Report</span>}
              TopSideButtons={
                <button
                  className="btn"
                  style={{ backgroundColor: '#ed003f', borderColor: '#ed003f', color: '#ffffff' }}
                  onClick={generatePDF}
                >
                  Download PDF
                </button>
              }
            >
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4 mb-4">
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="input input-bordered w-full sm:w-auto"
                />
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="input input-bordered w-full sm:w-auto"
                />
              </div>
              <div className="w-full flex justify-center mb-4">
                <div className="flex w-full">
                  <button
                    className={`flex-1 flex items-center justify-center tab rounded-none first:rounded-l-md last:rounded-r-md px-4 py-2 font-semibold border transition-colors duration-200 ${
                      activeTab === 'Preparing'
                        ? 'bg-[#ed003f] text-white border-[#ed003f]'
                        : 'border-[#ed003f] text-[#ed003f] bg-white'
                    }`}
                    onClick={() => setActiveTab('Preparing')}
                  >
                    Preparing
                  </button>
                  <button
                    className={`flex-1 flex items-center justify-center tab rounded-none first:rounded-l-md last:rounded-r-md px-4 py-2 font-semibold border-t border-b border-l transition-colors duration-200 ${
                      activeTab === 'Shipped'
                        ? 'bg-[#ed003f] text-white border-[#ed003f]'
                        : 'border-[#ed003f] text-[#ed003f] bg-white'
                    }`}
                    onClick={() => setActiveTab('Shipped')}
                  >
                    Shipping
                  </button>
                  <button
                    className={`flex-1 flex items-center justify-center tab rounded-none first:rounded-l-md last:rounded-r-md px-4 py-2 font-semibold border transition-colors duration-200 ${
                      activeTab === 'Delivered'
                        ? 'bg-[#ed003f] text-white border-[#ed003f]'
                        : 'border-[#ed003f] text-[#ed003f] bg-white'
                    }`}
                    onClick={() => setActiveTab('Delivered')}
                  >
                    Delivered
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                {activeTab === 'Preparing' && renderOrdersTable(preparingOrders)}
                {activeTab === 'Shipped' && renderOrdersTable(shippingOrders)}
                {activeTab === 'Delivered' && renderOrdersTable(deliveredOrders)}
              </div>
            </TitleCard>
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