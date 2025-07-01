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
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { toast, ToastContainer } from 'react-toastify';

function RidersList() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
    const [riders, setRiders] = useState([]);
    const [filteredRiders, setFilteredRiders] = useState([]);
    const [searchText, setSearchText] = useState("");
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
            setRiders([]);
            setFilteredRiders([]);
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
            rider.email.toLowerCase().includes(lowercasedValue)
        );
        setFilteredRiders(filtered);
    };

    const handleCreateRider = () => {
        navigate('/admin/rider/new');
    };

    return (
        <>
            <div className="drawer lg:drawer-open">
                <ToastContainer />
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col min-h-screen">
                    <Header />
                    <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-2 sm:px-6 bg-base-200" ref={mainContentRef}>
                        <TitleCard
                            title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>All Riders</span>}
                            topMargin="mt-2"
                            TopSideButtons={
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                    <SearchBar
                                        searchText={searchText}
                                        styleClass="mr-0 sm:mr-4"
                                        setSearchText={setSearchText}
                                        inputProps={{
                                            style: { borderColor: '#ed003f', borderWidth: '2px' }
                                        }}
                                    />
                                    <button
                                        className="btn bg-[#ed003f] text-white font-bold border-none hover:bg-red-700 transition flex items-center gap-2"
                                        onClick={handleCreateRider}
                                    >
                                        <PlusIcon className="w-4 h-4" />
                                        New Rider
                                    </button>
                                </div>
                            }
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full text-xs sm:text-sm">
                                    <thead>
                                        <tr>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Name</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Email Id</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Phone</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Password</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Edit</th>
                                            <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredRiders.length > 0 ? (
                                            filteredRiders.map((rider, index) => (
                                                <tr key={rider._id}>
                                                    <td>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="avatar">
                                                                <div className="mask mask-squircle w-10 h-10 sm:w-12 sm:h-12 border-2 border-[#ed003f]">
                                                                    <img src={rider.avatar} alt="Avatar" />
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <div
                                                                    className="font-bold cursor-pointer text-[#ed003f] hover:underline"
                                                                    onClick={() => navigate(`/admin/rider/${rider._id}/history`)}
                                                                >
                                                                    {`${rider.fname} ${rider.middlei ? `${rider.middlei}. ` : ''}${rider.lname}`}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="break-all">{rider.email}</td>
                                                    <td>{rider.phone || 'N/A'}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-xs sm:btn-sm"
                                                            style={{
                                                                backgroundColor: 'transparent',
                                                                color: '#ed003f',
                                                                border: '1.5px solid #ed003f',
                                                                fontWeight: 'bold'
                                                            }}
                                                            onClick={() => navigate(`/admin/rider/changepassword/${rider._id}`)}
                                                        >
                                                            Change
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-square btn-ghost"
                                                            onClick={() => navigate(`/admin/rider/edit/${rider._id}`)}
                                                            title="Edit"
                                                        >
                                                            <PencilIcon className="w-5 h-5 text-[#ed003f]" />
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-square btn-ghost"
                                                            onClick={() => confirmDeleteRider(rider._id, index)}
                                                            title="Delete"
                                                        >
                                                            <TrashIcon className="w-5 h-5 text-[#ed003f]" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="text-center text-gray-500 py-8">
                                                    No riders found
                                                    {searchText && (
                                                        <div className="mt-2">
                                                            <button 
                                                                className="btn btn-sm bg-[#ed003f] text-white border-none hover:bg-red-700"
                                                                onClick={() => setSearchText("")}
                                                            >
                                                                Clear Search
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
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
                        <p className="mb-6">Are you sure you want to delete this rider?</p>
                        <div className="flex justify-end space-x-2">
                            <button
                                className="btn"
                                onClick={() => setShowDeleteModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn"
                                style={{ backgroundColor: '#ed003f', color: '#fff', border: 'none' }}
                                onClick={deleteCurrentRider}
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
export default RidersList;