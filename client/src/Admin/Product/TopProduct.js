import { useRef, useEffect, useState } from "react";
import axios from "axios";
import LeftSidebar from "../../Layout/LeftSidebar";
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from "../../Layout/ModalLayout";
import { NotificationContainer } from 'react-notifications';
import 'react-notifications/lib/notifications.css';
import Header from "../../Layout/Header";
import TitleCard from "../../Layout/components/Cards/TitleCard";
import { ToastContainer } from 'react-toastify';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function TopProduct() {
    const mainContentRef = useRef(null);
    const [dateRange, setDateRange] = useState({ from: "", to: "" });
    const [topProducts, setTopProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        mainContentRef.current?.scroll({
            top: 0,
            behavior: "smooth"
        });
    }, []);

    useEffect(() => {
        if (dateRange.from && dateRange.to) {
            fetchTopProducts();
        } else {
            setTopProducts([]);
        }
        // eslint-disable-next-line
    }, [dateRange]);

    const fetchTopProducts = async () => {
        setLoading(true);
        try {
            const res = await axios.post(
                `${process.env.REACT_APP_API}/api/predictions/get-top-products`,
                {
                    startDate: dateRange.from,
                    endDate: dateRange.to
                }
            );
            console.log("Fetched top products:", res.data); // <-- log the fetched data
            setTopProducts(res.data.topProducts || []);
        } catch (err) {
            setTopProducts([]);
        }
        setLoading(false);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.text("Top Products", 14, 16);

        const tableColumn = [
            "Image",
            "Name",
            "Description",
            "Price",
            "Stock",
            "Category",
            "Ordered Qty"
        ];

        const tableRows = topProducts.map(({ product, quantity }) => [
            (product.images && product.images.length > 0) ? "Image" : "N/A",
            product.name,
            product.description,
            `₱${Number(product.price).toFixed(2)}`,
            product.stock,
            product.category?.name || "Unknown",
            quantity
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 20
        });

        doc.save("top-products.pdf");
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
                            title={<span className="text-[#ed003f] font-bold">Top Products</span>}
                            topMargin="mt-3"
                            containerClassName="!bg-[#ed003f] !text-white"
                            TopSideButtons={
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                                    <div className="flex flex-row gap-2 items-center">
                                        <input
                                            type="date"
                                            className="input input-bordered input-sm"
                                            value={dateRange.from}
                                            onChange={e => setDateRange({ ...dateRange, from: e.target.value })}
                                            placeholder="From"
                                        />
                                        <span className="mx-1 text-xs text-gray-400">to</span>
                                        <input
                                            type="date"
                                            className="input input-bordered input-sm"
                                            value={dateRange.to}
                                            onChange={e => setDateRange({ ...dateRange, to: e.target.value })}
                                            placeholder="To"
                                        />
                                    </div>
                                    {topProducts.length > 0 && (
                                        <button
                                            className="btn btn-sm bg-white text-[#ed003f] border border-[#ed003f] hover:bg-[#ed003f] hover:text-white"
                                            onClick={handleDownloadPDF}
                                            type="button"
                                        >
                                            Download as PDF
                                        </button>
                                    )}
                                </div>
                            }
                        >
                            <div className="overflow-x-auto w-full">
                                <table className="table w-full min-w-[700px]">
                                    <thead>
                                        <tr>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Image</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Name</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Description</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Price</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Stock</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Category</th>
                                            <th className="text-[#ed003f] text-xs sm:text-sm">Ordered Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="text-center text-sm text-gray-500">
                                                    Loading...
                                                </td>
                                            </tr>
                                        ) : topProducts.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center text-sm text-gray-500">
                                                    {dateRange.from && dateRange.to
                                                        ? "No products found for selected range"
                                                        : "Select a date range"}
                                                </td>
                                            </tr>
                                        ) : (
                                            topProducts.map(({ product, quantity }) => (
                                                <tr key={product._id}>
                                                    <td>
                                                        {product.images && product.images.length > 0 ? (
                                                            <img src={product.images[0].url} alt={product.name} className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded" />
                                                        ) : (
                                                            <span className="text-xs text-gray-400">No image</span>
                                                        )}
                                                    </td>
                                                    <td className="text-xs sm:text-base">{product.name}</td>
                                                    <td className="text-xs sm:text-base">{product.description}</td>
                                                    <td className="text-xs sm:text-base">₱{Number(product.price).toFixed(2)}</td>
                                                    <td className="text-xs sm:text-base">{product.stock}</td>
                                                    <td className="text-xs sm:text-base">{product.category?.name || "Unknown"}</td>
                                                    <td className="text-xs sm:text-base font-bold">{quantity}</td>
                                                </tr>
                                            ))
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

export default TopProduct;
