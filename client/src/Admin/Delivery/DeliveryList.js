import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from "../../Layout/RightSidebar";
import ModalLayout from "../../Layout/ModalLayout";
import { removeNotificationMessage } from "../../Layout/common/headerSlice";
import { NotificationContainer, NotificationManager } from "react-notifications";
import "react-notifications/lib/notifications.css";
import Header from "../../Layout/Header";
import SearchBar from "../../Layout/components/Input/SearchBar";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import { toast, ToastContainer } from "react-toastify";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import moment from "moment";

function DeliveryList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { newNotificationMessage, newNotificationStatus } = useSelector((state) => state.header);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [searchText, setSearchText] = useState("");
  const mainContentRef = useRef(null);
  const [selectedStatus, setSelectedStatus] = useState("Ongoing");
  const [loading, setLoading] = useState(false);
  const [sortOrder, setSortOrder] = useState("desc");

  // Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [editData, setEditData] = useState({
    riderId: "",
    truckId: "",
    orderIds: [],
  });
  const [riders, setRiders] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [addedOrders, setAddedOrders] = useState([]);
  const [editLoading, setEditLoading] = useState(false);

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
      if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, "Success");
      if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, "Error");
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

      const completedOrders = response.data.groupedSessions?.find((delivery) => delivery._id === "Completed");
      console.log("Completed orders:", completedOrders);
      console.log("All deliveries:", response.data.groupedSessions);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
    }
    setLoading(false);
  };

  const fetchEditData = async (sessionId) => {
    try {
      const token = sessionStorage.getItem("token");

      // Fetch current delivery session
      const sessionResponse = await axios.get(`${process.env.REACT_APP_API}/api/delivery-session/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch available riders
      const riderResponse = await axios.get(`${process.env.REACT_APP_API}/api/delivery-session/riders/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch available trucks
      const truckResponse = await axios.get(`${process.env.REACT_APP_API}/api/delivery-session/truck/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch available orders (preparing status)
      const orderResponse = await axios.get(`${process.env.REACT_APP_API}/api/truck/orders/preparing`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const session = sessionResponse.data.session;
      setEditingSession(session);

      console.log("Session data:", session); // Debug log
      console.log("Session orders:", session.orders); // Debug log

      // Set current delivery data
      setEditData({
        riderId: session.rider._id,
        truckId: session.truck._id,
        orderIds: session.orders.map((order) => order._id),
      });

      // Set available data and add current ones to the list
      const allRiders = [...riderResponse.data.data];
      if (!allRiders.find((r) => r._id === session.rider._id)) {
        allRiders.push(session.rider);
      }
      setRiders(allRiders);

      const allTrucks = [...truckResponse.data.data];
      if (!allTrucks.find((t) => t._id === session.truck._id)) {
        allTrucks.push(session.truck);
      }
      setTrucks(allTrucks);

      // FIXED: Handle orders properly when backend doesn't populate full details
      const availableOrders = orderResponse.data.orders || [];
      const currentOrderIds = session.orders.map((order) => order._id);

      // Get full order details for current orders from available orders or fetch individually
      const currentOrdersWithDetails = [];

      for (const sessionOrder of session.orders) {
        // Try to find full details in available orders first
        let fullOrderDetails = availableOrders.find((order) => order._id === sessionOrder._id);

        // If not found in available orders, fetch individual order details
        if (!fullOrderDetails) {
          try {
            const orderDetailResponse = await axios.get(`${process.env.REACT_APP_API}/api/order/${sessionOrder._id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            fullOrderDetails = orderDetailResponse.data.order;
          } catch (error) {
            console.error(`Error fetching order ${sessionOrder._id}:`, error);
            // Fallback to basic info if individual fetch fails
            fullOrderDetails = {
              _id: sessionOrder._id,
              KNMOrderId: `KNM-${sessionOrder._id.slice(-5).toUpperCase()}`,
              totalPrice: 0,
              address: { houseNo: "", streetName: "Unknown", barangay: "", city: "" },
              status: sessionOrder.status || "Unknown",
            };
          }
        }
        currentOrdersWithDetails.push(fullOrderDetails);
      }

      // Filter out current orders from available orders to avoid duplicates
      const filteredAvailableOrders = availableOrders.filter((order) => !currentOrderIds.includes(order._id));

      console.log("Available orders:", availableOrders); // Debug log
      console.log("Current orders with details:", currentOrdersWithDetails); // Debug log
      console.log("Filtered available orders:", filteredAvailableOrders); // Debug log

      setOrders(filteredAvailableOrders);
      setAddedOrders(currentOrdersWithDetails);
    } catch (error) {
      console.error("Error fetching edit data:", error);
      toast.error("Failed to fetch delivery session data.");
    }
  };

  const applySearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    let filtered = deliveries.filter((delivery) =>
      delivery.sessions.some(
        (session) =>
          session.riderDetails[0]?.fname?.toLowerCase().includes(lowercasedValue) ||
          session.truckDetails[0]?.model?.toLowerCase().includes(lowercasedValue) ||
          session.orders.some(
            (order) =>
              (order.KNMOrderId && order.KNMOrderId.toLowerCase().includes(lowercasedValue)) ||
              (order.user && `${order.user.fname} ${order.user.lname}`.toLowerCase().includes(lowercasedValue))
          )
      )
    );

    // Filter by status
    filtered = filtered.filter((delivery) => delivery._id === selectedStatus);

    // Sort by date
    filtered = filtered.map((delivery) => ({
      ...delivery,
      sessions: [...delivery.sessions].sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return sortOrder === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      }),
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
      console.error("Error deleting delivery session:", error);
      toast.error("Failed to delete delivery session");
    }
  };

  // Open edit modal
  const handleEdit = async (id) => {
    setShowEditModal(true);
    await fetchEditData(id);
  };

  // Close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingSession(null);
    setEditData({ riderId: "", truckId: "", orderIds: [] });
    setRiders([]);
    setTrucks([]);
    setOrders([]);
    setAddedOrders([]);
  };

  // Handle edit form changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  // Add order to delivery
  const handleAddOrder = (orderId) => {
    const orderToAdd = orders.find((order) => order._id === orderId);
    if (orderToAdd && !addedOrders.some((order) => order._id === orderId)) {
      setAddedOrders((prev) => [...prev, orderToAdd]);
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    }
  };

  // Remove order from delivery
  const handleRemoveOrder = (orderId) => {
    const orderToRemove = addedOrders.find((order) => order._id === orderId);
    if (orderToRemove) {
      setAddedOrders((prev) => prev.filter((order) => order._id !== orderId));
      setOrders((prev) => [...prev, orderToRemove]);
    }
  };

  // Validate edit form
  const validateEditForm = () => {
    if (!editData.riderId.trim()) {
      toast.error("Rider is required.");
      return false;
    }
    if (!editData.truckId.trim()) {
      toast.error("Truck is required.");
      return false;
    }
    if (addedOrders.length === 0) {
      toast.error("At least one order is required.");
      return false;
    }
    return true;
  };

  // Update delivery session
  const updateDeliverySession = async () => {
    if (!validateEditForm()) return;

    setEditLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API}/api/delivery-session/${editingSession._id}/update`,
        {
          riderId: editData.riderId,
          truckId: editData.truckId,
          orderIds: addedOrders.map((order) => order._id),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Delivery session updated successfully!");
      closeEditModal();
      fetchDeliveries();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update delivery session.");
    }
    setEditLoading(false);
  };

  // Helper function to format address
  const formatAddress = (address) => {
    if (!address) return "N/A";
    const { houseNo, streetName, barangay, city } = address;
    const addressParts = [houseNo, streetName, barangay, city].filter(
      (part) => part && part.toLowerCase() !== "none" && part.trim() !== ""
    );
    return addressParts.length > 0 ? addressParts.join(", ") : "Address not available";
  };

  // Function to truncate address text
  const truncateAddress = (address, maxLength = 15) => {
    const formatted = formatAddress(address);
    if (formatted.length <= maxLength) {
      return formatted;
    }
    return formatted.substring(0, maxLength) + "...";
  };

  // Tab rendering with red background for selected
  const renderTab = (status, label) => (
    <button
      className={`
        flex-1 px-2 py-2 text-xs sm:text-sm
        ${
          selectedStatus === status
            ? "bg-[#ed003f] text-white font-bold"
            : "text-[#ed003f] border border-[#ed003f] bg-transparent"
        }
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

  return (
    <>
      <div className="drawer lg:drawer-open">
        <ToastContainer />
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          <Header />
          <main className="flex-1 overflow-y-auto md:pt-4 pt-4 px-6 bg-base-200" ref={mainContentRef}>
            <TitleCard
              title={<span style={{ color: "#ed003f", fontWeight: "bold" }}>Delivery List</span>}
              topMargin="mt-2"
              TopSideButtons={
                <div className="flex flex-wrap gap-2 items-center">
                  <SearchBar
                    searchText={searchText}
                    styleClass="mr-4"
                    setSearchText={setSearchText}
                    inputProps={{
                      style: { borderColor: "#ed003f", borderWidth: "2px" },
                    }}
                  />
                  <button
                    className="btn ml-2"
                    style={{
                      color: "#ed003f",
                      border: "2px solid #ed003f",
                      background: "transparent",
                      fontWeight: "bold",
                    }}
                    onClick={handleSortToggle}
                  >
                    {sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
                  </button>
                </div>
              }
            >
              <div className="flex w-full gap-2 mb-4">
                {renderTab("Ongoing", "Ongoing")}
                {renderTab("Completed", "Completed")}
              </div>

              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-[#ed003f]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#ed003f" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="#ed003f" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th style={{ color: "#ed003f", fontSize: "0.9rem" }}>Date</th>
                        <th style={{ color: "#ed003f", fontSize: "0.9rem" }}>Rider</th>
                        <th style={{ color: "#ed003f", fontSize: "0.9rem" }}>Truck</th>
                        <th style={{ color: "#ed003f", fontSize: "0.9rem" }}>Order ID</th>
                        <th style={{ color: "#ed003f", fontSize: "0.9rem" }}>Delivery Address</th>
                        {selectedStatus === "Ongoing" && (
                          <th style={{ color: "#ed003f", fontSize: "0.9rem" }}>Actions</th>
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDeliveries.length > 0 ? (
                        filteredDeliveries
                          .filter((delivery) => delivery._id === selectedStatus)
                          .map((delivery) =>
                            delivery.sessions.map((session) => (
                              <tr key={session._id}>
                                <td>
                                  {session.createdAt ? moment(session.createdAt).format("YYYY-MM-DD HH:mm") : "N/A"}
                                </td>
                                <td>
                                  {session.riderDetails[0]?.fname} {session.riderDetails[0]?.middlei}{" "}
                                  {session.riderDetails[0]?.lname}
                                </td>
                                <td>
                                  {session.truckDetails[0]?.model} ({session.truckDetails[0]?.plateNo})
                                </td>
                                <td>
                                  {session.orders && session.orders.length > 0 ? (
                                    <ul className="list-disc ml-4">
                                      {session.orders.map((orderId) => {
                                        const idPortion = orderId.toString().substr(-5).toUpperCase();
                                        const KNMOrderId = `KNM-${idPortion}`;

                                        return <li key={orderId}>{KNMOrderId}</li>;
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
                                {selectedStatus === "Ongoing" && (
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
                          <td colSpan={selectedStatus === "Ongoing" ? 6 : 5} className="text-center">
                            No deliveries found
                          </td>
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
              <button className="btn" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button
                className="btn"
                style={{ backgroundColor: "#ed003f", color: "#fff", border: "none" }}
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

      {/* Edit Delivery Modal */}
      {showEditModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-[#ed003f]">Edit Delivery Session</h2>
                <button className="btn btn-sm btn-circle" onClick={closeEditModal}>
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Rider Dropdown */}
                <div>
                  <label className="block mb-1 font-semibold text-[#ed003f]">Rider</label>
                  <select
                    name="riderId"
                    value={editData.riderId}
                    onChange={handleEditInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select Rider</option>
                    {riders.map((rider) => (
                      <option key={rider._id} value={rider._id}>
                        {rider.fname} {rider.middlei ? `${rider.middlei}. ` : ""}
                        {rider.lname}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Truck Dropdown */}
                <div>
                  <label className="block mb-1 font-semibold text-[#ed003f]">Truck</label>
                  <select
                    name="truckId"
                    value={editData.truckId}
                    onChange={handleEditInputChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">Select Truck</option>
                    {trucks.map((truck) => (
                      <option key={truck._id} value={truck._id}>
                        {truck.model} - {truck.plateNo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Side by Side Orders Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Available Orders */}
                <div>
                  <label className="block mb-2 font-bold text-[#ed003f] text-sm">Available Orders</label>
                  <div className="border p-2 rounded-md" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <table className="table w-full text-xs">
                      <thead className="sticky top-0 bg-white">
                        <tr>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Order ID</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Price</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Address</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length > 0 ? (
                          orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="text-xs">{order.KNMOrderId}</td>
                              <td className="text-xs">₱{Number(order.totalPrice).toFixed(2)}</td>
                              <td className="text-xs" title={formatAddress(order.address)}>
                                {truncateAddress(order.address)}
                              </td>
                              <td>
                                <button
                                  className="btn btn-xs"
                                  style={{
                                    backgroundColor: "transparent",
                                    color: "#ed003f",
                                    border: "1px solid #ed003f",
                                  }}
                                  onClick={() => handleAddOrder(order._id)}
                                >
                                  Add
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center text-xs">
                              No available orders
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Current Orders */}
                <div>
                  <label className="block mb-2 font-bold text-[#ed003f] text-sm">
                    Current Orders ({addedOrders.length})
                  </label>
                  <div className="border p-2 rounded-md" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    <table className="table w-full text-xs">
                      <thead className="sticky top-0 bg-white">
                        <tr>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Order ID</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Price</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Address</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {addedOrders.length > 0 ? (
                          addedOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="text-xs">
                                {order.KNMOrderId || `KNM-${order._id.slice(-5).toUpperCase()}`}
                              </td>
                              <td className="text-xs">₱{Number(order.totalPrice || 0).toFixed(2)}</td>
                              <td className="text-xs" title={formatAddress(order.address)}>
                                {truncateAddress(order.address)}
                              </td>
                              <td>
                                <button
                                  className="btn btn-xs"
                                  style={{ backgroundColor: "#ed003f", color: "#fff", border: "none" }}
                                  onClick={() => handleRemoveOrder(order._id)}
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="text-center text-xs">
                              No orders assigned
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 mt-6">
                <button className="btn" onClick={closeEditModal} disabled={editLoading}>
                  Cancel
                </button>
                <button
                  className="btn"
                  style={{ backgroundColor: "#ed003f", color: "#fff", border: "none" }}
                  onClick={updateDeliverySession}
                  disabled={editLoading}
                >
                  {editLoading ? "Updating..." : "Update Delivery Session"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeliveryList;
