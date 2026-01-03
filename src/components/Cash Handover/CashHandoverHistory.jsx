import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaCalendarAlt,
  FaUser,
  FaRupeeSign,
  FaStickyNote,
  FaSearch,
  FaFilter,
} from "react-icons/fa";

const CashCollectionHistory = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);

  // submittedBy (handover)
  const [summaryData, setSummaryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTermBy, setSearchTermBy] = useState("");
  const [sortOrderBy, setSortOrderBy] = useState("desc");

  // submittedTo (received)
  const [submittedToData, setSubmittedToData] = useState([]);
  const [filteredSubmittedToData, setFilteredSubmittedToData] = useState([]);
  const [searchTermTo, setSearchTermTo] = useState("");
  const [sortOrderTo, setSortOrderTo] = useState("desc");

  const [loading, setLoading] = useState(false);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const extractUserIdFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      return decoded._id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const fetchCashSubmissions = async () => {
    if (!userId || !token) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/cashRecieve/submittedBy/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const dataArray = response.data || [];
      setSummaryData(dataArray);
      setFilteredData(dataArray);
    } catch (error) {
      console.error(
        "Error fetching cash submissions:",
        error.response?.data || error.message
      );
      setSummaryData([]);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmittedToSubmissions = async () => {
    if (!userId || !token) return;
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/api/cashRecieve/submittedTo/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const dataArray = response.data || [];
      setSubmittedToData(dataArray);
      setFilteredSubmittedToData(dataArray);
    } catch (error) {
      console.error(
        "Error fetching submissions by submittedTo:",
        error.response?.data || error.message
      );
      setSubmittedToData([]);
      setFilteredSubmittedToData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      setUserId(extractUserIdFromToken(storedToken));
    }
  }, []);

  useEffect(() => {
    if (userId && token) {
      fetchCashSubmissions();
      fetchSubmittedToSubmissions();
    } else {
      setSummaryData([]);
      setFilteredData([]);
      setSubmittedToData([]);
      setFilteredSubmittedToData([]);
    }
  }, [userId, token]);

  useEffect(() => {
    let filtered = [...summaryData];
    if (searchTermBy) {
      filtered = filtered.filter(
        (item) =>
          (item.submittedTo?.name || "")
            .toLowerCase()
            .includes(searchTermBy.toLowerCase()) ||
          (item.remark || "")
            .toLowerCase()
            .includes(searchTermBy.toLowerCase()) ||
          (item.amountPaid || "").toString().includes(searchTermBy)
      );
    }
    filtered.sort((a, b) => {
      const aIsVerified = a.isVerified ?? true;
      const bIsVerified = b.isVerified ?? true;
      if (!aIsVerified && bIsVerified) return -1;
      if (aIsVerified && !bIsVerified) return 1;
      const dateA = new Date(a.dateSubmitted || a.createdAt);
      const dateB = new Date(b.dateSubmitted || b.createdAt);
      return sortOrderBy === "desc" ? dateB - dateA : dateA - dateB;
    });
    setFilteredData(filtered);
  }, [summaryData, searchTermBy, sortOrderBy]);

  useEffect(() => {
    let filtered = [...submittedToData];
    if (searchTermTo) {
      filtered = filtered.filter(
        (item) =>
          (item.submittedBy?.name || "")
            .toLowerCase()
            .includes(searchTermTo.toLowerCase()) ||
          (item.remark || "")
            .toLowerCase()
            .includes(searchTermTo.toLowerCase()) ||
          (item.amountPaid || "").toString().includes(searchTermTo)
      );
    }
    filtered.sort((a, b) => {
      const aIsVerified = a.isVerified ?? true;
      const bIsVerified = b.isVerified ?? true;
      if (!aIsVerified && bIsVerified) return -1;
      if (aIsVerified && !bIsVerified) return 1;
      const dateA = new Date(a.dateSubmitted || a.createdAt);
      const dateB = new Date(b.dateSubmitted || b.createdAt);
      return sortOrderTo === "desc" ? dateB - dateA : dateA - dateB;
    });
    setFilteredSubmittedToData(filtered);
  }, [submittedToData, searchTermTo, sortOrderTo]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) =>
    !amount
      ? "N/A"
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          minimumFractionDigits: 0,
        }).format(amount);

  const toggleSortOrderBy = () =>
    setSortOrderBy((prev) => (prev === "desc" ? "asc" : "desc"));

  const toggleSortOrderTo = () =>
    setSortOrderTo((prev) => (prev === "desc" ? "asc" : "desc"));

  return (
    <div className="flex flex-col w-full min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 lg:p-8 border-b border-gray-800">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-[#6F5FE7] p-2 -ml-2 mr-2 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <div className="text-lg md:text-xl lg:text-2xl font-medium">
            Cash Collection History
          </div>
        </div>
      </div>

      {/* Tables side-by-side */}
      <div className="flex flex-col lg:flex-row gap-8 px-4 md:px-6 lg:px-8 py-6">
        {/* Left Table: Handover */}
        <div className="flex flex-col w-full lg:w-1/2 bg-[#1E1D1D] rounded-lg border border-gray-600">
          {/* Search + Sort */}
          <div className="p-4 border-b border-gray-700">
            <div className="text-lg font-medium mb-4 text-white">
              Cash HandOver History
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 min-w-0">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by recipient, amount, or remarks..."
                  value={searchTermBy}
                  onChange={(e) => setSearchTermBy(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1E1D1D] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#6F5FE7]"
                />
              </div>
              <button
                onClick={toggleSortOrderBy}
                className="flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg bg-[#1E1D1D] hover:border-[#6F5FE7] transition-colors whitespace-nowrap"
              >
                <FaFilter className="mr-2" />
                <span className="hidden sm:inline">
                  {sortOrderBy === "desc" ? "Newest First" : "Oldest First"}
                </span>
                <span className="sm:hidden">Sort</span>
              </button>
            </div>
            {summaryData.length > 0 && (
              <div className="text-sm text-gray-400 mt-2">
                Showing {filteredData.length} of {summaryData.length} transactions
              </div>
            )}
            <div className="flex items-center mt-2 text-[#6F5FE7]">
              <FaRupeeSign />
              <span className="ml-1 font-semibold">
                {formatCurrency(
                  filteredData.reduce(
                    (sum, item) => sum + (parseFloat(item.amountPaid) || 0),
                    0
                  )
                )}
              </span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-[600px]">
            <div className="grid grid-cols-[1.5fr_2fr_1.5fr_3fr] text-white text-sm font-semibold bg-[#6F5FE7] border-b border-gray-700">
              <div className="p-3 border-r border-white/30 text-center">
                Amount
              </div>
              <div className="p-3 border-r border-white/30 text-center">
                Submitted To
              </div>
              <div className="p-3 border-r border-white/30 text-center">
                Date
              </div>
              <div className="p-3 border-r border-white/30 text-center">
                Remarks
              </div>
            </div>
            {filteredData.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No data available.
              </div>
            ) : (
              filteredData.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="grid grid-cols-[1.5fr_2fr_1.5fr_3fr] text-sm border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="p-3 border-r border-gray-700 text-center text-[#6F5FE7] font-medium">
                    {formatCurrency(item.amountPaid)}
                  </div>
                  <div className="p-3 border-r border-gray-700 text-center">
                    <div>{item.submittedTo?.name || "N/A"}</div>
                    <div className="text-xs text-gray-400">
                      {item.submittedTo?.role}
                    </div>
                  </div>
                  <div className="p-3 border-r border-gray-700 text-center">
                    {formatDate(item.dateSubmitted || item.createdAt)}
                  </div>
                  <div className="p-3 border-r border-gray-700 text-center truncate">
                    {item.remark || (
                      <span className="italic text-gray-500">No remarks</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Table: Received */}
        <div className="flex flex-col w-full lg:w-1/2 bg-[#1E1D1D] rounded-lg border border-gray-600">
          <div className="p-4 border-b border-gray-700">
            <div className="text-lg font-medium mb-4 text-white">
              Cash Received History
            </div>
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 min-w-0">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by sender, amount, or remarks..."
                  value={searchTermTo}
                  onChange={(e) => setSearchTermTo(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#1E1D1D] border border-gray-600 rounded-lg text-white focus:outline-none focus:border-[#6F5FE7]"
                />
              </div>
              <button
                onClick={toggleSortOrderTo}
                className="flex items-center justify-center px-4 py-2 border border-gray-600 rounded-lg bg-[#1E1D1D] hover:border-[#6F5FE7] transition-colors whitespace-nowrap"
              >
                <FaFilter className="mr-2" />
                <span className="hidden sm:inline">
                  {sortOrderTo === "desc" ? "Newest First" : "Oldest First"}
                </span>
                <span className="sm:hidden">Sort</span>
              </button>
            </div>
            {submittedToData.length > 0 && (
              <div className="flex items-center mt-2 text-[#6F5FE7]">
                <FaRupeeSign />
                <span className="ml-1 font-semibold">
                  {formatCurrency(
                    filteredSubmittedToData.reduce(
                      (sum, item) => sum + (parseFloat(item.amountPaid) || 0),
                      0
                    )
                  )}
                </span>
              </div>
            )}
          </div>

          <div className="overflow-auto max-h-[600px]">
            <div className="grid grid-cols-[1.5fr_2fr_1.5fr_3fr] text-white text-sm font-semibold bg-[#6F5FE7] border-b border-gray-700">
              <div className="p-3 border-r border-white/30 text-center">
                Amount
              </div>
              <div className="p-3 border-r border-white/30 text-center">
                Submitted By
              </div>
              <div className="p-3 border-r border-white/30 text-center">
                Date
              </div>
              <div className="p-3 border-r border-white/30 text-center">
                Remarks
              </div>
            </div>
            {filteredSubmittedToData.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                No data available.
              </div>
            ) : (
              filteredSubmittedToData.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="grid grid-cols-[1.5fr_2fr_1.5fr_3fr] text-sm border-b border-gray-700 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="p-3 border-r border-gray-700 text-center text-[#6F5FE7] font-medium">
                    {formatCurrency(item.amountPaid)}
                  </div>
                  <div className="p-3 border-r border-gray-700 text-center">
                    <div>{item.submittedBy?.name || "N/A"}</div>
                    <div className="text-xs text-gray-400">
                      {item.submittedBy?.role}
                    </div>
                  </div>
                  <div className="p-3 border-r border-gray-700 text-center">
                    {formatDate(item.dateSubmitted || item.createdAt)}
                  </div>
                  <div className="p-3 border-r border-gray-700 text-center truncate">
                    {item.remark || (
                      <span className="italic text-gray-500">No remarks</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Loading Indicator
const LoadingIndicator = () => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6F5FE7] mb-4"></div>
    <div className="text-center text-gray-400">Loading transactions...</div>
  </div>
);

// No Data Message Component
const NoDataMessage = ({ message, clearSearch, searchTerm }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
      <FaRupeeSign className="text-4xl text-gray-600" />
    </div>
    <div className="text-center text-gray-400 mb-2">{message}</div>
    {searchTerm && clearSearch && (
      <button
        onClick={clearSearch}
        className="text-[#6F5FE7] hover:underline text-sm"
      >
        Clear search
      </button>
    )}
  </div>
);

export default CashCollectionHistory;
