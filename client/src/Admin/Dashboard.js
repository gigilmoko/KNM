import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { showNotification } from '../Layout/common/headerSlice';

import Header from '../Layout/Header';
import LeftSidebar from '../Layout/LeftSidebar';
import RightSidebar from '../Layout/RightSidebar';
import ModalLayout from '../Layout/ModalLayout';

import DashboardStats from './components/DashboardStats';
import LineChart from './components/LineChart';
import BarChart from './components/BarChart';
import DashboardTopBar from './components/DashboardTopBar';

import UserGroupIcon from '@heroicons/react/24/outline/UserGroupIcon';
import UsersIcon from '@heroicons/react/24/outline/UsersIcon';
import CircleStackIcon from '@heroicons/react/24/outline/CircleStackIcon';
import CreditCardIcon from '@heroicons/react/24/outline/CreditCardIcon';

const Dashboard = () => {
  const dispatch = useDispatch();
  const [totalCustomers, setTotalCustomers] = useState("0");
  const [totalSales, setTotalSales] = useState("$0");
  const [ordersCatered, setOrdersCatered] = useState("0");
  const [totalUsers, setTotalUsers] = useState("0");
  const [totalMembers, setTotalMembers] = useState("0");
  const [pendingOrders, setPendingOrders] = useState("0");
  const [deliveredOrders, setDeliveredOrders] = useState("0");
  const [applyingMembers, setApplyingMembers] = useState("0");
  const [user, setUser] = useState(null);

  const getProfile = async () => {
    const config = {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      },
    };
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
      setUser(data.user);
    } catch (error) {
      console.error('Failed to load profile.');
    }
  };

  const fetchApplyingMembers = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API}/api/analytics/users/countapplying`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.success) {
        setApplyingMembers(response.data.count.toString());
      } else {
        setApplyingMembers("0");
      }
    } catch (error) {
      setApplyingMembers("0");
    }
  };

  const fetchOrderStatusCounts = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API}/api/orders/status/count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && response.data.success) {
        const { statusCounts } = response.data;
        const delivered = statusCounts.Delivered || 0;
        const pending = (statusCounts.Preparing || 0) + (statusCounts.Shipped || 0);
        setDeliveredOrders(delivered.toString());
        setPendingOrders(pending.toString());
      } else {
        setDeliveredOrders("0");
        setPendingOrders("0");
      }
    } catch (error) {
      setDeliveredOrders("0");
      setPendingOrders("0");
    }
  };

  useEffect(() => {
    getProfile();

    const fetchTotalCustomers = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API}/api/analytics/orders/totalcustomers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.success) {
          setTotalCustomers(response.data.totalCustomers.toString());
        } else {
          setTotalCustomers("0");
        }
      } catch (error) {
        setTotalCustomers("0");
      }
    };

    const fetchTotalSales = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API}/api/analytics/orders/totalprice`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.success) {
          setTotalSales(`$${response.data.totalPrice.toLocaleString()}`);
        } else {
          setTotalSales("$0");
        }
      } catch (error) {
        setTotalSales("$0");
      }
    };

    const fetchOrdersCatered = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API}/api/analytics/orders/quantity`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.success) {
          setOrdersCatered(response.data.orderCount.toString());
        } else {
          setOrdersCatered("0");
        }
      } catch (error) {
        setOrdersCatered("0");
      }
    };

    const fetchTotalUsers = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API}/api/analytics/users/quantity`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.success) {
          setTotalUsers(response.data.count.toString());
        } else {
          setTotalUsers("0");
        }
      } catch (error) {
        setTotalUsers("0");
      }
    };

    const fetchTotalMembers = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API}/api/analytics/users/totalmembers`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.data && response.data.success) {
          setTotalMembers(response.data.totalMembers.toString());
        } else {
          setTotalMembers("0");
        }
      } catch (error) {
        setTotalMembers("0");
      }
    };

    fetchTotalCustomers();
    fetchTotalSales();
    fetchOrdersCatered();
    fetchTotalUsers();
    fetchTotalMembers();
    fetchOrderStatusCounts();
    fetchApplyingMembers();
  }, []);

  // Removed description from statsData
  const statsData = [
    { title: "Total Sales", value: totalSales, icon: <CreditCardIcon className='w-8 h-8 text-[#df1f47]' /> },
    { title: "Orders Catered", value: ordersCatered, icon: <CircleStackIcon className='w-8 h-8 text-[#df1f47]' /> },
    { title: "Pending Orders", value: pendingOrders, icon: <CircleStackIcon className='w-8 h-8 text-[#df1f47]' /> },
    { title: "Delivered Orders", value: deliveredOrders, icon: <CircleStackIcon className='w-8 h-8 text-[#df1f47]' /> },
    { title: "Total Customers", value: totalCustomers, icon: <UserGroupIcon className='w-8 h-8 text-[#df1f47]' /> },
    { title: "Total Users", value: totalUsers, icon: <UsersIcon className='w-8 h-8 text-[#df1f47]' /> },
    { title: "Total Members", value: totalMembers, icon: <UsersIcon className='w-8 h-8 text-[#df1f47]' /> },
    { title: "Applying Members", value: applyingMembers, icon: <UsersIcon className='w-8 h-8 text-[#df1f47]' /> },
  ];

  const updateDashboardPeriod = (newRange) => {
    dispatch(showNotification({ message: `Period updated to ${newRange.startDate} to ${newRange.endDate}`, status: 1 }));
  };

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-base-200">
          <DashboardTopBar updateDashboardPeriod={updateDashboardPeriod} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-2">
            {statsData.map((d, k) => (
              <DashboardStats key={k} {...d} colorIndex={k} />
            ))}
          </div>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-[#df1f47]">
              <LineChart
                lineColor="#df1f47"
                gridColor="#fde8ee"
                labelColor="#df1f47"
                pointColor="#df1f47"
              />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-[#df1f47]">
              <BarChart
                barColor="#df1f47"
                gridColor="#fde8ee"
                labelColor="#df1f47"
              />
            </div>
          </div>
        </main>
      </div>
      <LeftSidebar />
      <RightSidebar />
      <ModalLayout />
    </div>
  );
};

export default Dashboard;