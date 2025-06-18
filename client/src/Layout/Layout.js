import PageContent from "./PageContent";
import LeftSidebar from "./LeftSidebar";
import { useSelector, useDispatch } from 'react-redux';
import RightSidebar from './RightSidebar';
import { useEffect } from "react";
import { removeNotificationMessage } from "../features/common/headerSlice";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import ModalLayout from "./ModalLayout";

function Layout() {
  const dispatch = useDispatch();
  const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);

  useEffect(() => {
    if (newNotificationMessage !== "") {
      if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
      if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
      dispatch(removeNotificationMessage());
    }
    // eslint-disable-next-line
  }, [newNotificationMessage]);

  return (
    <>
      {/* Responsive Drawer Layout */}
      <div className="drawer lg:drawer-open min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          {/* Main Page Content */}
          <div className="flex-1 flex flex-col">
            <PageContent />
          </div>
        </div>
        {/* Sidebar */}
        <LeftSidebar />
      </div>

      {/* Right Sidebar (Notifications, etc.) */}
      <RightSidebar />

      {/* Notification layout container */}
      <NotificationContainer />

      {/* Modal layout container */}
      <ModalLayout />

      {/* Floating Mobile Menu Button */}
      <label
        htmlFor="left-sidebar-drawer"
        className="fixed z-40 bottom-6 left-6 btn btn-circle bg-[#df1f47] text-white shadow-lg border-none lg:hidden flex items-center justify-center transition hover:bg-red-700"
        style={{ boxShadow: "0 4px 24px 0 rgba(223,31,71,0.15)" }}
        aria-label="Open sidebar"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </label>
    </>
  );
}

export default Layout;