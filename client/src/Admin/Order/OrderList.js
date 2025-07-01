import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Header from "../../Layout/Header";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from "../../Layout/RightSidebar";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import SearchBar from "../../Layout/components/Input/SearchBar";
import { ToastContainer, toast } from "react-toastify";
import moment from "moment";

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("Preparing");
  const [sortOrder, setSortOrder] = useState("desc"); // Default: latest to oldest
  const mainContentRef = useRef(null);

  useEffect(() => {
    mainContentRef.current?.scroll({ top: 0, behavior: "smooth" });
    fetchOrders();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    applySearch(searchText);
    // eslint-disable-next-line
  }, [searchText, orders, activeTab]);

  useEffect(() => {
    if (activeTab) {
      setFilteredOrders(orders.filter((order) => order.status === activeTab));
    } else {
      setFilteredOrders(orders);
    }
  }, [activeTab, orders]);

  const fetchOrders = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API}/api/orders/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const sorted = (response.data.orders || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(sorted);
      setFilteredOrders(sorted.filter((order) => order.status === activeTab));
      console.log("Orders fetched successfully:", sorted);
    } catch (error) {
      toast.error("Failed to fetch orders");
    }
  };

  const applySearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    const filtered = orders.filter(
      (order) =>
        ((order.KNMOrderId && order.KNMOrderId.toLowerCase().includes(lowercasedValue)) ||
          (order.status && order.status.toLowerCase().includes(lowercasedValue)) ||
          (order.totalPrice && order.totalPrice.toString().includes(lowercasedValue)) ||
          (order.user && `${order.user.fname} ${order.user.lname}`.toLowerCase().includes(lowercasedValue)) ||
          (order.orderProducts &&
            order.orderProducts.some(
              (op) => op.product && op.product.name && op.product.name.toLowerCase().includes(lowercasedValue)
            ))) &&
        (activeTab ? order.status === activeTab : true)
    );
    setFilteredOrders(filtered);
  };

  const toggleSortOrder = () => {
    const sorted = [...filteredOrders].sort((a, b) => {
      return sortOrder === "asc"
        ? new Date(a.createdAt) - new Date(b.createdAt)
        : new Date(b.createdAt) - new Date(a.createdAt);
    });
    setFilteredOrders(sorted);
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
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
              title={<span style={{ color: "#ed003f", fontWeight: "bold" }}>Order List</span>}
              topMargin="mt-2"
              TopSideButtons={
                <div className="flex items-center space-x-2">
                  <SearchBar
                    searchText={searchText}
                    styleClass="mr-4"
                    setSearchText={setSearchText}
                    inputProps={{
                      style: { borderColor: "#ed003f", borderWidth: "2px" },
                    }}
                  />
                  <button
                    className="btn"
                    style={{
                      color: "#ed003f",
                      border: "2px solid #ed003f",
                      background: "transparent",
                      fontWeight: "bold",
                    }}
                    onClick={toggleSortOrder}
                  >
                    {sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
                  </button>
                </div>
              }
            >
              <div className="flex w-full gap-2 mb-4">
                {["Preparing", "Shipped", "Delivered"].map((tab) => (
                  <button
                    key={tab}
                    className={`
                      flex-1 px-2 py-2 text-xs sm:text-sm
                      ${
                        activeTab === tab
                          ? "bg-[#ed003f] text-white font-bold"
                          : "text-[#ed003f] border border-[#ed003f] bg-transparent"
                      }
                      rounded-md transition
                    `}
                    onClick={() => setActiveTab(tab)}
                    style={{ minWidth: 0 }}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto w-full">
                <table className="table w-full min-w-[800px]">
                  <thead>
                    <tr>
                      <th className="text-[#ed003f] text-xs sm:text-sm">Order Date</th>
                      <th className="text-[#ed003f] text-xs sm:text-sm">KNMOrderId</th>
                      <th className="text-[#ed003f] text-xs sm:text-sm">Customer</th>
                      <th className="text-[#ed003f] text-xs sm:text-sm">Order Items</th>
                      <th className="text-[#ed003f] text-xs sm:text-sm">Total Price</th>
                      <th className="text-[#ed003f] text-xs sm:text-sm">Delivery Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.length > 0 ? (
                      filteredOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="text-xs sm:text-sm">
                            {order.createdAt ? moment(order.createdAt).format("YYYY-MM-DD HH:mm") : "N/A"}
                          </td>
                          <td className="text-xs sm:text-sm">{order.KNMOrderId || order._id}</td>
                          <td className="text-xs sm:text-sm">
                            {order.user ? `${order.user.fname} ${order.user.lname}` : "Unknown"}
                          </td>
                          <td className="text-xs sm:text-sm">
                            {order.orderProducts && order.orderProducts.length > 0 ? (
                              <ul className="list-disc ml-4">
                                {order.orderProducts.map((op, idx) => (
                                  <li key={idx}>
                                    {op.product && op.product.name
                                      ? `${op.product.name} (x${op.quantity})`
                                      : `Product (x${op.quantity})`}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              "No items"
                            )}
                          </td>
                          <td className="text-xs sm:text-sm">
                            {order.totalPrice ? `₱${Number(order.totalPrice).toFixed(2)}` : "N/A"}
                          </td>
                          <td className="text-xs sm:text-sm">
                            {order.address
                              ? `${order.address.houseNo} ${order.address.streetName}, ${order.address.barangay}, ${order.address.city}`
                              : "N/A"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center text-xs sm:text-sm">
                          No orders found
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
        <RightSidebar />
      </div>
    </>
  );
}

export default OrderList;
