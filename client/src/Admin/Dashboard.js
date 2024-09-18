import { useState } from 'react';
import { useDispatch } from 'react-redux';
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

const statsData = [
  { title: "New Users", value: "34.7k", icon: <UserGroupIcon className='w-8 h-8' />, description: "↗︎ 2300 (22%)" },
  { title: "Total Sales", value: "$34,545", icon: <CreditCardIcon className='w-8 h-8' />, description: "Current month" },
  { title: "Pending Leads", value: "450", icon: <CircleStackIcon className='w-8 h-8' />, description: "50 in hot leads" },
  { title: "Active Users", value: "5.6k", icon: <UsersIcon className='w-8 h-8' />, description: "↙ 300 (18%)" },
];

function Dashboard() {
  const dispatch = useDispatch();

  const updateDashboardPeriod = (newRange) => {
    // Dashboard range changed, write code to refresh your values
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
            {
              statsData.map((d, k) => {
                return (
                  <DashboardStats key={k} {...d} colorIndex={k} />
                )
              })
            }
          </div>

          {/** ---------------------- Different charts ------------------------- */}
          <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
            <LineChart />
            <BarChart />
          </div>

          {/** ---------------------- Different stats content 2 ------------------------- */}
          <div className="grid lg:grid-cols-2 mt-10 grid-cols-1 gap-6">
            <AmountStats />
            <PageStats />
          </div>

          {/** ---------------------- User source channels table  ------------------------- */}
          <div className="grid lg:grid-cols-2 mt-4 grid-cols-1 gap-6">
            <UserChannels />
            <DoughnutChart />
          </div>
        </main>
      </div>
      <LeftSidebar />
      <RightSidebar />
      <ModalLayout />
    </div>
  );
}

export default Dashboard;
