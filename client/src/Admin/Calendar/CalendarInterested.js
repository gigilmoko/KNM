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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="drawer lg:drawer-open">
      <ToastContainer />
      <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200">
          <TitleCard
            title="Users Interested in This Event"
            topMargin="mt-2"
            TopSideButtons={<SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} />}
          >
            <div>
              {filteredUsers.length > 0 ? (
                <div className="overflow-x-auto w-full">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Phone</th>
                        <th>Attendance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <div className="flex items-center space-x-3">
                              <div className="avatar">
                                <div className="mask mask-squircle w-12 h-12">
                                  <img src={user.avatar} alt={`${user.fname} ${user.lname}`} />
                                </div>
                              </div>
                              <div>
                                <div className="font-bold">{`${user.fname} ${user.middlei ? `${user.middlei}. ` : ''}${user.lname}`}</div>
                                <div className="text-sm opacity-50">{user.role}</div>
                              </div>
                            </div>
                          </td>
                          <td>{user.email}</td>
                          <td>{user.role}</td>
                          <td>{user.phone || 'N/A'}</td>
                          <td>
                            <button
                              className={`btn btn-sm ${user.isAttended ? 'btn-success' : 'btn-error'}`}
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
                <p>No users are interested in this event.</p>
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
