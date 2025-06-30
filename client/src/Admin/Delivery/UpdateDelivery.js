import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../../Layout/Header";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from "../../Layout/RightSidebar";
import ModalLayout from "../../Layout/ModalLayout";

function UpdateDelivery() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [deliveryData, setDeliveryData] = useState({
    riderId: "",
    truckId: "",
    orderIds: [],
  });
  const [riders, setRiders] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [orders, setOrders] = useState([]);
  const [addedOrders, setAddedOrders] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem("token");
      
      // Fetch current delivery session
      const sessionResponse = await axios.get(`${process.env.REACT_APP_API}/api/delivery-session/${id}`, {
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
      setCurrentSession(session);
      
      // Set current delivery data
      setDeliveryData({
        riderId: session.rider._id,
        truckId: session.truck._id,
        orderIds: session.orders.map(order => order._id),
      });

      // Set available data and add current ones to the list
      const allRiders = [...riderResponse.data.data];
      if (!allRiders.find(r => r._id === session.rider._id)) {
        allRiders.push(session.rider);
      }
      setRiders(allRiders);

      const allTrucks = [...truckResponse.data.data];
      if (!allTrucks.find(t => t._id === session.truck._id)) {
        allTrucks.push(session.truck);
      }
      setTrucks(allTrucks);

      // Set orders
      setOrders(orderResponse.data.orders || []);
      setAddedOrders(session.orders || []);

      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch delivery session data.");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDeliveryData({ ...deliveryData, [name]: value });
  };

  const validateForm = () => {
    if (!deliveryData.riderId.trim()) {
      toast.error("Rider is required.");
      return false;
    }
    if (!deliveryData.truckId.trim()) {
      toast.error("Truck is required.");
      return false;
    }
    if (addedOrders.length === 0) {
      toast.error("At least one order is required.");
      return false;
    }
    return true;
  };

  const updateDeliverySession = async () => {
    if (!validateForm()) return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.put(
        `${process.env.REACT_APP_API}/api/delivery-session/${id}/update`,
        { 
          riderId: deliveryData.riderId,
          truckId: deliveryData.truckId,
          orderIds: addedOrders.map((order) => order._id) 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Delivery session updated successfully!");
      setTimeout(() => navigate("/admin/delivery/list"), 2000);
    } catch (error) {
      console.error(error);
      toast.error("Failed to update delivery session.");
    }
  };

  const handleAddOrder = (orderId) => {
    const orderToAdd = orders.find((order) => order._id === orderId);
    if (orderToAdd && !addedOrders.some((order) => order._id === orderId)) {
      setAddedOrders((prev) => [...prev, orderToAdd]);
      setOrders((prev) => prev.filter((order) => order._id !== orderId));
    }
  };

  const handleRemoveOrder = (orderId) => {
    const orderToRemove = addedOrders.find((order) => order._id === orderId);
    if (orderToRemove) {
      setAddedOrders((prev) => prev.filter((order) => order._id !== orderId));
      setOrders((prev) => [...prev, orderToRemove]);
    }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading loading-spinner loading-lg text-[#ed003f]"></div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      <div className="drawer lg:drawer-open">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 overflow-y-auto p-2 sm:p-6 bg-base-200">
            <TitleCard title={<span style={{ color: "#ed003f", fontWeight: "bold" }}>Update Delivery Session</span>}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Rider Dropdown */}
                <div>
                  <label className="block mb-1 font-semibold text-[#ed003f]">Rider</label>
                  <select
                    name="riderId"
                    value={deliveryData.riderId}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
                  >
                    <option value="">Select Rider</option>
                    {riders.map((rider) => (
                      <option key={rider._id} value={rider._id}>
                        {rider.fname} {rider.middlei ? `${rider.middlei}. ` : ''}{rider.lname}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Truck Dropdown */}
                <div>
                  <label className="block mb-1 font-semibold text-[#ed003f]">Truck</label>
                  <select
                    name="truckId"
                    value={deliveryData.truckId}
                    onChange={handleInputChange}
                    className="input input-bordered w-full"
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
                {/* Available Orders Table */}
                <div>
                  <label className="block mb-2 font-bold text-[#ed003f] text-sm">Available Orders</label>
                  <div
                    className="border p-2 rounded-md overflow-x-auto"
                    style={{ maxHeight: "400px", overflowY: "auto" }}
                  >
                    <table className="table w-full text-xs">
                      <thead className="sticky top-0 bg-white">
                        <tr>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Order ID</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Price</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Payment</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Address</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.length > 0 ? (
                          orders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="text-xs break-all">{order.KNMOrderId}</td>
                              <td className="text-xs">₱{Number(order.totalPrice).toFixed(2)}</td>
                              <td className="text-xs">{order.paymentInfo}</td>
                              <td 
                                className="text-xs" 
                                title={formatAddress(order.address)}
                                style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                              >
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
                            <td colSpan={5} className="text-center text-xs">
                              No available orders
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Added Orders Table */}
                <div>
                  <label className="block mb-2 font-bold text-[#ed003f] text-sm">
                    Current Orders ({addedOrders.length})
                  </label>
                  <div
                    className="border p-2 rounded-md overflow-x-auto"
                    style={{ maxHeight: "400px", overflowY: "auto" }}
                  >
                    <table className="table w-full text-xs">
                      <thead className="sticky top-0 bg-white">
                        <tr>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Order ID</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Price</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Payment</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Address</th>
                          <th style={{ color: "#ed003f", fontSize: "0.7rem" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {addedOrders.length > 0 ? (
                          addedOrders.map((order) => (
                            <tr key={order._id} className="hover:bg-gray-50">
                              <td className="text-xs break-all">{order.KNMOrderId}</td>
                              <td className="text-xs">₱{Number(order.totalPrice).toFixed(2)}</td>
                              <td className="text-xs">{order.paymentInfo}</td>
                              <td 
                                className="text-xs" 
                                title={formatAddress(order.address)}
                                style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                              >
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
                            <td colSpan={5} className="text-center text-xs">
                              No orders assigned
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Update Delivery Button */}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="btn w-full sm:w-auto"
                  style={{ backgroundColor: "transparent", color: "#ed003f", border: "2px solid #ed003f" }}
                  onClick={() => navigate("/admin/delivery/list")}
                >
                  Cancel
                </button>
                <button
                  className="btn w-full sm:w-auto"
                  style={{ backgroundColor: "#ed003f", color: "#fff", border: "none" }}
                  onClick={updateDeliverySession}
                >
                  Update Delivery Session
                </button>
              </div>
            </TitleCard>
          </main>
        </div>
        <LeftSidebar />
        <RightSidebar />
        <ModalLayout />
      </div>
    </>
  );
}

export default UpdateDelivery;