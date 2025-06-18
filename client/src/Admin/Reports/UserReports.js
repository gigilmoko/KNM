import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import TitleCard from '../../Layout/components/Cards/TitleCard';

const UserReports = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API}/api/reports/user-reports`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setUsers(response.data.users);
      } catch (error) {
        console.error('Error fetching user reports:', error);
      }
    };

    fetchUserReports();
  }, []);

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title: Kababaihan ng Maynila (centered, red)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor('#ed003f');
    const titleText = 'Kababaihan ng Maynila';
    const titleX = (pageWidth - doc.getTextWidth(titleText)) / 2;
    doc.text(titleText, titleX, 20);

    // Subtitle: User Reports (centered, red)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(15);
    const subText = 'User Reports';
    const subX = (pageWidth - doc.getTextWidth(subText)) / 2;
    doc.text(subText, subX, 30);

    // Table data
    const tableColumn = ['User ID', 'Name', 'Email', 'Phone'];
    const tableRows = users.map(user => [
      user._id,
      `${user.fname} ${user.lname}`,
      user.email,
      user.phone
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      headStyles: {
        fillColor: [237, 0, 63],
        textColor: 255
      },
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        1: { cellWidth: 50 },
        2: { cellWidth: 60 },
        3: { cellWidth: 40 }
      }
    });

    doc.save('User_Reports.pdf');
  };

  return (
    <>
      <div className="drawer lg:drawer-open">
        <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 p-2 sm:p-6 bg-base-200">
            <TitleCard
              title={<span style={{ color: '#ed003f', fontWeight: 'bold' }}>User Report</span>}
              TopSideButtons={
                <button 
                  className="btn"
                  style={{ backgroundColor: '#ed003f', borderColor: '#ed003f', color: '#ffffff' }}
                  onClick={generatePDF}
                >
                  Download PDF
                </button>
              }
            >
              <div className="overflow-x-auto">
                <table className="table w-full mt-6 text-xs sm:text-sm">
                  <thead>
                    <tr>
                      <th style={{ color: '#ed003f', fontSize: '0.9rem', textAlign: 'center' }}>User ID</th>
                      <th style={{ color: '#ed003f', fontSize: '0.9rem', textAlign: 'center' }}>Name</th>
                      <th style={{ color: '#ed003f', fontSize: '0.9rem', textAlign: 'center' }}>Email</th>
                      <th style={{ color: '#ed003f', fontSize: '0.9rem', textAlign: 'center' }}>Phone</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user._id}>
                        <td className="text-center">{user._id}</td>
                        <td className="text-center">{`${user.fname} ${user.lname}`}</td>
                        <td className="text-center">{user.email}</td>
                        <td className="text-center">{user.phone}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </TitleCard>
          </main>
        </div>
        <LeftSidebar />
      </div>
      <RightSidebar />
      <ModalLayout />
    </>
  );
};

export default UserReports;