import axios from "axios";
import { jwtDecode } from "jwt-decode";
import React, { useEffect, useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, Toaster } from "react-hot-toast";
import {
  FaPaperPlane,
  FaHandHoldingUsd,
  FaUser,
  FaArrowRight,
  FaChevronDown,
  FaSearch,
  FaWallet,
} from "react-icons/fa";
import { SlCalender } from "react-icons/sl";
import { useNavigate } from "react-router-dom";

import Settlement from "./Settlement";

// Reusable components (can be moved to their own files)
const CustomInput = ({ value, onClick, placeholder }) => (
  <div className="relative h-full w-full">
    <input
      type="text"
      className="w-full p-3 rounded-lg h-auto border border-gray-600 bg-[#1E1D1D] text-white pr-10 focus:outline-none focus:border-[#6F5FE7] transition-colors"
      value={value || ""}
      onClick={onClick}
      placeholder={value ? "" : placeholder}
      readOnly
    />
    <SlCalender
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer hover:text-[#6F5FE7] transition-colors"
      onClick={onClick}
    />
  </div>
);

// ## MODIFIED COMPONENT ##
const SearchableDropdown = ({ users, selectedUser, onSelect, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (user) => {
    onSelect(user);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 rounded-lg bg-[#1E1D1D] border border-gray-600 text-white text-left flex items-center justify-between hover:border-[#6F5FE7] transition-colors focus:outline-none focus:border-[#6F5FE7]"
      >
        <span className="truncate">
          {selectedUser
            ? `${selectedUser.name} (${selectedUser.role})`
            : placeholder}
        </span>
        <FaChevronDown
          className={`transition-transform duration-200 flex-shrink-0 ml-2 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-1 bg-[#1E1D1D] border border-gray-600 rounded-lg shadow-lg z-50 max-h-64 overflow-hidden">
          <div className="p-3 border-b border-gray-600">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-black border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-[#6F5FE7]"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelect(user)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors duration-150 border-b border-gray-700 last:border-b-0"
                >
                  {/* This is the updated section to show cashInHand */}
                  <div className="flex items-center justify-between w-full">
                    <div>
                      <div className="text-white font-medium truncate">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-400">{user.role}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-cyan-400">
                        Rs. {user.cashInHand?.toLocaleString() ?? "N/A"}
                      </div>
                      <div className="text-xs text-gray-500">Available</div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-gray-400 text-center">
                {searchTerm ? "No users found" : "No users available"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const CashHandoverScreen = () => {
  // 'handover' or 'collection'
  const [transactionType, setTransactionType] = useState("handover");
  const [amountPaid, setAmountPaid] = useState("");
  const [remark, setRemark] = useState("");
  const [dateSubmitted, setDateSubmitted] = useState(new Date());
  const [settlementLoading, setSettlementLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null); // The other party in the transaction

  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      const decoded = jwtDecode(storedToken);
fetchCurrentUser(storedToken, decoded.id);
fetchAllOtherUsers(storedToken);

    }
  }, []);

  const fetchCurrentUser = async (token, userId) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const decoded = jwtDecode(token);

    setCurrentUser({
      ...response.data,
      cashInHand: decoded.cashInHand ?? 0,
    });
  } catch {
    toast.error("Failed to load your user data.");
  }
};


  const fetchAllOtherUsers = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/auth/arm-users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setAllUsers(response.data);
  } catch {
    toast.error("Failed to load list of users.");
  }
};


  const handleSettlementConfirm = async (settlementAmount) => {
    if (!currentUser) return;
    setSettlementLoading(true);
    try {
      await axios.patch(
  `${BASE_URL}/api/submitted-cash/cashinhand/${currentUser.id}`,
  { amount: settlementAmount },
  {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  }
);

      toast.success("Settlement updated successfully!");
      fetchUserById(token); // Refresh user data
    } catch (error) {
      toast.error(error.response?.data?.message || "Settlement failed.");
    } finally {
      setSettlementLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!amountPaid || !dateSubmitted || !selectedUser) {
      toast.error("Please fill amount, date, and select a user.");
      return;
    }
    const amount = parseFloat(amountPaid);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount.");
      return;
    }

    // Dynamic validation for handover
    if (
      transactionType === "handover" &&
      currentUser &&
      amount > currentUser.cashInHand
    ) {
      toast.error(
        `Insufficient cash. Available: Rs. ${currentUser.cashInHand || 0}`
      );
      return;
    }

    // Determine From and To based on transaction type
    // const fromUserId =
    //   transactionType === "handover" ? currentUser.id : selectedUser.id;
    // const toUserId =
    //   transactionType === "handover" ? selectedUser.id : currentUser.id;

    const requestData = {
  amountPaid: amount,
  dateSubmitted: dateSubmitted.toISOString(),
  submittedTo: selectedUser.id,
  remark: remark || "",
};


    try {
      setLoading(true);
      // The backend API endpoint is the same for both actions
      const response = await axios.post(
  `${BASE_URL}/api/submitted-cash/submit`,
  requestData,
  {
    headers: { Authorization: `Bearer ${token}` },
  }
);


      toast.success(
        response.data.message || "Transaction recorded successfully!"
      );

      // Reset form
      setAmountPaid("");
      setRemark("");
      setSelectedUser(null);
      fetchCurrentUser(token, currentUser.id); // Refresh user data

      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Transaction failed.");
    } finally {
      setLoading(false);
    }
  };

  // Dynamic calculation for the balance preview
  const newBalance = (() => {
    if (!currentUser) return 0;
    const currentCash = Number(currentUser.cashInHand) || 0;
    const transactionAmount = parseFloat(amountPaid) || 0;
    return transactionType === "handover"
      ? currentCash - transactionAmount
      : currentCash + transactionAmount;
  })();

  const isHandover = transactionType === "handover";

  return (
    <div className="w-full min-h-screen font-[Plus] bg-black text-white">
      <Toaster position="top-center" />
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex w-full items-center justify-between p-4 md:p-6 lg:p-8 border-b border-gray-800">
          <button
            onClick={() => navigate(-1)}
            className="text-white hover:text-[#6F5FE7] transition-colors p-2 -ml-2"
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
            Cash Transaction
          </div>
          {/* This is the restored history button */}
          <button
            onClick={() => navigate("/cash-handover-history")}
            className="text-white hover:text-[#6F5FE7] transition-colors p-2 -mr-2"
          >
            <FaWallet className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 md:p-6 lg:p-8 space-y-8">
          {/* Transaction Type Toggle */}
          <div className="grid grid-cols-2 gap-4 bg-[#1E1D1D] p-2 rounded-lg border border-gray-700">
            <button
              onClick={() => setTransactionType("handover")}
              className={`w-full p-3 rounded-md text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                isHandover
                  ? "bg-[#6F5FE7] text-white"
                  : "bg-transparent text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FaPaperPlane /> Handover
            </button>
            <button
              onClick={() => setTransactionType("collection")}
              className={`w-full p-3 rounded-md text-center font-medium transition-colors flex items-center justify-center gap-2 ${
                !isHandover
                  ? "bg-[#6F5FE7] text-white"
                  : "bg-transparent text-gray-300 hover:bg-gray-700"
              }`}
            >
              <FaHandHoldingUsd /> Collect
            </button>
          </div>
          {/* Form Fields */}
          <div className="space-y-6">
            <div className="p-6 bg-[#1E1D1D] rounded-lg border border-gray-600">
              <div className="flex items-center mb-4">
                <FaUser className="text-[#6F5FE7] mr-3 text-lg" />
                <span className="text-xl font-medium">
                  {currentUser?.name || "User"}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300 text-lg">Current Cash:</span>
                  <span className="text-[#6F5FE7] text-2xl font-semibold">
                    Rs. {currentUser?.cashInHand?.toLocaleString() || 0}
                  </span>
                </div>
                {amountPaid && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 text-lg">
                        {isHandover
                          ? "Amount to Handover:"
                          : "Amount to Collect:"}
                      </span>
                      <span
                        className={`text-2xl font-semibold ${
                          isHandover ? "text-red-400" : "text-green-400"
                        }`}
                      >
                        {isHandover ? "-" : "+"} Rs.{" "}
                        {parseFloat(amountPaid).toLocaleString() || 0}
                      </span>
                    </div>
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-lg">
                          New Balance:
                        </span>
                        <span
                          className={`text-2xl font-semibold ${
                            newBalance >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          Rs. {newBalance.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-base mb-2 text-gray-300 font-medium">
                  {isHandover ? "Amount to Handover" : "Amount Collected"}
                </label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full p-3 rounded-lg border border-gray-600 bg-[#1E1D1D] text-white focus:outline-none focus:border-[#6F5FE7] transition-colors"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-base mb-2 text-gray-300 font-medium">
                  {isHandover ? "Handover To" : "Collect From"}
                </label>
                <SearchableDropdown
                  users={allUsers}
                  selectedUser={selectedUser}
                  onSelect={setSelectedUser}
                  placeholder="Select user"
                />
              </div>
            </div>
            <div>
              <label className="block text-base mb-2 text-gray-300 font-medium">
                Transaction Date
              </label>
              <DatePicker
                selected={dateSubmitted}
                onChange={(date) => setDateSubmitted(date)}
                customInput={<CustomInput placeholder="Select Date" />}
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div>
              <label className="block text-base mb-2 text-gray-300 font-medium">
                Remarks (Optional)
              </label>
              <textarea
                placeholder="Add any transaction notes..."
                className="w-full p-3 rounded-lg border border-gray-600 bg-[#1E1D1D] text-white focus:outline-none focus:border-[#6F5FE7] transition-colors resize-none"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          {/* Preview and Submit */}
          <div className="space-y-6">
            {selectedUser && amountPaid && (
              <div className="p-6 bg-[#1E1D1D] rounded-lg border border-gray-600">
                <h3 className="text-xl font-medium mb-6 text-center">
                  Transaction Preview
                </h3>
                <div className="flex items-center justify-between">
                  <div className="text-center flex-1">
                    <div
                      className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        isHandover ? "bg-[#6F5FE7]/20" : "bg-red-500/20"
                      }`}
                    >
                      <FaUser
                        className={`${
                          isHandover ? "text-[#6F5FE7]" : "text-red-400"
                        } text-xl`}
                      />
                    </div>
                    <div className="text-sm text-gray-300 mb-1">From</div>
                    <div className="font-medium text-lg">
                      {isHandover ? currentUser.name : selectedUser.name}
                    </div>
                    <div
                      className={`text-sm ${
                        isHandover ? "text-[#6F5FE7]" : "text-red-400"
                      }`}
                    >
                      {isHandover ? "You" : selectedUser.role}
                    </div>
                  </div>
                  <div className="flex flex-col items-center mx-6">
                    <div className="w-12 h-12 bg-[#6F5FE7] rounded-full flex items-center justify-center mb-2">
                      <FaArrowRight className="text-white" />
                    </div>
                    <div className="text-lg font-semibold text-[#6F5FE7]">
                      Rs. {parseFloat(amountPaid).toLocaleString() || 0}
                    </div>
                  </div>
                  <div className="text-center flex-1">
                    <div
                      className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                        isHandover ? "bg-green-500/20" : "bg-[#6F5FE7]/20"
                      }`}
                    >
                      <FaUser
                        className={`${
                          isHandover ? "text-green-400" : "text-[#6F5FE7]"
                        } text-xl`}
                      />
                    </div>
                    <div className="text-sm text-gray-300 mb-1">To</div>
                    <div className="font-medium text-lg">
                      {isHandover ? selectedUser.name : currentUser.name}
                    </div>
                    <div
                      className={`text-sm ${
                        isHandover ? "text-green-400" : "text-[#6F5FE7]"
                      }`}
                    >
                      {isHandover ? selectedUser.role : "You"}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={handleConfirm}
              disabled={
                loading ||
                !amountPaid ||
                !selectedUser ||
                (isHandover && newBalance < 0)
              }
              className="w-full bg-[#6F5FE7] hover:bg-[#5A4FD7] text-white p-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-colors"
            >
              {loading
                ? "Processing..."
                : `Confirm ${isHandover ? "Handover" : "Collection"}`}
            </button>
          </div>

          <Settlement
            onConfirmSettlement={handleSettlementConfirm}
            loading={settlementLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default CashHandoverScreen;
