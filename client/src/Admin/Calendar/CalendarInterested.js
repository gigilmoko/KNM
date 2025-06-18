import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TitleCard from "../../Layout/components/Cards/TitleCard";
import SearchBar from "../../Layout/components/Input/SearchBar";
import Header from "../../Layout/Header";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from "../../Layout/RightSidebar";

const CalendarInterested = () => {
  const { id } = useParams();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/all-users`);
        setUsers(response.data.users || []);
        setFilteredUsers(response.data.users || []);
      } catch (error) {
        setError('Failed to fetch users');
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchInterestedUsers = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) return setError('No authorization token found.');

        const response = await axios.get(`${process.env.REACT_APP_API}/api/interested/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const interestedUsers = response.data.interestedUsers;
        const matchedUsers = users.map(user => {
          const interestedUser = interestedUsers.find(iu => iu.userId === user._id);
          return interestedUser ? { ...user, isAttended: interestedUser.isAttended } : null;
        }).filter(Boolean);

        setFilteredUsers(matchedUsers);
        setLoading(false);
      } catch {
        setError('Failed to fetch interested users');
        setLoading(false);
      }
    };

    if (users.length > 0) {
      fetchInterestedUsers();
    }
  }, [id, users]);

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredUsers(users.filter(u => u.isAttended !== undefined));
    } else {
      const lower = searchText.toLowerCase();
      setFilteredUsers(
        users
          .filter(u => u.isAttended !== undefined)
          .filter(user =>
            `${user.fname} ${user.lname}`.toLowerCase().includes(lower) ||
            (user.email && user.email.toLowerCase().includes(lower)) ||
            (user.role && user.role.toLowerCase().includes(lower)) ||
            (user.phone && user.phone.toLowerCase().includes(lower))
          )
      );
    }
  }, [searchText, users]);

  const changeAttendance = async (userId, isAttended) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API}/api/event/change-attendance`,
        { userId, eventId: id, isAttended: !isAttended },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFilteredUsers(prevUsers =>
        prevUsers.map(user => user._id === userId ? { ...user, isAttended: !isAttended } : user)
      );
      toast.success(`Attendance status changed successfully.`);
    } catch {
      toast.error('Failed to change attendance status.');
    }
  };

  // if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="flex justify-center items-center h-64 text-red-600">{error}</div>;

  return (
    <div className="drawer lg:drawer-open">
      <ToastContainer />
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-base-200">
          <TitleCard
            title={<span className="text-[#ed003f] font-bold">Users Interested in This Event</span>}
            topMargin="mt-2"
            TopSideButtons={
              <SearchBar searchText={searchText} styleClass="mr-0 sm:mr-4" setSearchText={setSearchText} />
            }
          >
            <div>
              {filteredUsers.length > 0 ? (
                <div className="overflow-x-auto w-full">
                  <table className="table w-full min-w-[600px]">
                    <thead>
                      <tr>
                        <th className="text-[#ed003f] text-xs sm:text-sm">Name</th>
                        <th className="text-[#ed003f] text-xs sm:text-sm">Email</th>
                        <th className="text-[#ed003f] text-xs sm:text-sm">Role</th>
                        <th className="text-[#ed003f] text-xs sm:text-sm">Phone</th>
                        <th className="text-[#ed003f] text-xs sm:text-sm">Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-[#fff0f4] transition">
                          <td>
                            <div className="flex items-center space-x-3">
                              <div className="avatar">
                                <div className="mask mask-squircle w-10 h-10 sm:w-12 sm:h-12">
                                  <img src={user.avatar && user.avatar !== "default_avatar.png" ? user.avatar : "/noimage.png"} alt={`${user.fname} ${user.lname}`} />
                                </div>
                              </div>
                              <div>
                                <div className="font-bold text-xs sm:text-base">{`${user.fname} ${user.middlei ? `${user.middlei}. ` : ''}${user.lname}`}</div>
                                <div className="text-xs text-gray-400">{user.role}</div>
                              </div>
                            </div>
                          </td>
                          <td className="text-xs sm:text-base">{user.email}</td>
                          <td className="text-xs sm:text-base">{user.role}</td>
                          <td className="text-xs sm:text-base">{user.phone || 'N/A'}</td>
                          <td>
                            <button
                              className={`btn btn-xs sm:btn-sm font-bold border-none transition ${
                                user.isAttended
                                  ? 'bg-[#ed003f] text-white hover:bg-red-700'
                                  : 'bg-gray-200 text-[#ed003f] hover:bg-[#fff0f4]'
                              }`}
                              onClick={() => changeAttendance(user._id, user.isAttended)}
                            >
                              {user.isAttended ? 'Attended' : 'Did Not Attend'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">No users are interested in this event.</p>
              )}
            </div>
          </TitleCard>
          <div className="h-16"></div>
        </main>
      </div>
      <LeftSidebar />
      <RightSidebar />
    </div>
  );
};

export default CalendarInterested;