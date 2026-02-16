import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Wallet, Banknote, Calendar, MessageSquare, HandCoins, WalletMinimal } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { jwtDecode } from "jwt-decode";

const AddExtraCash = () => {
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [loading, setLoading] = useState(false);
    const [cashInHand, setCashInHand] = useState(0);
    const [formData, setFormData] = useState({
        amountReceived: "",
        source: "",
        amountReceivedDate: new Date().toISOString().split('T')[0],
        remark: ""
    });

    useEffect(() => {
        fetchUserCash();
    }, []);

    const fetchUserCash = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const decoded = jwtDecode(token);
            const userId = decoded.id || decoded._id;
            const res = await axios.get(`${BASE_URL}/api/auth/arm-users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const me = res.data.find(u => u.id === userId);
            if (me) {
                setCashInHand(me.cashInHand || 0);
            }
        } catch (err) {
            console.error("Error fetching user cash:", err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amountReceived || !formData.source || !formData.amountReceivedDate) {
            toast.error("Please fill all required fields");
            return;
        }

        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            await axios.post(`${BASE_URL}/api/external-cash-collections/`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Extra cash added successfully!");
            setTimeout(() => navigate("/extra-cash-history"), 1500);
        } catch (err) {
            console.error("Error adding extra cash:", err);
            toast.error(err.response?.data?.message || "Failed to add extra cash");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-[Plus]">
            <Toaster position="top-center" />

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
                <button
                    onClick={() => navigate(-1)}
                    className="hover:text-[#6F5FE7]"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-xl font-medium">Add Extra Cash</h1>
                <button
                    onClick={() => navigate("/external-cash-history")}
                    className="p-2 hover:bg-gray-900 rounded-full transition-all"
                    title="History"
                >
                    <WalletMinimal size={20} className="text-white" />
                </button>
            </div>

            {/* Content */}
            <div className="flex items-center justify-center px-4 py-8">
                <div className="w-full max-w-xl space-y-6">
                    {/* Cash In Hand Card */}
                    <div className="bg-[#1E1D1D] border border-gray-600 rounded-lg p-6 flex justify-between items-center">
                        <div>
                            <p className="text-gray-400 text-sm">Cash In Hand</p>
                            <p className="text-3xl font-bold text-[#6F5FE7]">Rs. {Number(cashInHand).toLocaleString()}</p>
                        </div>
                        <div className="p-3 rounded-xl">
                            <Banknote size={28} className="text-[#6F5FE7]" />
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Amount */}
                        <div>
                            <label className="block mb-2 text-gray-300">Amount</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Enter amount"
                                    className="w-full p-3 rounded-lg bg-[#1E1D1D] border border-gray-600 focus:border-[#6F5FE7]"
                                    value={formData.amountReceived}
                                    onChange={(e) => setFormData({ ...formData, amountReceived: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Source */}
                        <div>
                            <label className="block mb-2 text-gray-300">Source</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Personal advance / Adjustment / Other"
                                    className="w-full p-3 rounded-lg bg-[#1E1D1D] border border-gray-600 focus:border-[#6F5FE7]"
                                    value={formData.source}
                                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                       
                       {/* Date */}
                        <div>
                            <label className="block mb-2 text-white text-sm font-normal">Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full px-4 py-3.5 rounded-xl bg-[#1E1D1D] border border-gray-700 text-white focus:border-[#6F5FE7] focus:outline-none transition-all [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-70 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                    value={formData.amountReceivedDate}
                                    onChange={(e) => setFormData({ ...formData, amountReceivedDate: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        {/* Remark */}
                        <div>
                            <label className="block mb-2 text-gray-300">Remark (optional)</label>
                            <textarea
                                placeholder="Any notes..."
                                className="w-full p-3 rounded-lg bg-[#1E1D1D] border border-gray-600 focus:border-[#6F5FE7]"
                                value={formData.remark}
                                onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#6F5FE7] hover:bg-[#5A4FD7] p-4 rounded-lg font-medium disabled:opacity-50"
                        >
                            {loading ? "Processing..." : "Add Extra Cash"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddExtraCash;