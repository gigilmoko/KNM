import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from "react-router-dom";
import axios from 'axios';
import Header from "../../Layout/Header";
import LeftSidebar from "../../Layout/LeftSidebar";
import { toast, ToastContainer } from 'react-toastify';
import moment from 'moment';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowLeftIcon,
  ShareIcon,
  BellIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  PauseIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const CalendarInfo = () => {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [user, setUser] = useState(null);
  const [isInterested, setIsInterested] = useState(false);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [attendedUsers, setAttendedUsers] = useState([]);
  const [showManageUsers, setShowManageUsers] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/calendar/event/${id}`);
        if (response.data && response.data.success) {
          setEventData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      }
    };

    const getProfile = async () => {
      const config = {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      };
      try {
        const { data } = await axios.get(`${process.env.REACT_APP_API}/api/me`, config);
        setUser(data.user);
        
        try {
          const interestResponse = await axios.get(`${process.env.REACT_APP_API}/api/interested/${data.user._id}/${id}`, config);
          if (interestResponse.data && interestResponse.data.interest) {
            setIsInterested(interestResponse.data.interest.interested);
          }
        } catch (interestError) {
          setIsInterested(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const fetchInterestedUsers = async () => {
      try {
        const config = {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        };
        const response = await axios.get(`${process.env.REACT_APP_API}/api/interested/${id}`, config);
        if (response.data && response.data.interestedUsers) {
          const users = response.data.interestedUsers;
          setInterestedUsers(users);
          setAttendedUsers(users.filter(user => user.isAttended));
        }
      } catch (error) {
        console.error('Error fetching interested users:', error);
      }
    };

    fetchEvent();
    getProfile();
    fetchInterestedUsers();
    setLoading(false);
  }, [id]);

  const isEventPassed = () => {
    if (!eventData) return false;
    return moment().isAfter(moment(eventData.endDate));
  };

  const isEventOngoing = () => {
    if (!eventData) return false;
    return moment().isBetween(moment(eventData.startDate), moment(eventData.endDate));
  };

  const getEventStatus = () => {
    if (!eventData) return { status: 'loading', color: 'bg-gray-100 text-gray-700', text: 'Loading...' };
    
    const now = moment();
    const start = moment(eventData.startDate);
    const end = moment(eventData.endDate);

    if (now.isBefore(start)) {
      return { status: 'upcoming', color: 'bg-[#ed003f] text-white', text: 'Upcoming' };
    } else if (now.isBetween(start, end)) {
      return { status: 'ongoing', color: 'bg-[#ed003f] text-white animate-pulse', text: 'Live Now' };
    } else {
      return { status: 'completed', color: 'bg-gray-500 text-white', text: 'Completed' };
    }
  };

  const handleGetNotified = async () => {
    if (!user) {
      toast.error('Please log in to show interest in this event.');
      return;
    }

    if (isEventPassed()) {
      toast.error('This event has already ended.');
      return;
    }

    const notificationData = {
      userId: user._id,
      eventId: id,
      interested: true,
    };

    try {
      const config = {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      };
      const response = await axios.post(`${process.env.REACT_APP_API}/api/interested`, notificationData, config);
      if (response.data && response.data.success) {
        toast.success('You will be notified about this event!');
        setIsInterested(true);
        
        const updatedResponse = await axios.get(`${process.env.REACT_APP_API}/api/interested/${id}`, config);
        if (updatedResponse.data && updatedResponse.data.interestedUsers) {
          setInterestedUsers(updatedResponse.data.interestedUsers);
        }
      } else {
        toast.error('Failed to express interest in the event.');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('An error occurred while trying to notify you.');
      }
    }
  };

  const changeAttendance = async (userId, currentAttendance) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API}/api/event/change-attendance`,
        { userId, eventId: id, isAttended: !currentAttendance },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInterestedUsers(prevUsers =>
        prevUsers.map(user => 
          user.userId === userId 
            ? { ...user, isAttended: !currentAttendance }
            : user
        )
      );
      
      setAttendedUsers(prevAttended => {
        const updatedUsers = interestedUsers.map(user => 
          user.userId === userId 
            ? { ...user, isAttended: !currentAttendance }
            : user
        );
        return updatedUsers.filter(user => user.isAttended);
      });
      
      toast.success('Attendance status updated successfully.');
    } catch (error) {
      toast.error('Failed to update attendance status.');
    }
  };

  const eventStatus = getEventStatus();

  if (loading) {
    return (
      <div className="drawer lg:drawer-open">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-gray-50">
            <div className="flex justify-center items-center h-64">
              <div className="loading loading-spinner loading-lg text-[#ed003f]"></div>
            </div>
          </main>
        </div>
        <LeftSidebar />
      </div>
    );
  }

  return (
    <div className="drawer lg:drawer-open">
      <ToastContainer />
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50">
          {eventData ? (
            <>
              {/* Hero Section */}
              <div className="relative h-[50vh] min-h-[350px] overflow-hidden">
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${eventData.image || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop'})`,
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/70"></div>
                </div>
                
                {/* Navigation Controls */}
                <div className="absolute top-4 left-4 z-20">
                  <button
                    onClick={() => navigate(-1)}
                    className="bg-white/15 backdrop-blur-sm text-white p-2 rounded-md hover:bg-white/25 transition-all duration-300"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                  </button>
                </div>

                <div className="absolute top-4 right-4 z-20">
                  <button className="bg-white/15 backdrop-blur-sm text-white p-2 rounded-md hover:bg-white/25 transition-all duration-300">
                    <ShareIcon className="w-5 h-5" />
                  </button>
                </div>

                {/* Hero Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-md text-sm font-medium ${eventStatus.color}`}>
                        {eventStatus.text}
                      </span>
                      {isEventOngoing() && (
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          <span className="text-sm">Live</span>
                        </div>
                      )}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">{eventData.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-base">
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-md">
                        <CalendarIcon className="w-4 h-4" />
                        <span>{moment(eventData.startDate).format("MMM DD, YYYY")}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-md">
                        <ClockIcon className="w-4 h-4" />
                        <span>{moment(eventData.startDate).format("h:mm A")}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-md">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{eventData.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  
                  {/* Content Area */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white p-5 text-center border-l-4 border-[#ed003f] shadow-sm hover:shadow-md transition-all duration-300">
                        <UserGroupIcon className="w-7 h-7 text-[#ed003f] mx-auto mb-2" />
                        <div className="text-xl font-bold text-gray-900">{interestedUsers.length}</div>
                        <div className="text-sm text-gray-600">Interested</div>
                      </div>
                      <div className="bg-white p-5 text-center border-l-4 border-[#ed003f] shadow-sm hover:shadow-md transition-all duration-300">
                        <CheckCircleIcon className="w-7 h-7 text-[#ed003f] mx-auto mb-2" />
                        <div className="text-xl font-bold text-gray-900">{attendedUsers.length}</div>
                        <div className="text-sm text-gray-600">Attended</div>
                      </div>
                      <div className="bg-white p-5 text-center border-l-4 border-[#ed003f] shadow-sm hover:shadow-md transition-all duration-300">
                        <ClockIcon className="w-7 h-7 text-[#ed003f] mx-auto mb-2" />
                        <div className="text-sm font-bold text-gray-900">
                          {moment.duration(moment(eventData.endDate).diff(moment(eventData.startDate))).humanize()}
                        </div>
                        <div className="text-sm text-gray-600">Duration</div>
                      </div>
                      <div className="bg-white p-5 text-center border-l-4 border-[#ed003f] shadow-sm hover:shadow-md transition-all duration-300">
                        <UserGroupIcon className="w-7 h-7 text-[#ed003f] mx-auto mb-2" />
                        <div className="text-sm font-bold text-gray-900">
                          {eventData.audience === "all" ? "Everyone" : "Members"}
                        </div>
                        <div className="text-sm text-gray-600">Audience</div>
                      </div>
                    </div>

                    {/* Tabs */}
                    <div className="bg-white shadow-sm rounded-md overflow-hidden">
                      <div className="flex border-b border-gray-200">
                        <button
                          onClick={() => setActiveTab('about')}
                          className={`flex-1 px-6 py-3 text-sm font-medium transition-all duration-300 ${
                            activeTab === 'about' 
                              ? 'bg-[#ed003f] text-white' 
                              : 'text-gray-700 hover:text-[#ed003f] hover:bg-gray-50'
                          }`}
                        >
                          About Event
                        </button>
                        <button
                          onClick={() => setActiveTab('timeline')}
                          className={`flex-1 px-6 py-3 text-sm font-medium transition-all duration-300 ${
                            activeTab === 'timeline' 
                              ? 'bg-[#ed003f] text-white' 
                              : 'text-gray-700 hover:text-[#ed003f] hover:bg-gray-50'
                          }`}
                        >
                          Timeline
                        </button>
                        {user && user.role === "admin" && (
                          <button
                            onClick={() => setActiveTab('manage')}
                            className={`flex-1 px-6 py-3 text-sm font-medium transition-all duration-300 ${
                              activeTab === 'manage' 
                                ? 'bg-[#ed003f] text-white' 
                                : 'text-gray-700 hover:text-[#ed003f] hover:bg-gray-50'
                            }`}
                          >
                            Manage Attendees
                          </button>
                        )}
                      </div>

                      <div className="p-6">
                        {activeTab === 'about' && (
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 mb-4">About This Event</h2>
                            <div className="text-gray-700 leading-relaxed">
                              {eventData.description}
                            </div>
                          </div>
                        )}

                        {activeTab === 'timeline' && (
                          <div className="space-y-4">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Event Timeline</h2>
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-4 bg-gray-50 border-l-4 border-[#ed003f] rounded-md">
                                <div className="w-10 h-10 bg-[#ed003f] text-white flex items-center justify-center rounded-md">
                                  <PlayIcon className="w-5 h-5" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">Event Starts</h3>
                                  <p className="text-gray-600 text-sm">{moment(eventData.startDate).format("MMMM DD, YYYY • h:mm A")}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3 p-4 bg-gray-50 border-l-4 border-[#ed003f] rounded-md">
                                <div className="w-10 h-10 bg-[#ed003f] text-white flex items-center justify-center rounded-md">
                                  <PauseIcon className="w-5 h-5" />
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">Event Ends</h3>
                                  <p className="text-gray-600 text-sm">{moment(eventData.endDate).format("MMMM DD, YYYY • h:mm A")}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === 'manage' && user && user.role === "admin" && (
                          <div>
                            <div className="flex items-center justify-between mb-6">
                              <h2 className="text-xl font-bold text-gray-900">Manage Attendees</h2>
                              <span className="bg-[#ed003f] text-white px-3 py-1 text-sm font-medium rounded-md">
                                {interestedUsers.length} Total
                              </span>
                            </div>
                            {interestedUsers.length > 0 ? (
                              <div className="space-y-3">
                                {interestedUsers.map((interestedUser, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors rounded-md border border-gray-200">
                                    <div className="flex items-center gap-3">
                                      <img
                                        src={interestedUser.avatar && interestedUser.avatar !== "default_avatar.png" 
                                          ? interestedUser.avatar 
                                          : "/noimage.png"
                                        }
                                        alt={`${interestedUser.fname} ${interestedUser.lname}`}
                                        className="w-10 h-10 object-cover rounded-md border-2 border-gray-300"
                                      />
                                      <div>
                                        <p className="font-semibold text-gray-900 text-sm">
                                          {interestedUser.fname} {interestedUser.lname}
                                        </p>
                                        <p className="text-xs text-gray-600">{interestedUser.email}</p>
                                      </div>
                                    </div>
                                    
                                    <button
                                      onClick={() => changeAttendance(interestedUser.userId, interestedUser.isAttended)}
                                      className={`px-3 py-1 text-sm font-medium transition-colors rounded-md flex items-center gap-2 ${
                                        interestedUser.isAttended
                                          ? 'bg-[#ed003f] text-white hover:bg-[#d1002f]'
                                          : 'bg-white text-gray-700 border border-gray-300 hover:border-[#ed003f] hover:text-[#ed003f]'
                                      }`}
                                    >
                                      {interestedUser.isAttended ? (
                                        <>
                                          <CheckCircleSolid className="w-4 h-4" />
                                          Attended
                                        </>
                                      ) : (
                                        <>
                                          <XCircleIcon className="w-4 h-4" />
                                          Mark Attended
                                        </>
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <UserGroupIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600">No users interested yet</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="lg:col-span-1 space-y-6">
                    {/* Action Card */}
                    <div className="bg-white p-6 shadow-sm rounded-md border-t-4 border-[#ed003f] sticky top-4">
                      <div className="space-y-3">
                        <button
                          onClick={handleGetNotified}
                          className={`w-full py-3 text-base font-medium transition-colors rounded-md flex items-center justify-center gap-2 ${
                            isInterested || isEventPassed()
                              ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                              : 'bg-[#ed003f] text-white hover:bg-[#d1002f]'
                          }`}
                          disabled={isInterested || isEventPassed()}
                        >
                          {isEventPassed() ? (
                            <>
                              <XCircleIcon className="w-5 h-5" />
                              Event Has Ended
                            </>
                          ) : isInterested ? (
                            <>
                              <HeartSolidIcon className="w-5 h-5" />
                              Already Interested
                            </>
                          ) : (
                            <>
                              <BellIcon className="w-5 h-5" />
                              Get Notified
                            </>
                          )}
                        </button>

                        {user && user.role === "admin" && (
                          <button
                            onClick={() => setActiveTab('manage')}
                            className="w-full py-3 text-base font-medium bg-white text-gray-700 border border-gray-300 hover:border-[#ed003f] hover:text-[#ed003f] transition-colors rounded-md flex items-center justify-center gap-2"
                          >
                            <EyeIcon className="w-5 h-5" />
                            Manage Attendees
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Interested Users */}
                    <div className="bg-white p-5 shadow-sm rounded-md border-t-4 border-[#ed003f]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Interested People</h3>
                        <span className="bg-[#ed003f] text-white px-2 py-1 text-sm font-medium rounded-md">
                          {interestedUsers.length}
                        </span>
                      </div>

                      {interestedUsers.length > 0 ? (
                        <div className="space-y-3 max-h-80 overflow-y-auto">
                          {interestedUsers.slice(0, 8).map((interestedUser, index) => (
                            <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 transition-colors rounded-md">
                              <img
                                src={interestedUser.avatar && interestedUser.avatar !== "default_avatar.png" 
                                  ? interestedUser.avatar 
                                  : "/noimage.png"
                                }
                                alt={`${interestedUser.fname} ${interestedUser.lname}`}
                                className="w-8 h-8 object-cover rounded-md border border-gray-300"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate">
                                  {interestedUser.fname} {interestedUser.lname}
                                </p>
                                <p className="text-xs text-gray-600 truncate">{interestedUser.email}</p>
                              </div>
                              
                              {interestedUser.isAttended && (
                                <CheckCircleSolid className="w-4 h-4 text-[#ed003f] flex-shrink-0" />
                              )}
                            </div>
                          ))}
                          
                          {interestedUsers.length > 8 && (
                            <p className="text-center text-sm text-gray-600 pt-2 border-t border-gray-200">
                              +{interestedUsers.length - 8} more interested
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <UserGroupIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600 text-sm">No one has shown interest yet</p>
                          <p className="text-xs text-gray-500">Be the first to get notified!</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-lg text-gray-500">Event not found</p>
            </div>
          )}
        </main>
      </div>
      <LeftSidebar />
    </div>
  );
};

export default CalendarInfo;