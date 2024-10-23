import React, { useState, useEffect } from 'react';
import XMarkIcon from '@heroicons/react/24/solid/XMarkIcon';
import TrashIcon from '@heroicons/react/24/solid/TrashIcon'; // Import TrashIcon from Heroicons
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import NotificationBodyRightDrawer from '../Layout/common/components/NotificationBodyRightDrawer';
import { closeRightDrawer } from '../Layout/common/rightDrawerSlice';
import { RIGHT_DRAWER_TYPES } from '../utils/globalConstantUtil';
import CalendarEventsBodyRightDrawer from '../Admin/Calendar/CalendarEventsBodyRightDrawer';

function RightSidebar() {
  const { isOpen, bodyType, extraObject, header } = useSelector(state => state.rightDrawer);
  const [loading, setLoading] = useState(false); // For delete action
  const [error, setError] = useState(null);
  const dispatch = useDispatch();

  // Function to close the drawer
  const close = (e) => {
    dispatch(closeRightDrawer(e));
  };

  // Function to delete all notifications
  const deleteAllNotifications = async () => {
    const config = {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`, // Using sessionStorage for token
      },
    };

    try {
      setLoading(true); // Start loading before the request
      await axios.delete(`${process.env.REACT_APP_API}/api/notifications`, config); // API call to delete notifications
      setLoading(false); // Stop loading after the request
      
    } catch (error) {
      setError('Failed to delete notifications.');
      setLoading(false); // Stop loading even in case of an error
      console.error(error);
    }
  };

  // Fetch profile data to authenticate user (getProfile method)
// Fetch profile data to authenticate user (getProfile method)
const getProfile = async () => {
  const config = {
    headers: {
      'Authorization': `Bearer ${sessionStorage.getItem('token')}`, // Using sessionStorage for token
    },
  };

  try {
    const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config); // Assuming `/api/me` returns user data
    if (data && data.user) {
      console.log('Fetched User ID:', data.user._id); // Log user ID to check if it's null or valid
      // Handle profile data (e.g., set user state or do something with the returned data)
    } else {
      console.log('User data is missing:', data);
    }
  } catch (error) {
    console.error('Failed to load profile:', error);
  }
};

  // Use effect to load profile on component mount
  useEffect(() => {
    getProfile(); // Call getProfile when component mounts
  }, []);

  return (
    <div
      className={
        "fixed overflow-hidden z-20 bg-gray-900 bg-opacity-25 inset-0 transform ease-in-out " +
        (isOpen
          ? "transition-opacity opacity-100 duration-500 translate-x-0 "
          : "transition-all delay-500 opacity-0 translate-x-full")
      }
    >
      <section
        className={
          "w-80 md:w-96 right-0 absolute bg-base-100 h-full shadow-xl delay-400 duration-500 ease-in-out transition-all transform " +
          (isOpen ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="relative pb-5 flex flex-col h-full">
          {/* Header */}
          <div className="navbar flex pl-4 pr-4 shadow-md justify-between">
            <div className="flex items-center">
              <button className="float-left btn btn-circle btn-outline btn-sm" onClick={() => close()}>
                <XMarkIcon className="h-5 w-5" />
              </button>
              <span className="ml-2 font-bold text-xl">{header}</span>
            </div>
            {/* Conditionally render trash icon if header is "Notifications" */}
            {header === "Notifications" && (
              <button className="btn btn-circle btn-outline btn-sm" onClick={deleteAllNotifications} disabled={loading}>
                <TrashIcon className="h-5 w-5" />
                {loading && <span className="ml-2">Deleting...</span>} {/* Optional loading indicator */}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="overflow-y-scroll pl-4 pr-4">
            <div className="flex flex-col w-full">
              {/* Loading drawer body according to different drawer type */}
              {
                {
                  [RIGHT_DRAWER_TYPES.NOTIFICATION]: <NotificationBodyRightDrawer {...extraObject} closeRightDrawer={close} />,
                  [RIGHT_DRAWER_TYPES.CALENDAR_EVENTS]: <CalendarEventsBodyRightDrawer {...extraObject} closeRightDrawer={close} />,
                  [RIGHT_DRAWER_TYPES.DEFAULT]: <div></div>,
                }[bodyType]
              }
            </div>
          </div>
        </div>
      </section>
      <section className="w-screen h-full cursor-pointer" onClick={() => close()}></section>
    </div>
  );
}

export default RightSidebar;
