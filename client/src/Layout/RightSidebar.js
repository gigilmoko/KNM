import React, { useState, useEffect } from 'react';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import NotificationBodyRightDrawer from '../Layout/common/components/NotificationBodyRightDrawer';
import { closeRightDrawer } from '../Layout/common/rightDrawerSlice';
import { RIGHT_DRAWER_TYPES } from '../utils/globalConstantUtil';
import CalendarEventsBodyRightDrawer from '../Admin/Calendar/CalendarEventsBodyRightDrawer';

function RightSidebar() {
  const { isOpen, bodyType, extraObject, header } = useSelector(state => state.rightDrawer);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const close = (e) => {
    dispatch(closeRightDrawer(e));
  };

  const deleteAllNotifications = async () => {
    const config = {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      },
    };
    try {
      setLoading(true);
      await axios.delete(`${process.env.REACT_APP_API}/api/notifications`, config);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const getProfile = async () => {
    const config = {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      },
    };
    try {
      await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
    } catch (error) {}
  };

  useEffect(() => {
    getProfile();
    // eslint-disable-next-line
  }, []);

  return (
    <div
      className={
        "fixed inset-0 flex items-end md:items-center justify-end " +
        (isOpen
          ? "transition-opacity opacity-100 duration-500 z-50"
          : "transition-all delay-500 opacity-0 pointer-events-none")
      }
    >
      {/* Overlay - Lower z-index */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={close}
        aria-label="Close drawer overlay"
      ></div>

      {/* Drawer - Higher z-index */}
      <aside
        className={
          "w-full max-w-[95vw] sm:max-w-[400px] md:max-w-[430px] h-[90vh] md:h-full bg-white dark:bg-gray-900 shadow-2xl rounded-t-2xl md:rounded-l-2xl md:rounded-t-none flex flex-col transition-all duration-500 ease-in-out z-50 relative " +
          (isOpen ? "translate-x-0" : "translate-x-full")
        }
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
          borderLeft: "1px solid #f3f4f6",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button
              className="btn btn-circle btn-outline btn-sm border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={close}
              aria-label="Close"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <span className="ml-2 font-semibold text-lg md:text-xl tracking-wide text-[#df1f47]">{header}</span>
          </div>
          {header === "Notifications" && (
            <button
              className="btn btn-circle btn-outline btn-sm border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center"
              onClick={deleteAllNotifications}
              disabled={loading}
              aria-label="Delete All"
            >
              <TrashIcon className="h-5 w-5" />
              {loading && <span className="ml-2 text-xs">Deleting...</span>}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 bg-white dark:bg-gray-900 rounded-b-2xl md:rounded-bl-2xl relative z-10">
          <div className="flex flex-col w-full">
            {
              {
                [RIGHT_DRAWER_TYPES.NOTIFICATION]: (
                  <NotificationBodyRightDrawer {...extraObject} />
                ),
                [RIGHT_DRAWER_TYPES.CALENDAR_EVENTS]: (
                  <CalendarEventsBodyRightDrawer {...extraObject} closeRightDrawer={close} />
                ),
                [RIGHT_DRAWER_TYPES.DEFAULT]: <div></div>,
              }[bodyType]
            }
          </div>
        </div>
      </aside>
    </div>
  );
}

export default RightSidebar;