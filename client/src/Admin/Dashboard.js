import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { showNotification } from '../Layout/common/headerSlice';

import Header from '../Layout/Header';
import LeftSidebar from '../Layout/LeftSidebar';
import RightSidebar from '../Layout/RightSidebar';
import ModalLayout from '../Layout/ModalLayout';

import DashboardStats from './components/DashboardStats';
import AmountStats from './components/AmountStats';
import PageStats from './components/PageStats';
import UserChannels from './components/UserChannels';
import LineChart from './components/LineChart';
import BarChart from './components/BarChart';
import DashboardTopBar from './components/DashboardTopBar';
import DoughnutChart from './components/DoughnutChart';

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getProfile = async () => {
    const config = {
        headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
    };
    try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
        setUser(data.user);
        setLoading(false);
    } catch (error) {
        setError('Failed to load profile.');
        setLoading(false);
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
        console.log(response.data);
        if (response.data && response.data.success) {
          setTotalCustomers(response.data.totalCustomers.toString());
        } else {
          setTotalCustomers("0");
        }
      } catch (error) {
        console.error('Error fetching total customers:', error);
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
        console.error('Error fetching total sales:', error);
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
        console.error('Error fetching orders catered:', error);
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
        console.error('Error fetching total users:', error);
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
        console.error('Error fetching total members:', error);
        setTotalMembers("0");
      }
    };

    // Call each function
    fetchTotalCustomers();
    fetchTotalSales();
    fetchOrdersCatered();
    fetchTotalUsers();
    fetchTotalMembers();
  }, []);

  const statsData = [
    
    { title: "Total Sales", value: totalSales, icon: <CreditCardIcon className='w-8 h-8' />, description: "Current month" },
    { title: "Orders Catered", value: ordersCatered, icon: <CircleStackIcon className='w-8 h-8' />, description: "Lifetime" },
    { title: "Pending Orders", value: '0', icon: <CircleStackIcon className='w-8 h-8' />, description: "Lifetime" },
    { title: "Delivered Orders", value: '0', icon: <CircleStackIcon className='w-8 h-8' />, description: "Lifetime" },
    { title: "Total Customers", value: totalCustomers, icon: <UserGroupIcon className='w-8 h-8' />, description: "Lifetime" },
    { title: "Total Users ", value: `${totalUsers} `, icon: <UsersIcon className='w-8 h-8' />, description: "Lifetime" },
    { title: "Total Members", value: ` ${totalMembers}`, icon: <UsersIcon className='w-8 h-8' />, description: "Lifetime" },
    { title: "Applying Members", value: '0', icon: <UsersIcon className='w-8 h-8' />, description: "Lifetime" },
  ];

  const updateDashboardPeriod = (newRange) => {
    dispatch(showNotification({ message: `Period updated to ${newRange.startDate} to ${newRange.endDate}`, status: 1 }));
  };

  return (
    <div className="drawer lg:drawer-open">
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200">
          {/** ---------------------- Select Period Content ------------------------- */}
          <DashboardTopBar updateDashboardPeriod={updateDashboardPeriod} />

          {/** ---------------------- Different stats content 1 ------------------------- */}
          <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
            {statsData.map((d, k) => (
              <DashboardStats key={k} {...d} colorIndex={k} />
            ))}
          </div>

          {/** ---------------------- Different charts ------------------------- */}
          <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
            <LineChart />
            <BarChart />
          </div>

          {/** ---------------------- Different stats content 2 ------------------------- */}
          {/* <div className="grid lg:grid-cols-2 mt-10 grid-cols-1 gap-6">
            <AmountStats />
            <PageStats />
          </div> */}

          {/** ---------------------- User source channels table  ------------------------- */}
          {/* <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
            <UserChannels />
            <DoughnutChart />
          </div> */}
        </main>
      </div>
      <LeftSidebar />
      <RightSidebar />
      <ModalLayout />
    </div>
  );
};

export default Dashboard;
