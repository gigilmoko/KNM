import React, { useEffect, useState, useRef } from "react";
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
import { toast, ToastContainer } from 'react-toastify';

function UsersList() {
    const dispatch = useDispatch();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [sortByDate, setSortByDate] = useState('desc');
    const mainContentRef = useRef(null);

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [userToDeleteIndex, setUserToDeleteIndex] = useState(null);

    useEffect(() => {
        mainContentRef.current?.scroll({
            top: 0,
            behavior: "smooth"
        });
        fetchUsers();
    }, []);

    useEffect(() => {
        applySearch(searchText);
    }, [searchText, users]);

    useEffect(() => {
        if (newNotificationMessage !== "") {
            if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
            if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
            dispatch(removeNotificationMessage());
        }
    }, [newNotificationMessage, newNotificationStatus, dispatch]);

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
            } else {
                setUsers([]);
                setFilteredUsers([]);
            }
        } catch (error) {
            setUsers([]);
            setFilteredUsers([]);
        }
    };

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = users.filter(user =>
            user.fname.toLowerCase().includes(lowercasedValue) ||
            user.lname.toLowerCase().includes(lowercasedValue) ||
            (user.email && user.email.toLowerCase().includes(lowercasedValue)) ||
            (user.memberId && user.memberId.toLowerCase().includes(lowercasedValue))
        );
        setFilteredUsers(filtered);
    };

    const toggleSortByDate = () => {
        const sortedUsers = [...filteredUsers].sort((a, b) =>
            sortByDate === 'desc'
                ? new Date(b.createdAt) - new Date(a.createdAt)
                : new Date(a.createdAt) - new Date(b.createdAt)
        );
        setFilteredUsers(sortedUsers);
        setSortByDate(sortByDate === 'desc' ? 'asc' : 'desc');
    };

    // Open confirmation modal before deleting
    const confirmDeleteUser = (id, index) => {
        setUserToDelete(id);
        setUserToDeleteIndex(index);
        setShowDeleteModal(true);
    };

    // Actual delete logic
    const deleteCurrentUser = async () => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_API}/api/users/delete-images/${userToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            await axios.delete(`${process.env.REACT_APP_API}/api/user/${userToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUsers(users.filter((_, i) => i !== userToDeleteIndex));
            setFilteredUsers(filteredUsers.filter((_, i) => i !== userToDeleteIndex));
            toast.success('User and associated images deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete user or user images');
        }
        setShowDeleteModal(false);
        setUserToDelete(null);
        setUserToDeleteIndex(null);
    };

    const handleRoleChange = async (id, index, newRole) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.put(`${process.env.REACT_APP_API}/api/users/${id}`, { role: newRole }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const updatedUsers = [...users];
            updatedUsers[index].role = newRole;
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers);
            toast.success('User role updated successfully!');
        } catch (error) {
            toast.error('Failed to update user role');
        }
    };

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer />
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard
                            title={<span className="text-[#ed003f] font-bold">All Users</span>}
                            topMargin="mt-2"
                            TopSideButtons={
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                    <SearchBar searchText={searchText} styleClass="mr-0 sm:mr-4" setSearchText={setSearchText} />
                                    <button
                                        className="btn bg-[#ed003f] text-white font-bold border-none hover:bg-red-700 transition"
                                        onClick={toggleSortByDate}
                                    >
                                        {sortByDate === 'desc' ? 'Sort by Date Ascending' : 'Sort by Date Descending'}
                                    </button>
                                </div>
                            }
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full min-w-[600px]">
                                    <thead>
                                        <tr>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">User</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Email</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Date of Birth</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Role</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Phone</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Address</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Member ID</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user, index) => (
                                                <tr key={user._id} className="hover:bg-[#fff0f4] transition">
                                                    <td>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="avatar">
                                                                <div className="mask mask-squircle w-10 h-10 sm:w-12 sm:h-12">
                                                                    <img src={user.avatar} alt="Avatar" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-sm sm:text-base">{`${user.fname} ${user.middlei ? `${user.middlei}. ` : ''}${user.lname}`}</div>
                                                                <div className="text-xs opacity-50">{user.role}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-xs sm:text-sm">{user.email}</td>
                                                    <td className="text-xs sm:text-sm">{moment(user.dateOfBirth).format("DD MMM YY")}</td>
                                                    <td>
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => handleRoleChange(user._id, index, e.target.value)}
                                                            className="select select-bordered w-full max-w-xs text-xs sm:text-sm"
                                                        >
                                                            <option value="user">User</option>
                                                            <option value="admin">Admin</option>
                                                            <option value="member">Member</option>
                                                        </select>
                                                    </td>
                                                    <td className="text-xs sm:text-sm">{user.phone || 'N/A'}</td>
                                                    <td className="text-xs sm:text-sm">
                                                        {Array.isArray(user.deliveryAddress) && user.deliveryAddress.length > 0 ? (
                                                            user.deliveryAddress.map((addr, idx) => (
                                                                <div key={idx}>
                                                                    {`${addr.houseNo}, ${addr.streetName}, ${addr.barangay}, ${addr.city}`}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div>
                                                                {user.address && typeof user.address === 'object' ? (
                                                                    `${user.address.houseNo}, ${user.address.streetName}, ${user.address.barangay}, ${user.address.city}`
                                                                ) : (
                                                                    user.address
                                                                )}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="text-xs sm:text-sm">{user.memberId || 'N/A'}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-square btn-ghost border border-[#ed003f] hover:bg-[#fff0f4] transition"
                                                            onClick={() => confirmDeleteUser(user._id, index)}
                                                            style={{ color: "#ed003f", background: 'transparent' }}
                                                        >
                                                            <TrashIcon className="w-5 h-5 text-[#ed003f]" />
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

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-4 text-[#ed003f]">Confirm Deletion</h2>
                        <p className="mb-6">Are you sure you want to delete this user?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="btn"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition"
                                onClick={deleteCurrentUser}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default UsersList;