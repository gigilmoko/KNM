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
import { toast, ToastContainer } from 'react-toastify';

function MembersConfirmation() {
    const dispatch = useDispatch();
    const { newNotificationMessage, newNotificationStatus, pageTitle } = useSelector(state => state.header);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const mainContentRef = useRef(null);

    // Confirmation modal state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [confirmAction, setConfirmAction] = useState(null); // { type: 'approve'|'deny', userId, index }

    useEffect(() => {
        mainContentRef.current?.scroll({
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
    }, [newNotificationMessage, newNotificationStatus, dispatch]);

    const fetchUsers = async () => {
        try {
            const token = sessionStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API}/api/fetchusermember`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data && Array.isArray(response.data.data)) {
                setUsers(response.data.data);
                setFilteredUsers(response.data.data);
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
            user.lname.toLowerCase().includes(lowercasedValue)
        );
        setFilteredUsers(filtered);
    };

    // Show confirmation modal before approving
    const confirmApprove = (userId, index) => {
        setConfirmAction({ type: 'approve', userId, index });
        setShowConfirmModal(true);
    };

    // Show confirmation modal before denying
    const confirmDeny = (userId, index) => {
        setConfirmAction({ type: 'deny', userId, index });
        setShowConfirmModal(true);
    };

    // Handle confirmation modal "Yes"
    const handleConfirmYes = async () => {
        if (!confirmAction) return;
        if (confirmAction.type === 'approve') {
            await handleApplyMember(confirmAction.userId, confirmAction.index);
        } else if (confirmAction.type === 'deny') {
            await handleDenyApplyMember(confirmAction.userId, confirmAction.index);
        }
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    // Handle confirmation modal "Cancel"
    const handleConfirmCancel = () => {
        setShowConfirmModal(false);
        setConfirmAction(null);
    };

    // Approve member and remove from list
    const handleApplyMember = async (id, index) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.put(`${process.env.REACT_APP_API}/api/users/approve-apply-member/${id}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('User approved as a member successfully!');
            // Remove from both lists
            const updatedUsers = users.filter((u, i) => u._id !== id);
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers.filter(user =>
                user.fname.toLowerCase().includes(searchText.toLowerCase()) ||
                user.lname.toLowerCase().includes(searchText.toLowerCase())
            ));
        } catch (error) {
            toast.error('Failed to approve member status');
        }
    };

    // Deny member and remove from list
    const handleDenyApplyMember = async (id, index) => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.put(`${process.env.REACT_APP_API}/api/users/deny-apply-member/${id}`, {}, 
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('User application denied successfully!');
            // Remove from both lists
            const updatedUsers = users.filter((u, i) => u._id !== id);
            setUsers(updatedUsers);
            setFilteredUsers(updatedUsers.filter(user =>
                user.fname.toLowerCase().includes(searchText.toLowerCase()) ||
                user.lname.toLowerCase().includes(searchText.toLowerCase())
            ));
        } catch (error) {
            toast.error('Failed to deny member status');
        }
    };

    return (
        <>
            <ToastContainer />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto pt-4 px-2 sm:px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard
                            title={<span className="text-[#ed003f] font-bold">Members Confirmation</span>}
                            topMargin="mt-2"
                            TopSideButtons={
                                <SearchBar searchText={searchText} styleClass="mr-0 sm:mr-4" setSearchText={setSearchText} />
                            }
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full min-w-[400px]">
                                    <thead>
                                        <tr>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Avatar</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Name</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Role</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Member ID</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length > 0 ? (
                                            filteredUsers.map((user, index) => (
                                                <tr key={user._id} className="hover:bg-[#fff0f4] transition">
                                                    <td>
                                                        <div className="avatar">
                                                            <div className="mask mask-squircle w-10 h-10 sm:w-12 sm:h-12">
                                                                <img
                                                                    src={user.avatar && user.avatar !== "default_avatar.png"
                                                                        ? user.avatar
                                                                        : "/noimage.png"}
                                                                    alt="Avatar"
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="font-bold text-xs sm:text-base">
                                                            {user.fname} {user.middlei ? `${user.middlei}. ` : ''}{user.lname}
                                                        </div>
                                                    </td>
                                                    <td className="text-xs sm:text-base">{user.role}</td>
                                                    <td className="text-xs sm:text-base">{user.memberId || 'N/A'}</td>
                                                    <td>
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <button
                                                                className="btn btn-sm bg-[#ed003f] text-white border-none font-bold hover:bg-red-700 transition"
                                                                onClick={() => confirmApprove(user._id, index)}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                className="btn btn-sm bg-[#ed003f] text-white border-none font-bold hover:bg-red-700 transition"
                                                                onClick={() => confirmDeny(user._id, index)}
                                                            >
                                                                Deny
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="text-center">No users found</td>
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

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
                        <h2 className="text-lg font-bold mb-4 text-[#ed003f]">
                            Confirm {confirmAction?.type === 'approve' ? 'Approval' : 'Denial'}
                        </h2>
                        <p className="mb-6">
                            Are you sure you want to {confirmAction?.type === 'approve' ? 'approve' : 'deny'} this member?
                        </p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="btn"
                                onClick={handleConfirmCancel}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition"
                                onClick={handleConfirmYes}
                            >
                                Yes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default MembersConfirmation;