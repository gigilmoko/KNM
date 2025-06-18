import React, { useState } from 'react';
import Header from '../../Layout/Header';
import LeftSidebar from '../../Layout/LeftSidebar';
import RightSidebar from '../../Layout/RightSidebar';
import ModalLayout from '../../Layout/ModalLayout';
import TitleCard from '../../Layout/components/Cards/TitleCard';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PpiForecastLineGraph from '../components/PPIForecastLineGraph';
import ProductPriceForecastLineGraph from '../components/ProductPriceForecastLineGraph';

const ForecastGraph = () => {
    const [activeTab, setActiveTab] = useState('ppi');

    return (
        <>
            <ToastContainer />
            <div className="drawer lg:drawer-open">
                <input id="left-sidebar-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content flex flex-col">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 bg-red-50">
                        <TitleCard title="Forecasts" topMargin="mt-2">
                            <div className="mb-6">
                                <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 mb-4">
                                    <button
                                        className={`btn w-full sm:w-auto ${activeTab === 'ppi'
                                            ? 'bg-red-600 text-white border-red-600'
                                            : 'bg-white text-red-700 border-red-400 hover:bg-red-100'
                                            }`}
                                        onClick={() => setActiveTab('ppi')}
                                    >
                                        Producer's Price Index Forecast
                                    </button>
                                    <button
                                        className={`btn w-full sm:w-auto ${activeTab === 'product'
                                            ? 'bg-red-600 text-white border-red-600'
                                            : 'bg-white text-red-700 border-red-400 hover:bg-red-100'
                                            }`}
                                        onClick={() => setActiveTab('product')}
                                    >
                                        Product Price Forecast
                                    </button>
                                </div>
                                <div className="bg-white rounded-lg shadow border border-red-200 p-2 sm:p-4">
                                    {activeTab === 'ppi' && <PpiForecastLineGraph />}
                                    {activeTab === 'product' && <ProductPriceForecastLineGraph />}
                                </div>
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
};

export default ForecastGraph;