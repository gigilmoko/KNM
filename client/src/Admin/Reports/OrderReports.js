import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import TitleCard from '../../Layout/components/Cards/TitleCard';

const OrderReports = () => {
  const [activeTab, setActiveTab] = useState('Preparing');
  const [preparingOrders, setPreparingOrders] = useState([]);
  const [shippingOrders, setShippingOrders] = useState([]);
  const [deliveredOrders, setDeliveredOrders] = useState([]);

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

  const renderOrdersTable = (orders) => (
    <table className="table w-full mt-6">
      <thead>
        <tr>
          <th>Order ID</th>
          <th>Customer</th>
          {activeTab === 'Preparing' && <th>Products Ordered</th>}
          {activeTab === 'Shipped' && (
            <>
              <th>Address</th>
              <th>Products Ordered</th>
            </>
          )}
          {activeTab === 'Delivered' && <th>Products Ordered</th>}
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order._id}>
            <td>{order._id}</td>
            <td>{order.user ? `${order.user.fname} ${order.user.lname}` : 'Unknown User'}</td>
            {activeTab === 'Preparing' && (
              <td>
                {order.orderProducts.map(product => (
                  <div key={product.product?._id}>{product.product?.name || 'Unknown Product'}</div>
                ))}
              </td>
            )}
            {activeTab === 'Shipped' && (
              <>
                <td>{order.deliveryAddress}</td>
                <td>
                  {order.orderProducts.map(product => (
                    <div key={product.product?._id}>{product.product?.name || 'Unknown Product'}</div>
                  ))}
                </td>
              </>
            )}
            {activeTab === 'Delivered' && (
              <td>
                {order.orderProducts.map(product => (
                  <div key={product.product?._id}>{product.product?.name || 'Unknown Product'}</div>
                ))}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );

  const generatePDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Order Reports', 14, 20);
  
    const tableColumn = ['Order ID', 'Customer', 'Products Ordered'];
    const tableRows = [];
  
    const orders = activeTab === 'Preparing' ? preparingOrders : activeTab === 'Shipped' ? shippingOrders : deliveredOrders;
  
    orders.forEach(order => {
      const products = order.orderProducts.map(product => product.product?.name || 'Unknown Product').join(', ');
      const customerName = order.user ? `${order.user.fname} ${order.user.lname}` : 'Unknown User';
      tableRows.push([order._id, customerName, products]);
    });
  
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40
    });
  
    doc.save('Order_Reports.pdf');
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <main className="flex-1 p-6 bg-base-200">
            <TitleCard title="Order Reports" TopSideButtons={
              <button className="btn btn-primary" onClick={generatePDF}>
                Download PDF
              </button>
            }>
              <div className="tabs">
                <button className={`tab ${activeTab === 'Preparing' ? 'tab-active' : ''}`} onClick={() => setActiveTab('Preparing')}>Preparing</button>
                <button className={`tab ${activeTab === 'Shipped' ? 'tab-active' : ''}`} onClick={() => setActiveTab('Shipped')}>Shipping</button>
                <button className={`tab ${activeTab === 'Delivered' ? 'tab-active' : ''}`} onClick={() => setActiveTab('Delivered')}>Delivered</button>
              </div>
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
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