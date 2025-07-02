import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';

function RidersList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [riders, setRiders] = useState([]);
    const [filteredRiders, setFilteredRiders] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [loading, setLoading] = useState(true);
    const mainContentRef = useRef(null);

    // Modal state for delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [riderToDelete, setRiderToDelete] = useState(null);
    const [riderToDeleteIndex, setRiderToDeleteIndex] = useState(null);

    useEffect(() => {
        mainContentRef.current?.scroll({
            top: 0,
            behavior: "smooth"
        });
        fetchRiders();
    }, []);

    useEffect(() => {
        applySearch(searchText);
    }, [searchText, riders]);

    useEffect(() => {
        if (newNotificationMessage !== "") {
            if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
            if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
            dispatch(removeNotificationMessage());
        }
    }, [newNotificationMessage]);

    const fetchRiders = async () => {
        try {
            setLoading(true);
            const token = sessionStorage.getItem("token");
            const response = await axios.get(`${process.env.REACT_APP_API}/api/riders`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.data && Array.isArray(response.data.riders)) {
                setRiders(response.data.riders);
                setFilteredRiders(response.data.riders);
            } else {
                setRiders([]);
                setFilteredRiders([]);
            }
        } catch (error) {
            console.error('Error fetching riders:', error);
            toast.error('Failed to load riders');
            setRiders([]);
            setFilteredRiders([]);
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteRider = (id, index) => {
        setRiderToDelete(id);
        setRiderToDeleteIndex(index);
        setShowDeleteModal(true);
    };

    const deleteCurrentRider = async () => {
        try {
            const token = sessionStorage.getItem("token");
            await axios.delete(`${process.env.REACT_APP_API}/api/rider/delete/${riderToDelete}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setRiders(riders.filter((_, i) => i !== riderToDeleteIndex));
            setFilteredRiders(filteredRiders.filter((_, i) => i !== riderToDeleteIndex));
            toast.success('Rider deleted successfully!');
        } catch (error) {
            console.error('Error deleting rider:', error);
            toast.error('Failed to delete rider');
        }
        setShowDeleteModal(false);
        setRiderToDelete(null);
        setRiderToDeleteIndex(null);
    };

    const applySearch = (value) => {
        const lowercasedValue = value.toLowerCase();
        const filtered = riders.filter(rider =>
            rider.fname.toLowerCase().includes(lowercasedValue) ||
            rider.lname.toLowerCase().includes(lowercasedValue) ||
            rider.email.toLowerCase().includes(lowercasedValue) ||
            rider.phone?.toLowerCase().includes(lowercasedValue)
        );
        setFilteredRiders(filtered);
    };

    const handleCreateRider = () => {
        navigate('/admin/rider/new');
    };

    const handleViewHistory = (riderId) => {
        navigate(`/admin/rider/${riderId}/history`);
    };

    const handleEditRider = (riderId) => {
        navigate(`/admin/rider/edit/${riderId}`);
    };

    const handleChangePassword = (riderId) => {
        navigate(`/admin/rider/changepassword/${riderId}`);
    };

    return (
        <>
            <ToastContainer position="top-right" />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto pt-4 px-4 sm:px-6 bg-base-200" ref={mainContentRef}>
                        <div className="max-w-7xl mx-auto">
                            {/* Header Section */}
                            <div className="mb-6">
                                <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-[#ed003f]">
                                    <h1 className="text-3xl font-bold text-[#ed003f] mb-2">Delivery Riders</h1>
                                    <p className="text-gray-600">Manage your delivery team and track their history</p>
                                </div>
                            </div>

                            {/* Main Content */}
                            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                {/* Header Controls */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">All Riders</h2>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {loading ? 'Loading...' : `${filteredRiders.length} of ${riders.length} riders`}
                                            </p>
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                            <div className="flex-1 lg:flex-none lg:w-80">
                                                <SearchBar
                                                    searchText={searchText}
                                                    setSearchText={setSearchText}
                                                    styleClass="w-full"
                                                    inputProps={{
                                                        placeholder: "Search riders by name, email, or phone...",
                                                        className: "input input-bordered w-full focus:ring-2 focus:ring-[#ed003f] focus:border-[#ed003f]"
                                                    }}
                                                />
                                            </div>
                                            <button
                                                className="btn bg-[#ed003f] text-white border-none hover:bg-red-700 transition-colors flex items-center gap-2"
                                                onClick={handleCreateRider}
                                            >
                                                <PlusIcon className="w-4 h-4" />
                                                Add New Rider
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Table Content */}
                                <div className="overflow-x-auto">
                                    {loading ? (
                                        <div className="flex justify-center items-center py-12">
                                            <div className="flex items-center gap-3">
                                                <div className="loading loading-spinner loading-md text-[#ed003f]"></div>
                                                <span className="text-gray-600">Loading riders...</span>
                                            </div>
                                        </div>
                                    ) : filteredRiders.length > 0 ? (
                                        <table className="table w-full">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="text-[#ed003f] font-semibold text-sm text-left">Rider</th>
                                                    <th className="text-[#ed003f] font-semibold text-sm text-center">Contact Info</th>
                                                    <th className="text-[#ed003f] font-semibold text-sm text-center">Password</th>
                                                    <th className="text-[#ed003f] font-semibold text-sm text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredRiders.map((rider, index) => (
                                                    <tr key={rider._id} className="hover:bg-gray-50 transition-colors">
                                                        {/* Rider Info */}
                                                        <td className="text-left">
                                                            <div className="flex items-center gap-4">
                                                                <div className="avatar">
                                                                    <div className="w-12 h-12 rounded-full ring-2 ring-[#ed003f] ring-offset-2">
                                                                        <img 
                                                                            src={rider.avatar || 'https://via.placeholder.com/48'} 
                                                                            alt="Avatar"
                                                                            className="w-full h-full object-cover rounded-full"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <div className="font-semibold text-gray-900">
                                                                        {`${rider.fname} ${rider.middlei ? `${rider.middlei}. ` : ''}${rider.lname}`}
                                                                    </div>
                                                                    <div className="text-sm text-gray-500">
                                                                        ID: {rider._id.slice(-6).toUpperCase()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Contact Info */}
                                                        <td className="text-center">
                                                            <div className="space-y-1">
                                                                <div className="text-sm text-gray-900">{rider.email}</div>
                                                                <div className="text-sm text-gray-500">{rider.phone || 'No phone'}</div>
                                                            </div>
                                                        </td>

                                                        {/* Password Actions */}
                                                        <td className="text-center">
                                                            <button
                                                                className="btn btn-sm bg-white text-[#ed003f] border-[#ed003f] hover:bg-[#ed003f] hover:text-white transition-colors"
                                                                onClick={() => handleChangePassword(rider._id)}
                                                            >
                                                                Change Password
                                                            </button>
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="text-center">
                                                            <div className="flex items-center justify-center gap-2">
                                                                <button
                                                                    className="btn btn-sm btn-ghost text-blue-600 hover:bg-blue-50 tooltip"
                                                                    data-tip="View History"
                                                                    onClick={() => handleViewHistory(rider._id)}
                                                                >
                                                                    <ClockIcon className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-ghost text-green-600 hover:bg-green-50 tooltip"
                                                                    data-tip="Edit Rider"
                                                                    onClick={() => handleEditRider(rider._id)}
                                                                >
                                                                    <PencilIcon className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    className="btn btn-sm btn-ghost text-red-600 hover:bg-red-50 tooltip"
                                                                    data-tip="Delete Rider"
                                                                    onClick={() => confirmDeleteRider(rider._id, index)}
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center py-16">
                                            <div className="max-w-md mx-auto">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <PlusIcon className="w-8 h-8 text-gray-400" />
                                                </div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    {searchText ? 'No riders found' : 'No riders yet'}
                                                </h3>
                                                <p className="text-gray-600 mb-6">
                                                    {searchText ? 
                                                        "Try adjusting your search terms" : 
                                                        "Get started by adding your first delivery rider"
                                                    }
                                                </p>
                                                {searchText ? (
                                                    <button
                                                        className="btn bg-gray-100 text-gray-700 border-none hover:bg-gray-200"
                                                        onClick={() => setSearchText("")}
                                                    >
                                                        Clear Search
                                                    </button>
                                                ) : (
                                                    <button
                                                        className="btn bg-[#ed003f] text-white border-none hover:bg-red-700"
                                                        onClick={handleCreateRider}
                                                    >
                                                        <PlusIcon className="w-4 h-4 mr-2" />
                                                        Add First Rider
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="h-16"></div>
                    </main>
                </div>
                <LeftSidebar />
            </div>
            <RightSidebar />
            <NotificationContainer />
            <ModalLayout />

            {/* Modern Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <TrashIcon className="w-6 h-6 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">Delete Rider</h3>
                                    <p className="text-sm text-gray-600">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-gray-700 mb-6">
                                Are you sure you want to delete this rider? All associated data will be permanently removed.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    className="btn bg-gray-100 text-gray-700 border-none hover:bg-gray-200"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn bg-red-600 text-white border-none hover:bg-red-700"
                                    onClick={deleteCurrentRider}
                                >
                                    Delete Rider
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default RidersList;