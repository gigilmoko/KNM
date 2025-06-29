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
import { toast, ToastContainer } from 'react-toastify';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import moment from "moment";

function DeliveryList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [searchText, setSearchText] = useState("");
  const mainContentRef = useRef(null);
  const [selectedStatus, setSelectedStatus] = useState('Ongoing');
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  useEffect(() => {
    mainContentRef.current?.scroll({ top: 0, behavior: "smooth" });
    fetchDeliveries();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    applySearch(searchText);
    // eslint-disable-next-line
  }, [searchText, deliveries, selectedStatus, sortOrder]);

  useEffect(() => {
    if (newNotificationMessage !== "") {
      if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
      if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
      dispatch(removeNotificationMessage());
    }
  }, [newNotificationMessage]);

  const fetchDeliveries = async () => {
  setLoading(true);
  try {
    const token = sessionStorage.getItem("token");
    const response = await axios.get(`${process.env.REACT_APP_API}/api/delivery-session/by-status`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setDeliveries(response.data.groupedSessions || []);
    setFilteredDeliveries(response.data.groupedSessions || []);
    
    // Console log completed orders only
    const completedOrders = response.data.groupedSessions?.find(delivery => delivery._id === 'Completed');
    console.log('Completed orders:', completedOrders);
    
  } catch (error) {
    console.error('Error fetching deliveries:', error);
  }
  setLoading(false);
};

  const applySearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    let filtered = deliveries.filter(delivery =>
      delivery.sessions.some(session =>
        session.riderDetails[0]?.fname?.toLowerCase().includes(lowercasedValue) ||
        session.truckDetails[0]?.model?.toLowerCase().includes(lowercasedValue) ||
        session.orders.some(order =>
          (order.KNMOrderId && order.KNMOrderId.toLowerCase().includes(lowercasedValue)) ||
          (order.user && (
            (`${order.user.fname} ${order.user.lname}`.toLowerCase().includes(lowercasedValue))
          ))
        )
      )
    );

    // Filter by status
    filtered = filtered.filter(delivery => delivery._id === selectedStatus);

    // Sort by date
    filtered = filtered.map(delivery => ({
      ...delivery,
      sessions: [...delivery.sessions].sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return sortOrder === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      })
    }));

    setFilteredDeliveries(filtered);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  // Open custom delete modal
  const openDeleteModal = (id) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  // Actual delete logic
  const deleteCurrentItem = async (id) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`${process.env.REACT_APP_API}/api/delivery-session/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Delivery session deleted successfully");
      fetchDeliveries();
    } catch (error) {
      console.error('Error deleting delivery session:', error);
      toast.error("Failed to delete delivery session");
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/delivery/edit/${id}`);
  };

  // Tab rendering with red background for selected
  const renderTab = (status, label) => (
    <button
      className={`
        flex-1 px-2 py-2 text-xs sm:text-sm
        ${selectedStatus === status
          ? "bg-[#ed003f] text-white font-bold"
          : "text-[#ed003f] border border-[#ed003f] bg-transparent"}
        rounded-md transition
      `}
      style={{ minWidth: 0 }}
      onClick={() => handleStatusChange(status)}
    >
      {label}
    </button>
  );

  const handleSortToggle = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Helper function to format address
  const formatAddress = (address) => {
    if (!address) return "N/A";
    
    const { houseNo, streetName, barangay, city } = address;
    
    // Filter out "none" values and empty strings
    const addressParts = [houseNo, streetName, barangay, city].filter(
      part => part && part.toLowerCase() !== "none" && part.trim() !== ""
    );
    
    return addressParts.length > 0 ? addressParts.join(", ") : "N/A";
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <ToastContainer />
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
            <TitleCard
              title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>Delivery List</span>}
              topMargin="mt-2"
              TopSideButtons={
                <div className="flex flex-wrap gap-2 items-center">
                  <SearchBar
                    searchText={searchText}
                    styleClass="mr-4"
                    setSearchText={setSearchText}
                    inputProps={{
                      style: { borderColor: '#ed003f', borderWidth: '2px' }
                    }}
                  />
                  <button
                    className="btn ml-2"
                    style={{ color: "#ed003f", border: "2px solid #ed003f", background: "transparent", fontWeight: "bold" }}
                    onClick={handleSortToggle}
                  >
                    {sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
                  </button>
                </div>
              }
            >
              <div className="flex w-full gap-2 mb-4">
                {renderTab('Ongoing', 'Ongoing')}
                {renderTab('Completed', 'Completed')}
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <svg className="animate-spin h-8 w-8 text-[#ed003f]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#ed003f" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="#ed003f" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Date</th>
                        <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Rider</th>
                        <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Truck</th>
                        <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>KNM Order IDs</th>
                        <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Delivery Address</th>
                        {selectedStatus === 'Ongoing' && (
                          <th style={{ color: '#ed003f', fontSize: '0.9rem' }}>Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeliveries.length > 0 ? (
                        filteredDeliveries
                          .filter(delivery => delivery._id === selectedStatus)
                          .map((delivery) =>
                            delivery.sessions.map(session => (
                              <tr key={session._id}>
                                <td>
                                  {session.createdAt
                                    ? moment(session.createdAt).format("YYYY-MM-DD HH:mm")
                                    : "N/A"}
                                </td>
                                <td>{session.riderDetails[0]?.fname} {session.riderDetails[0]?.middlei} {session.riderDetails[0]?.lname}</td>
                                <td>{session.truckDetails[0]?.model} ({session.truckDetails[0]?.plateNo})</td>
                                <td>
                                  {session.orders && session.orders.length > 0 ? (
                                    <ul className="list-disc ml-4">
                                      {session.orders.map(orderId => {
                                        // Generate KNMOrderId from the orderId
                                        // Take the last 5 characters of the MongoDB ObjectId and make them uppercase
                                        const idPortion = orderId.toString().substr(-5).toUpperCase();
                                        const KNMOrderId = `KNM-${idPortion}`;
                                        
                                        return (
                                          <li key={orderId}>
                                            {KNMOrderId}
                                          </li>
                                        );
                                      })}
                                    </ul>
                                  ) : (
                                    "No orders"
                                  )}
                                </td>
                                <td className="text-xs sm:text-sm">
                                  {session.orderDetails && session.orderDetails.address
                                    ? formatAddress(session.orderDetails.address)
                                    : "N/A"}
                                </td>
                                {selectedStatus === 'Ongoing' && (
                                  <td>
                                    <button
                                      className="btn btn-square btn-ghost"
                                      onClick={() => handleEdit(session._id)}
                                      title="Edit"
                                    >
                                      <PencilIcon className="w-5 h-5 text-[#ed003f]" />
                                    </button>
                                    <button
                                      className="btn btn-square btn-ghost"
                                      onClick={() => openDeleteModal(session._id)}
                                      title="Delete"
                                    >
                                      <TrashIcon className="w-5 h-5 text-[#ed003f]" />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))
                          )
                      ) : (
                        <tr>
                          <td colSpan={selectedStatus === 'Ongoing' ? 6 : 5} className="text-center">No deliveries found</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </TitleCard>
            <div className="h-16"></div>
          </main>
        </div>
        <LeftSidebar />
      </div>
      <RightSidebar />
      <NotificationContainer />
      <ModalLayout />

      {/* Custom Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-[#ed003f]">Confirm Deletion</h2>
            <p className="mb-6">Are you sure you want to delete this item?</p>
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
                onClick={async () => {
                  await deleteCurrentItem(itemToDelete);
                  setShowDeleteModal(false);
                }}
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

export default DeliveryList;