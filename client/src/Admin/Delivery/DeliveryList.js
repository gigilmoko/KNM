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

function DeliveryList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { newNotificationMessage, newNotificationStatus } = useSelector(state => state.header);
  const [deliveries, setDeliveries] = useState([]);
  const [filteredDeliveries, setFilteredDeliveries] = useState([]);
  const [searchText, setSearchText] = useState("");
  const mainContentRef = useRef(null);
  const [selectedStatus, setSelectedStatus] = useState('Ongoing');

  useEffect(() => {
      mainContentRef.current.scroll({
          top: 0,
          behavior: "smooth"
      });
      fetchDeliveries();
  }, []);

  useEffect(() => {
      applySearch(searchText);
  }, [searchText, deliveries]);

  useEffect(() => {
      if (newNotificationMessage !== "") {
          if (newNotificationStatus === 1) NotificationManager.success(newNotificationMessage, 'Success');
          if (newNotificationStatus === 0) NotificationManager.error(newNotificationMessage, 'Error');
          dispatch(removeNotificationMessage());
      }
  }, [newNotificationMessage]);

  const fetchDeliveries = async () => {
      try {
          const token = sessionStorage.getItem("token");
          const response = await axios.get(`${process.env.REACT_APP_API}/api/delivery-session/by-status`, {
              headers: { Authorization: `Bearer ${token}` },
          });

          const sortedDeliveries = response.data.groupedSessions.sort((a, b) => {
              const statusOrder = ['Undecided', 'Ongoing', 'Completed', 'Cancelled'];
              return statusOrder.indexOf(a._id) - statusOrder.indexOf(b._id);
          });

          setDeliveries(sortedDeliveries || []);
          setFilteredDeliveries(sortedDeliveries || []);
      } catch (error) {
          console.error('Error fetching deliveries:', error);
      }
  };

  const applySearch = (value) => {
      const lowercasedValue = value.toLowerCase();
      const filtered = deliveries.filter(delivery => 
          delivery.sessions.some(session =>
              session.orders.some(order => order.toLowerCase().includes(lowercasedValue))
          )
      );
      setFilteredDeliveries(filtered);
  };

  const handleStatusChange = (status) => {
      setSelectedStatus(status);
  };

  const handleDelete = async (id) => {
      if (window.confirm("Are you sure you want to delete this delivery session?")) {
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
      }
  };

  const handleEdit = (id) => {
      navigate(`/admin/delivery/edit/${id}`);
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
                          title="Delivery List"
                          topMargin="mt-2"
                          TopSideButtons={<SearchBar searchText={searchText} styleClass="mr-4" setSearchText={setSearchText} />}
                      >
                          <div className="tabs">
                              <button className={`tab ${selectedStatus === 'Undecided' ? 'tab-active' : ''}`} onClick={() => handleStatusChange('Undecided')}>Undecided</button>
                              <button className={`tab ${selectedStatus === 'Ongoing' ? 'tab-active' : ''}`} onClick={() => handleStatusChange('Ongoing')}>Ongoing</button>
                              <button className={`tab ${selectedStatus === 'Completed' ? 'tab-active' : ''}`} onClick={() => handleStatusChange('Completed')}>Completed</button>
                              <button className={`tab ${selectedStatus === 'Cancelled' ? 'tab-active' : ''}`} onClick={() => handleStatusChange('Cancelled')}>Cancelled</button>
                          </div>

                          <div className="overflow-x-auto w-full">
                              <table className="table w-full">
                                  <thead>
                                      <tr>
                                          <th>Rider</th>
                                          <th>Truck</th>
                                          <th>Orders</th>
                                          {/* <th>Status</th> */}
                                          <th>Actions</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {filteredDeliveries.length > 0 ? (
                                          filteredDeliveries
                                              .filter(delivery => delivery._id === selectedStatus)
                                              .map((delivery) => (
                                                  delivery.sessions.map(session => (
                                                      <tr key={session._id}>
                                                          <td>{session.riderDetails[0]?.fname} {session.riderDetails[0]?.middlei} {session.riderDetails[0]?.lname}</td>
                                                          <td>{session.truckDetails[0]?.model} ({session.truckDetails[0]?.plateNo})</td>
                                                          <td>{session.orders.join(', ')}</td>
                                                          {/* <td>{session.status}</td> */}
                                                          <td>
                                                              <button 
                                                                  className="btn btn-primary btn-sm mr-2" 
                                                                  onClick={() => handleEdit(session._id)}
                                                              >
                                                                  Edit
                                                              </button>
                                                              <button 
                                                                  className="btn btn-error btn-sm"
                                                                  onClick={() => handleDelete(session._id)}
                                                              >
                                                                  Delete
                                                              </button>
                                                          </td>
                                                      </tr>
                                                  ))
                                              ))
                                      ) : (
                                          <tr>
                                              <td colSpan="5" className="text-center">No deliveries found</td>
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

export default DeliveryList;