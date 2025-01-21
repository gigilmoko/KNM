import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { showNotification } from '../Layout/common/headerSlice';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas-pro';

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
  const [pendingOrders, setPendingOrders] = useState("0");
  const [deliveredOrders, setDeliveredOrders] = useState("0");
  const [applyingMembers, setApplyingMembers] = useState("0");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const chartRef = useRef(); // Reference to capture charts as images

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
      console.error('Error fetching applying members count:', error);
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
      console.error('Error fetching order status counts:', error);
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

    fetchTotalCustomers();
    fetchTotalSales();
    fetchOrdersCatered();
    fetchTotalUsers();
    fetchTotalMembers();
    fetchOrderStatusCounts();
    fetchApplyingMembers();
  }, []);

  const generatePDF = async () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Dashboard Report', 14, 20);

  
    const tableColumn = ["Statistic", "Value"];
    const tableRows = [
      ["Total Sales", totalSales],
      ["Orders Catered", ordersCatered],
      ["Pending Orders", '0'],
      ["Delivered Orders", '0'],
      ["Total Customers", totalCustomers],
      ["Total Users", totalUsers],
      ["Total Members", totalMembers],
      ["Applying Members", '0'],
    ];
  
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });
  
    if (chartRef.current) {
      try {
        // Ensure charts are fully rendered before capturing
        await new Promise((resolve) => setTimeout(resolve, 500)); 
  
        const chartCanvas = await html2canvas(chartRef.current, { scale: 2 });
  
        const imgWidth = 190; 
        const imgHeight = (chartCanvas.height * imgWidth) / chartCanvas.width;
  
        doc.addPage();
        doc.text('Charts', 14, 20);
        doc.addImage(chartCanvas.toDataURL('image/png'), 'PNG', 10, 30, imgWidth, imgHeight);
      } catch (error) {
        console.error('Error capturing charts:', error);
      }
    }
      // Capture Bar Chart
  const barChartCanvas = await html2canvas(document.querySelector("#barChart"));
  const barChartImg = barChartCanvas.toDataURL("image/png");

  // Capture Line Chart
  const lineChartCanvas = await html2canvas(document.querySelector("#lineChart"));
  const lineChartImg = lineChartCanvas.toDataURL("image/png");

  doc.addImage(barChartImg, "PNG", 10, 30, 180, 100);
  doc.addImage(lineChartImg, "PNG", 10, 140, 180, 100);
  
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, doc.internal.pageSize.height - 10);
    doc.save('Dashboard_Report.pdf');
  };
  


  const statsData = [
    { title: "Total Sales", value: totalSales, icon: <CreditCardIcon className='w-8 h-8' />, description: "Current month" },
    { title: "Orders Catered", value: ordersCatered, icon: <CircleStackIcon className='w-8 h-8' />, description: "Lifetime" },
    { title: "Pending Orders", value: pendingOrders, icon: <CircleStackIcon className='w-8 h-8' />, description: "Lifetime" },
    { title: "Delivered Orders", value: deliveredOrders, icon: <CircleStackIcon className='w-8 h-8' />, description: "Lifetime" },
    { title: "Total Customers", value: totalCustomers, icon: <UserGroupIcon className='w-8 h-8' />, description: "Lifetime" },
    { title: "Total Users", value: totalUsers, icon: <UsersIcon className='w-8 h-8' />, description: "Lifetime" },
    { title: "Total Members", value: totalMembers, icon: <UsersIcon className='w-8 h-8' />, description: "Lifetime" },
    { title: "Applying Members", value: applyingMembers, icon: <UsersIcon className='w-8 h-8' />, description: "Lifetime" },
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
          <DashboardTopBar updateDashboardPeriod={updateDashboardPeriod} />
          <div className="grid lg:grid-cols-4 mt-2 md:grid-cols-2 grid-cols-1 gap-6">
            {statsData.map((d, k) => (
              <DashboardStats key={k} {...d} colorIndex={k} />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">

          {/** ---------------------- Different charts ------------------------- */}
          <div ref={chartRef} className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
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
        <button
          onClick={generatePDF}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4"
        >
          Download PDF Report
        </button>

        </main>
      </div>
      <LeftSidebar />
      <RightSidebar />
      <ModalLayout />
    </div>
  );
};

export default Dashboard;

