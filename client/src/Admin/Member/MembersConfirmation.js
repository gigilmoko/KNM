import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import { removeNotificationMessage } from "../../Layout/common/headerSlice";
import { NotificationContainer, NotificationManager } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from "../../Layout/Header";
import SearchBar from "../../Layout/components/Input/SearchBar";
import TitleCard from "../../Layout/components/Cards/TitleCard";


function MembersConfirmation() {
    const dispatch = useDispatch();
    const { newNotificationMessage, newNotificationStatus, pageTitle } = useSelector(state => state.header);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);

    useEffect(() => {
        mainContentRef.current.scroll({
            top: 0,
            behavior: "smooth"
        });

        fetchUsers();
    }, [pageTitle]);

    useEffect(() => {
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
            const response = await axios.get(`${process.env.REACT_APP_API}/api/fetchusermember`);
            if (response.data && Array.isArray(response.data.data)) {
                setUsers(response.data.data); // Access 'data' field from the response
                setFilteredUsers(response.data.data);
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
    
    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = users.filter(user =>
            user.fname.toLowerCase().includes(lowercasedValue) ||
            user.lname.toLowerCase().includes(lowercasedValue)
        );
        setFilteredUsers(filtered);
    };

    const handleApplyMember = async (id, index) => {
        console.log('Approve button clicked for user:', id);  // Debug log
        try {
            // Call the backend to approve the application and change role to 'member'
            await axios.put(`${process.env.REACT_APP_API}/api/users/approve-apply-member/${id}`);
            fetchUsers(); // Refresh the user list after approving
        } catch (error) {
            console.error('Failed to approve apply member status:', error);
            if (error.response) {
                console.error('Backend response error:', error.response.data);
            }
        }
    };
    
    const handleDenyApplyMember = async (id, index) => {
        console.log('Deny button clicked for user:', id);  // Debug log
        try {
            // Call the backend to deny the application (only update applyMember to false)
            await axios.put(`${process.env.REACT_APP_API}/api/users/deny-apply-member/${id}`);
            fetchUsers(); // Refresh the user list after denying
        } catch (error) {
            console.error('Failed to deny apply member status:', error);
            if (error.response) {
                console.error('Backend response error:', error.response.data);
            }
        }
    };
    
    

    return (
        <>
            <div className="drawer lg:drawer-open">
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
                                            <th>Avatar</th>
                                            <th>Name</th>
                                            <th>Role</th>
                                            <th>Member ID</th>
                                            <th>Apply Member</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user, index) => (
                                                <tr key={user._id}>
                                                    <td>
                                                        <div className="avatar">
                                                            <div className="mask mask-squircle w-12 h-12">
                                                                <img src={user.avatar} alt="Avatar" />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="font-bold">
                                                            {user.fname} {user.middlei ? `${user.middlei}. ` : ''}{user.lname}
                                                        </div>
                                                    </td>
                                                    <td>{user.role}</td>
                                                    <td>{user.memberId || 'N/A'}</td>
                                                    <td>{user.applyMember ? 'Yes' : 'No'}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-success btn-sm mr-2"
                                                            onClick={() => handleApplyMember(user._id, index)}
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleDenyApplyMember(user._id, index)}
                                                            style={{ backgroundColor: 'red', color: 'white' }}
                                                        >
                                                            Deny
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center">No users found</td>
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

export default MembersConfirmation;
