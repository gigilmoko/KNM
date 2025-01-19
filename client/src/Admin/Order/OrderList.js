import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from "../../Layout/RightSidebar";
import Header from "../../Layout/Header";
import TitleCard from "../../Layout/components/Cards/TitleCard";

function OrdersList() {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [users, setUsers] = useState([]);
    const mainContentRef = useRef(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
      mainContentRef.current.scroll({
        top: 0,
        behavior: "smooth",
      });
      fetchOrders();
      fetchUsers();
    }, []);
  
    useEffect(() => {
      applySearch(searchText);
    }, [searchText, orders]);
  
    const fetchOrders = async () => {
      try {
        const token = sessionStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API}/api/orders/list`, {
         headers: {
                    Authorization: `Bearer ${token}`,
                },
      });
        if (response.data && Array.isArray(response.data.orders)) {
          setOrders(response.data.orders);
          setFilteredOrders(response.data.orders);
          console.log(response.data.orders)
        } else {
          setOrders([]);
          setFilteredOrders([]);
        }
      } catch (error) {
        console.error("Failed to fetch orders", error);
        setOrders([]);
        setFilteredOrders([]);
      }
    };
  
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API}/api/all-users`);
        if (response.data && Array.isArray(response.data.users)) {
          setUsers(response.data.users);
        } else {
          console.error("Data fetched is not an array:", response.data);
          setUsers([]);
        }
      } catch (error) {
        console.error("Failed to fetch users", error);
        setUsers([]);
      }
    };
  
    const getUserNameById = (userId) => {
      const user = users.find((user) => user._id === userId);
      return user ? `${user.fname} ${user.middlei}. ${user.lname}` : "Unknown User";
    };
  
    const updateOrderStatus = async (id, index, newStatus) => {
      try {
          await axios.put(`${process.env.REACT_APP_API}/api/orders/update/${id}`, { status: newStatus });
  
          const updatedOrders = [...orders];
          updatedOrders[index].status = newStatus; // Changed orderStatus to status
          setOrders(updatedOrders);
          setFilteredOrders(updatedOrders);
  
          toast.success("Order status updated successfully!");
      } catch (error) {
          console.error("Failed to update order status", error);
          toast.error("Failed to update order status");
      }
  };
    const applySearch = (value) => {
      const lowercasedValue = value.toLowerCase();
      const filtered = orders.filter(
        (order) =>
          getUserNameById(order.user).toLowerCase().includes(lowercasedValue) ||
          order.orderStatus.toLowerCase().includes(lowercasedValue)
      );
      setFilteredOrders(filtered);
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
                title="All Orders"
                topMargin="mt-2"
                TopSideButtons={
                  <input
                    type="text"
                    placeholder="Search Orders"
                    className="input input-bordered w-full max-w-xs"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                }
              >
                <div className="overflow-x-auto w-full">
                  <table className="table w-full">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Items</th>
                        <th>Total Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length > 0 ? (
                        filteredOrders.map((order, index) => (
                          <tr key={order._id}>
                            <td>{order._id}</td>
                            <td>{getUserNameById(order.user)}</td>
                            <td>
  {order.orderProducts.map((item, i) => (
    <div key={i} className="text-sm">
      Product ID: {item.product} x {item.quantity}
    </div>
  ))}
</td>

<td>${order.totalPrice?.toFixed(2) || "0.00"}</td>
                            <td>
                              <select
                                value={order.orderStatus}
                                onChange={(e) =>
                                  updateOrderStatus(order._id, index, e.target.value)
                                }
                                className="select select-bordered w-full max-w-xs"
                              >
                                <option value="Preparing">Preparing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                            </td>
                            <td>
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => alert("View details")}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="text-center">
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
        </div>
        <RightSidebar />
      </>
    );
  }
  
  export default OrdersList;
  
