import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // Import useParams to get route params
import { ToastContainer, toast } from 'react-toastify'; // Importing toast
import 'react-toastify/dist/ReactToastify.css';
import TitleCard from "../../Layout/components/Cards/TitleCard"; // Import TitleCard
import SearchBar from "../../Layout/components/Input/SearchBar"; // Import SearchBar
import Header from "../../Layout/Header"; // Import Header
import LeftSidebar from "../../Layout/LeftSidebar"; // Import LeftSidebar
import RightSidebar from "../../Layout/RightSidebar"; // Import RightSidebar

const CalendarInterested = () => {
  const { id } = useParams(); // Get id from the URL (instead of eventId)
  const [users, setUsers] = useState([]); // State to hold all users
  const [filteredUsers, setFilteredUsers] = useState([]); // State to hold filtered users
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/all-users`);
        if (response.data && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
          setFilteredUsers(response.data.users); // Initially set filtered users to all users
          console.log('Fetched users:', response.data.users); // Log the fetched users
        } else {
          console.error('Data fetched is not an array:', response.data);
          setUsers([]);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error('Failed to fetch users', error);
        setUsers([]);
        setFilteredUsers([]);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchInterestedUsers = async () => {
      try {
        // Retrieve the token from session storage
        const token = sessionStorage.getItem('token');

        // Check if the token exists
        if (!token) {
          setError('No authorization token found.');
          setLoading(false);
          return;
        }

        // Set token in request headers
        const response = await axios.get(`${process.env.REACT_APP_API}/api/interested/${id}`, {
          headers: {
            Authorization: `Bearer ${token}` // Include token in the Authorization header
          }
        });

        const interestedUsers = response.data.interestedUsers;

        // Filter interested users based on all users data
        const matchedUsers = users.filter(user =>
          interestedUsers.some(interestedUser => interestedUser._id === user._id)
        );

        setFilteredUsers(matchedUsers);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch interested users');
        setLoading(false);
      }
    };

    if (users.length > 0) {
      fetchInterestedUsers();
    }
  }, [id, users]); // Run after users data is fetched

  const applySearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    const filtered = filteredUsers.filter(user =>
      user.fname.toLowerCase().includes(lowercasedValue) ||
      user.lname.toLowerCase().includes(lowercasedValue) ||
      user.email.toLowerCase().includes(lowercasedValue)
    );
    setFilteredUsers(filtered);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

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
                        <th>Address</th>
                        
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
                          <td>{user.address || 'N/A'}</td>
                          <td>
                           
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
