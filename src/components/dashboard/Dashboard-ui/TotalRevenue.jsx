import React, { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown, FaWifi, FaRegCreditCard, FaRupeeSign } from "react-icons/fa";
import axios from "axios";
import dayjs from "dayjs";

function TotalRevenue() {
    const [cashCollection, setCashCollection] = useState({
        amount: "0",
        percentage: "0%",
        isUp: true,
    });

    const [onlineCollection, setOnlineCollection] = useState({
        amount: "0",
        percentage: "0%",
        isUp: true,
    });

    const [expenses, setExpenses] = useState({
        amount: "0",
        percentage: "0%",
        isUp: true,
    });

    const [selectedMonth, setSelectedMonth] = useState(dayjs().format("YYYY-MM")); // Example: "2025-04"

    useEffect(() => {
        const fetchData = async () => {
            try {
                const startDate = dayjs(selectedMonth + "-01").startOf('month').format('YYYY-MM-DD');
                const endDate = dayjs(selectedMonth + "-01").endOf('month').format('YYYY-MM-DD');

                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/api/customer/monthly-collection-expenses`,
                    {
                        params: { startDate, endDate },
                    }
                );

                const data = response.data?.data;

                if (data) {
                    const totalCashCollection = data.totalCashCollection || 0;
                    const totalOnlineCollection = data.totalOnlineCollection || 0;
                    const totalExpenses = data.totalExpenses || 0;

                    setCashCollection({
                        amount: formatAmount(totalCashCollection),
                        percentage: "100%",
                        isUp: true,
                    });

                    setOnlineCollection({
                        amount: formatAmount(totalOnlineCollection),
                        percentage: "100%",
                        isUp: true,
                    });

                    setExpenses({
                        amount: formatAmount(totalExpenses),
                        percentage: "100%",
                        isUp: true,
                    });
                } else {
                    console.warn("No data found for monthly collection and expenses.");
                }

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [selectedMonth]); // 🔥 Now it listens to month change!

    function formatAmount(amount) {
        if (amount >= 10000000) return (amount / 10000000).toFixed(1) + " Cr";
        if (amount >= 100000) return (amount / 100000).toFixed(1) + " L";
        if (amount >= 1000) return (amount / 1000).toFixed(1) + "K";
        return amount.toString();
    }

    function handleMonthChange(e) {
        setSelectedMonth(e.target.value);
    }

    return (
        <div className="w-full mt-10 px-4 sm:px-8 lg:px-32 flex flex-col items-center">
            
            {/* Month Selector */}
            {/* <div className="mb-8">
                <input 
                    type="month" 
                    value={selectedMonth}
                    onChange={handleMonthChange}
                    className="border border-gray-500 rounded-lg p-2 text-white bg-[#1A1A1F] focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div> */}

            {/* Cards */}
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                <Card 
                    icon={<FaRupeeSign size={48} className="text-yellow-400" />} 
                    title="Total Cash Collection" 
                    amount={cashCollection.amount} 
                    percentage={cashCollection.percentage} 
                    isUp={cashCollection.isUp}
                />
                <Card 
                    icon={<FaWifi size={48} className="text-blue-500" />} 
                    title="Total Online Collection" 
                    amount={onlineCollection.amount} 
                    percentage={onlineCollection.percentage} 
                    isUp={onlineCollection.isUp}
                />
                <Card 
                    icon={<FaRegCreditCard size={48} className="text-red-400" />} 
                    title="Total Expenses" 
                    amount={expenses.amount} 
                    percentage={expenses.percentage} 
                    isUp={expenses.isUp}
                />
            </div> */}
        </div>
    );
}

function Card({ icon, title, amount, percentage, isUp }) {
    return (
        <div className="flex flex-col items-center p-6 bg-[#1A1A1F] rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center w-full">
                <div className="flex justify-center sm:justify-start pl-10">
                    {icon}
                </div>
                <div className="flex flex-col sm:items-start items-center text-center sm:text-left">
                    <h3 className="text-lg font-semibold text-gray-300 mb-2">{title}</h3>
                    <p className="text-3xl font-bold text-white">{amount}</p>
                    <div className="flex items-center mt-2">
                        {isUp ? (
                            <FaArrowUp size={22} className="text-green-500 mr-2" />
                        ) : (
                            <FaArrowDown size={22} className="text-red-500 mr-2" />
                        )}
                        <p className="text-lg text-gray-300">{percentage} this month</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TotalRevenue;
