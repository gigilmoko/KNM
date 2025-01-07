import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import moment from "moment";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import { removeNotificationMessage } from "../../Layout/common/headerSlice";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from "../../Layout/Header";
import SearchBar from "../../Layout/components/Input/SearchBar";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import TrashIcon from '@heroicons/react/24/outline/TrashIcon';
import { toast, ToastContainer } from 'react-toastify'; // Importing toast

function UsersList() {
    const dispatch = useDispatch();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        mainContentRef.current.scroll({
            top: 0,
            behavior: "smooth"
        });
        fetchUsers();
    }, []);

    useEffect(() => {
        getProfile();   
        applySearch(searchText);
    }, [searchText, users]);

    useEffect(() => {
        if (newNotificationMessage !== "") {
            if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
            if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
            dispatch(removeNotificationMessage());
        }
    }, [newNotificationMessage]);

    const fetchUsers = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API}/api/all-users`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data && Array.isArray(response.data.users)) {
                setUsers(response.data.users);
                setFilteredUsers(response.data.users);
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

    const deleteCurrentUser = async (id, index) => {
        try {
            const token = sessionStorage.getItem("token");
            // First, delete the user's associated images (if applicable)
            const deleteImagesResponse = await axios.delete(`${process.env.REACT_APP_API}/api/users/delete-images/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('Images deletion response:', deleteImagesResponse.data);
            
            // Now delete the user
            const deleteUserResponse = await axios.delete(`${process.env.REACT_APP_API}/api/user/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log('User deletion response:', deleteUserResponse.data);
            
            // Update state to remove the deleted user
            setUsers(users.filter((_, i) => i !== index));
            setFilteredUsers(filteredUsers.filter((_, i) => i !== index));
            
            // Show success toast
            toast.success('User and associated images deleted successfully!');
        } catch (error) {
            console.error('Failed to delete user or user images', error);
            // Show error toast
            toast.error('Failed to delete user or user images');
        }
    };
    
    

    const handleRoleChange = async (id, index, newRole) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.put(`${process.env.REACT_APP_API}/api/users/${id}`, { role: newRole }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            
            // Update users in the state
            const updatedUsers = [...users];
            updatedUsers[index].role = newRole;
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
            
            // Show success toast
            toast.success('User role updated successfully!');
        } catch (error) {
            console.error('Failed to update user role', error);
            // Show error toast
            toast.error('Failed to update user role');
        }
    };
    

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = users.filter(user => 
            user.fname.toLowerCase().includes(lowercasedValue) ||
            user.lname.toLowerCase().includes(lowercasedValue) ||
            user.email.toLowerCase().includes(lowercasedValue)
        );
        setFilteredUsers(filtered);
    };

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer/>
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard
                            title="All Users"
                            topMargin="mt-2"
                            TopSideButtons={<SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} />}
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Email Id</th>
                                            <th>Birthdate</th>
                                            <th>Role</th>
                                            <th>Phone</th>
                                            <th>Address</th>
                                            <th>Member ID</th>
                                            <th>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user, index) => (
                                                <tr key={user._id}>
                                                    <td>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="avatar">
                                                                <div className="mask mask-squircle w-12 h-12">
                                                                    <img src={user.avatar} alt="Avatar" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold">{`${user.fname} ${user.middlei ? `${user.middlei}. ` : ''}${user.lname}`}</div>
                                                                <div className="text-sm opacity-50">{user.role}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>{user.email}</td>
                                                    <td>{moment(user.dateOfBirth).format("DD MMM YY")}</td>
                                                    <td>
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => handleRoleChange(user._id, index, e.target.value)}
                                                            className="select select-bordered w-full max-w-xs"
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                            <option value="member">Member</option>
                                                        </select>
                                                    </td>
                                                    <td>{user.phone || 'N/A'}</td>
                                                    <td>{user.address || 'N/A'}</td>
                                                    <td>{user.memberId || 'N/A'}</td>
                                                    <td>
                                                        <button className="btn btn-square btn-ghost" onClick={() => deleteCurrentUser(user._id, index)} >
                                                            <TrashIcon className="w-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="8" className="text-center">No users found</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </TitleCard>
                        <div className="h-16"></div>
                    </main>
                </div>
                <LeftSidebar />
            </div>
            <RightSidebar />
            <NotificationContainer />
            <ModalLayout />
        </>
    );
}

export default UsersList;
