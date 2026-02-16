import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Filter, Calendar, MessageSquare, IndianRupee, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format } from "date-fns";
import Loader from "../Loader";

const ExtraCashHistory = () => {
    const navigate = useNavigate();
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [totalAmount, setTotalAmount] = useState(0);
    const [isNewestFirst, setIsNewestFirst] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${BASE_URL}/api/external-cash-collections/history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data.data || []);
            console.log(res);
            

            // Calculate total from data
            const total = (res.data.data || []).reduce((sum, item) => sum + Number(item.amountReceived), 0);
            setTotalAmount(total);
        } catch (err) {
            console.error("Error fetching history:", err);
        } finally {
            setLoading(false);
        }
    };

    const sortedHistory = React.useMemo(() => {
        let filtered = history.filter(item =>
            (item.source?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.remark?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (item.amountReceived?.toString().includes(searchTerm))
        );

        return filtered.sort((a, b) => {
            const dateA = new Date(a.amountReceivedDate);
            const dateB = new Date(b.amountReceivedDate);
            return isNewestFirst ? dateB - dateA : dateA - dateB;
        });
    }, [history, searchTerm, isNewestFirst]);

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-black text-white font-[Plus]">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-gray-900">
                <button
                    onClick={() => navigate(-1)}
                    className="hover:text-[#6F5FE7]"
                >
                    <ArrowLeft size={20} />
                </button>
                <h1 className="text-lg font-medium absolute left-1/2 -translate-x-1/2">Extra Cash History</h1>
            </div>

            <div className="px-6 py-6 space-y-4">
                {/* Search & Stats */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Search by source, amount, remark..."
                            className="w-full pl-10 pr-4 py-2 bg-[#1E1D1D] border border-gray-600 rounded-lg focus:border-[#6F5FE7]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="bg-[#1A1A1F] border border-gray-800 px-6 py-4 rounded-xl flex items-center gap-3">
                            <IndianRupee size={20} className="text-[#6F5FE7]" />
                            <span className="text-xl font-black">{totalAmount.toLocaleString()}</span>
                        </div>
                        <button
                            onClick={() => setIsNewestFirst(!isNewestFirst)}
                            className="hover:border-[#6F5FE7] border border-gray-800 px-4 py-3 rounded-xl transition-all flex items-center gap-2 whitespace-nowrap"
                        >
                            <Filter size={18} className={isNewestFirst ? "text-[#6F5FE7]" : "text-white"} />
                            {isNewestFirst ? "Newest First" : "Oldest First"}
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-[#1A1A1F] border border-gray-800 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#6F5FE7]">
                                <tr>
                                    <th className="px-6 py-4 text-sm font-medium text-white">Amount</th>
                                    <th className="px-6 py-4 text-sm font-medium text-white">Source</th>
                                    <th className="px-6 py-4 text-sm font-medium text-white">Date</th>
                                    <th className="px-6 py-4 text-sm font-medium text-white">Remark</th>
                                    <th className="px-6 py-4 text-sm font-medium text-white">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {sortedHistory.length > 0 ? (
                                    sortedHistory.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-900/50 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-base font-semibold text-green-400">₹{Number(item.amountReceived).toLocaleString()}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-300 font-bold">{item.source}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2 text-gray-400 text-sm">
                                                    <Clock size={14} />
                                                    {format(new Date(item.amountReceivedDate), "dd MMM, yyyy")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-gray-400 text-sm line-clamp-1">{item.remark || "—"}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${item.otStatus === 'Verified' ? 'bg-green-500/10 text-green-500' : 'bg-orange-500/10 text-orange-500'
                                                    }`}>
                                                    {item.otStatus === 'Verified' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                    {item.otStatus}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-20 text-center text-gray-500">
                                            No extra cash records found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExtraCashHistory;