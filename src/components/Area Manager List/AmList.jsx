import { useEffect, useState } from "react";
import axios from "axios";
import DataTable from "../DataTable";
import { Toaster, toast } from "react-hot-toast";
import NavbarMain from "../NavbarMain";
import NavbarRouting from "../dashboard/NavbarRouting";

const ArmUserTable = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  // cashData will hold either the ARM object or the OT array
  const [cashData, setCashData] = useState(null);
  const [expenseData, setExpenseData] = useState(null);
  const [showPanel, setShowPanel] = useState(false);
  const [showExpensePanel, setShowExpensePanel] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState("");
  // Filter for ARM collection data
  const [centreIdFilter, setCentreIdFilter] = useState("");
  const [expenseRegionFilter, setExpenseRegionFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [actionLoading, setActionLoading] = useState({});

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${BASE_URL}/api/auth/arm-users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formattedData = response.data.map((user) => ({
  ...user,
  regions: user.regions?.map((r) => r.regionName).join(", ") || "N/A",
}));


        setUserData(formattedData);
        console.log("Fetched ARM Users:", formattedData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch user data.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleViewClick = async (userId) => {
    try {
      const token = localStorage.getItem("token");

      // 🔍 get user info from already loaded list
      const user = userData.find((u) => u.id === userId);
      setSelectedUserName(user?.name || "");

      let apiUrl;

      // 👇 Role based routing logic
      if (user.role === "OT") {
        // API returns an Array of objects with amountPaid, dateSubmitted, submittedBy: { name }
        apiUrl = `${BASE_URL}/api/submitted-cash/submittedTo/${userId}`;
      } else {
        // API returns an Object with totalCollectedAmount and cashCollectionHistory
        apiUrl = `${BASE_URL}/api/cash-collections/user/${userId}`;
      }

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCashData(response.data);
      setSelectedUser(userId);
      setShowPanel(true);
      setShowExpensePanel(false);
      console.log("Fetched Cash Data:", response.data);
    } catch (err) {
      console.error("Failed to fetch user cash data", err);
      toast.error("Unable to load cash data for this user.");
    }
  };

  const handleViewExpenseClick = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${BASE_URL}/api/area-expenses/areaManager/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const user = userData.find((u) => u.id === userId);
      setSelectedUserName(user?.name || "");
      setExpenseData(response.data);
      setSelectedUser(userId);
      setShowExpensePanel(true);
      setShowPanel(false);
    } catch (err) {
      console.error("Failed to fetch user expense data", err);
    }
  };

  const handleVerifyExpense = async (expenseId) => {
    setActionLoading((prev) => ({ ...prev, [expenseId]: true }));

    try {
      const token = localStorage.getItem("token");

      await axios.patch(
  `${BASE_URL}/api/area-expenses/${expenseId}/approve`,
  { verified: true, approvedByHeadOffice: true },

        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refresh expense data
      if (selectedUser) {
        const response = await axios.get(
          `${BASE_URL}/api/area-expenses/${selectedUser}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setExpenseData(response.data);
      }

      // Refresh user data to update cash in hand
      const userResponse = await axios.get(`${BASE_URL}/api/auth/arm-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const formattedData = userResponse.data.map((user) => ({
        ...user,
        regions: user.regions?.map((r) => r.regionName).join(", ") || "N/A",
      }));

      setUserData(formattedData);

      toast.success("Expense verified successfully!");
    } catch (err) {
      console.error("Failed to verify expense", err);
      toast.error("Failed to verify expense");
    } finally {
      setActionLoading((prev) => ({ ...prev, [expenseId]: false }));
    }
  };

  const handleUpdateExpense = async (expenseId, updatedData) => {
    setActionLoading((prev) => ({ ...prev, [expenseId]: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${BASE_URL}/api/area-expenses/${expenseId}`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Expense updated successfully!");

      // Reload page after update
      window.location.reload();
    } catch (err) {
      console.error("Failed to update expense:", err);
      toast.error("Failed to update expense");
    } finally {
      setActionLoading((prev) => ({ ...prev, [expenseId]: false }));
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;

    setActionLoading((prev) => ({ ...prev, [expenseId]: true }));
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${BASE_URL}/api/area-expenses/${expenseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Expense deleted successfully!");

      // Reload page after delete
      window.location.reload();
    } catch (err) {
      console.error("Failed to delete expense:", err);
      toast.error("Failed to delete expense");
    } finally {
      setActionLoading((prev) => ({ ...prev, [expenseId]: false }));
    }
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditExpense, setCurrentEditExpense] = useState(null);
  const [editFormData, setEditFormData] = useState({
    paidTo: "",
    reason: "",
    amount: "",
    // Add more fields as needed
  });
  const [showSummary, setShowSummary] = useState(false);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
  };

  const columns = [
    { label: "Name", key: "name" },
    { label: "Regions", key: "regions" },
    { label: "Role", key: "role" },
    { label: "Cash In Hand ( ₹ )", key: "cashInHand" },
    {
      label: "View Collection",
      key: "action",
      render: (user) => (
        <button
          onClick={() => handleViewClick(user.id)}
          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          View
        </button>
      ),
    },
    {
      label: "View Expenses",
      key: "action",
      render: (user) => (
        <button
          onClick={() => handleViewExpenseClick(user.id)}
          className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          View Expenses
        </button>
      ),
    },
  ];

  // Logic to handle ARM data for filters
  const getUniqueCentreIds = () => {
    if (!cashData?.cashCollectionHistory) return [];
    const centreIds = cashData.cashCollectionHistory
      .map((entry) => entry.centres?.[0]?.centreId)
      .filter(Boolean);
    return [...new Set(centreIds)];
  };

  const getUniqueRegionNames = () => {
    if (!expenseData) return [];
    const regionNames = expenseData
  .map((expense) => expense.regions?.map((r) => r.name))

      .flat()
      .filter(Boolean);
    return [...new Set(regionNames)];
  };

  const getStatusBadge = (expense) => {
    if (expense.verified) {
      return (
        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded">
          Verified
        </span>
      );
    }
    if (expense.approvedByHeadOffice) {
      return (
        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
          HO Approved
        </span>
      );
    }
    if (expense.approvedByRegionalManager) {
      return (
        <span className="px-2 py-1 bg-yellow-600 text-white text-xs rounded">
          RM Approved
        </span>
      );
    }
    return (
      <span className="px-2 py-1 bg-red-600 text-white text-xs rounded">
        Pending
      </span>
    );
  };

  const getVerifyButton = (expense) => {
    const isLoading = actionLoading[expense.id];

    // Don't show button if already verified
    if (expense.verified) {
      return <span className="text-green-500">✓ Verified</span>;
    }

    return (
      <button
        onClick={() => handleVerifyExpense(expense.id)}
        disabled={isLoading}
        className="p-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        title="Verify"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
        )}
      </button>
    );
  };

  // --- Dynamic Data Helpers for Cash Panel ---

  const getCashTableData = () => {
    if (!cashData) return [];

    // Check if data is the 'OT' array structure
    const isOTData =
      Array.isArray(cashData) && cashData.every((item) => "amountPaid" in item);

    if (isOTData) {
      // Process OT data: map to the required column keys
      return [...cashData].reverse().map((entry) => ({
        id: entry.id,
        centreId: {
          // Show submittedBy.name in place of Centre Name
          centreId: "N/A",
          name: entry.submittedBy?.name || "N/A",
          branchName: "N/A",
        },
        amountReceived: entry.amountPaid,
        amountReceivingDate: entry.dateSubmitted,
      }));
    } else if (cashData.cashCollectionHistory) {
      // Process ARM data: apply existing centre filter
      return [...cashData.cashCollectionHistory]
        .reverse()
        .filter((entry) =>
  centreIdFilter
    ? entry.centres?.[0]?.centreId === centreIdFilter
    : true
)
;
    }
    return [];
  };

  // Get the data to display in the Cash Collection table
  const cashTableData = getCashTableData();

  // Calculate total collected amount based on the current data structure
  const totalCollectedAmount = Array.isArray(cashData)
    ? cashData.reduce((sum, entry) => sum + (entry.amountPaid || 0), 0)
    : cashData?.totalCollectedAmount || 0;

  // --- End Dynamic Data Helpers ---

  const filteredData = [...userData]
    .filter((user) =>
      user.name.toLowerCase().includes(nameFilter.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "asc") return a.cashInHand - b.cashInHand;
      if (sortOrder === "desc") return b.cashInHand - a.cashInHand;
      return 0;
    });

  const filteredExpenseData =
    expenseData?.filter((expense) => {
      if (!expenseRegionFilter) return true;
      return expense.regions?.some((r) => r.name === expenseRegionFilter);

    }) || [];

  const totalExpenseAmount = filteredExpenseData.reduce(
    (sum, expense) => sum + (expense.amount || 0),
    0
  );

  if (loading) return <p className="text-white p-4">Loading...</p>;
  if (error) return <p className="text-red-500 p-4">{error}</p>;

  return (
    <div className="w-full min-h-screen bg-[#0D0D11] text-white">
      <NavbarMain />
      <NavbarRouting />
      <Toaster position="top-center" reverseOrder={false} />

      <div className="p-6">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <select
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="px-4 py-2 rounded-md bg-[#1A1A1F] border border-gray-600 text-white w-64"
          >
            <option value="">All Names</option>
            {[...new Set(userData.map((user) => user.name))].map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-4 py-2 rounded-md bg-[#1A1A1F] border border-gray-600 text-white"
          >
            <option value="">Sort by Amount</option>
            <option value="asc">Lowest Amount</option>
            <option value="desc">Highest Amount</option>
          </select>
        </div>

        {/* Table */}
        <div className="h-[650px] overflow-y-auto">
          <DataTable columns={columns} data={filteredData} />
        </div>
      </div>

      {/* Cash Collection Modal */}
      {showPanel && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-[#1A1A1F] p-6 rounded-xl max-w-6xl w-full h-[80vh] relative flex flex-col">
            <button
              onClick={() => setShowPanel(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-red-400"
            >
              ✕
            </button>

            <div className="flex flex-wrap items-center justify-between gap-4 border border-[#2E2E3A] p-4 rounded-4xl mb-4">
              {selectedUserName && (
                <h3 className="text-white font-bold text-lg">
                  Area Manager - {selectedUserName} - Cash Collections
                </h3>
              )}

              <p className="text-white font-medium">
                Total Collected Amount: ₹{" "}
                <span className="text-green-400">
                  {totalCollectedAmount?.toLocaleString() || "0"}
                </span>
              </p>

              {/* Only show center filter if it is NOT the OT array structure */}
              {!Array.isArray(cashData) && (
                <div className="flex items-center gap-2">
                  <select
                    id="centreFilter"
                    value={centreIdFilter}
                    onChange={(e) => setCentreIdFilter(e.target.value)}
                    className="px-3 py-1 rounded border border-gray-600 bg-[#1A1A1F] text-white w-52"
                  >
                    <option value="">All Centres</option>
                    {getUniqueCentreIds().map((id) => (
                      <option key={id} value={id}>
                        {id}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {cashTableData.length > 0 ? (
              <div className="flex-1 overflow-auto rounded-md border border-[#2E2E3A]">
                <table className="min-w-full table-auto text-sm">
                  <thead className="bg-[#6F5FE7] sticky top-0 z-10 text-white">
                    <tr>
                      <th className="px-4 py-2 border border-[#2E2E3A] text-left">
                        Centre ID
                      </th>
                      <th className="px-4 py-2 border border-[#2E2E3A] text-left">
                        Centre Name / Submitted By
                      </th>
                      <th className="px-4 py-2 border border-[#2E2E3A] text-left">
                        Branch Name
                      </th>
                      <th className="px-4 py-2 border border-[#2E2E3A] text-left">
                        Amount (In Rupees)
                      </th>
                      <th className="px-4 py-2 border border-[#2E2E3A] text-left">
                        Collection Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {cashTableData.map((entry) => (
                      <tr key={entry.id} className="hover:bg-[#2E2E3A]">
                        <td className="px-4 py-2 border border-[#2E2E3A]">
                          {entry.centres?.[0]?.centreId || "N/A"}
                        </td>
                        <td className="px-4 py-2 border border-[#2E2E3A]">
                          {/* This will show submittedBy.name for OT users, and centreId.name for ARM users */}
                          {entry.centreId?.name || "N/A"}
                        </td>
                        <td className="px-4 py-2 border border-[#2E2E3A]">
                          {entry.branches?.[0]?.name || "N/A"}
                        </td>
                        <td className="px-4 py-2 border border-[#2E2E3A]">
                          {entry.amountReceived?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-2 border border-[#2E2E3A]">
                          {formatDate(entry.amountReceivingDate) || "N/A"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-white">No cash collection data available.</p>
            )}
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpensePanel && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex justify-center items-center z-50">
          <div className="bg-[#1A1A1F] p-6 rounded-xl max-w-6xl w-full h-[80vh] relative flex flex-col">
            <button
              onClick={() => setShowExpensePanel(false)}
              className="absolute top-4 right-4 text-white text-2xl hover:text-red-400"
            >
              ✕
            </button>

            <div className="flex flex-wrap items-center justify-between gap-4 border border-[#2E2E3A] p-4 rounded-4xl mb-4">
              {selectedUserName && (
                <h3 className="text-white font-bold text-lg">
                  Area Manager - {selectedUserName} - Expenses
                </h3>
              )}

              <p className="text-white font-medium">
                Total Expense Amount: ₹{" "}
                <span className="text-red-400">
                  {totalExpenseAmount?.toLocaleString() || "0"}
                </span>
              </p>

              <div className="flex items-center gap-2">
                <select
                  id="regionFilter"
                  value={expenseRegionFilter}
                  onChange={(e) => setExpenseRegionFilter(e.target.value)}
                  className="px-3 py-1 rounded border border-gray-600 bg-[#1A1A1F] text-white w-52"
                >
                  <option value="">All Regions</option>
                  {getUniqueRegionNames().map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredExpenseData.length > 0 ? (
              <div className="flex-1 overflow-auto rounded-md border border-[#2E2E3A]">
                <table className="min-w-full table-auto text-sm">
                  <thead className="bg-[#6F5FE7] sticky top-0 z-10 text-white">
                    <tr>
                      <th className="px-4 py-2 border border-[#2E2E3A] text-center">
                        paid To
                      </th>
                      <th className="px-4 py-2 border border-[#2E2E3A] text-center">
                        Reason
                      </th>
                      <th className="px-4 py-2 border border-[#2E2E3A] text-center">
                        Amount (₹)
                      </th>
                      <th className="px-4 py-2 border border-[#2E2E3A] text-center">
                        Regions
                      </th>
                      <th className="px-4 py-2 border border-[#2E2E3A] text-center">
                        Branches
                      </th>
                      <th className="px-4 py-2 border border-[#2E2E3A] text-center">
                        Centres
                      </th>
                      <th className="px-4 py-2 border border-[#2E2E3A] text-center">
                        Expense Date
                      </th>

                      <th className="px-4 py-2 border border-[#2E2E3A] text-center">
                        Verify
                      </th>
                      <th className="px-4 py-2 border border-[#2E2E3A] text-center">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...filteredExpenseData].reverse().map((expense) => (
                      <tr key={expense.id} className="hover:bg-[#2E2E3A]">
                        <td className="px-4 py-2 border text-center border-[#2E2E3A]">
                          {expense.paidTo || "N/A"}
                        </td>
                        <td className="px-4 py-2 border text-center border-[#2E2E3A] max-w-xs">
                          <div className="truncate" title={expense.description}>
                            {expense.reason || "N/A"}
                          </div>
                        </td>
                        <td className="px-4 py-2 border text-center border-[#2E2E3A]">
                          {expense.amount?.toLocaleString() || 0}
                        </td>
                        <td className="px-4 py-2 border text-center border-[#2E2E3A]">
                          {expense.regions?.map((r) => r.name).join(", ") ||
                            "N/A"}
                        </td>
                        <td className="px-4 py-2 border text-center border-[#2E2E3A]">
                          {expense.branches?.map((b) => b.name).join(", ") ||
                            "N/A"}
                        </td>
                        <td className="px-4 py-2 border text-center border-[#2E2E3A]">
                          {expense.centres?.map((c) => c.name).join(", ") ||
                            "N/A"}
                        </td>
                        <td className="px-4 py-2 border text-center  border-[#2E2E3A]">
                          {formatDate(expense.expenseDate) || "N/A"}
                        </td>

                        <td className="px-8 py-4 border text-center border-[#2E2E3A]">
                          {getVerifyButton(expense)}
                        </td>
                        <td>
                          <div className="flex space-x-2 justify-center">
                            <button
                              onClick={() => {
                                setCurrentEditExpense(expense);
                                setEditFormData({
                                  paidTo: expense.paidTo || "",
                                  reason: expense.reason || "",
                                  amount: expense.amount || 0,
                                  // Add other fields as needed
                                });
                                setShowEditModal(true);
                              }}
                              disabled={actionLoading[expense.id]}
                              className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white"
                            >
                              Update
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              disabled={actionLoading[expense.id]}
                              className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-white">No expense data available.</p>
            )}
          </div>
        </div>
      )}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
          <div className="bg-[#1A1A1F] p-6 rounded-xl max-w-md w-full relative">
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => {
                setShowEditModal(false);
                setShowSummary(false);
              }}
            >
              ✕
            </button>
            <h3 className="text-white mb-4 font-bold text-lg">Edit Expense</h3>

            {!showSummary ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setShowSummary(true); // Show summary on form submission
                }}
              >
                <label className="block mb-2 text-white">Paid To</label>
                <input
                  type="text"
                  value={editFormData.paidTo}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, paidTo: e.target.value })
                  }
                  className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
                  required
                />

                <label className="block mb-2 text-white">Reason</label>
                <input
                  type="text"
                  value={editFormData.reason}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, reason: e.target.value })
                  }
                  className="w-full mb-4 p-2 rounded bg-gray-700 text-white"
                  required
                />

                <label className="block mb-2 text-white">Amount</label>
                <input
                  type="number"
                  value={editFormData.amount}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full mb-6 p-2 rounded bg-gray-700 text-white"
                  required
                  min="0"
                  step="0.01"
                />

                <button
                  type="submit"
                  className="w-full bg-blue-600 py-2 rounded text-white font-semibold hover:bg-blue-700"
                >
                  Next
                </button>
              </form>
            ) : (
              <div>
                <h4 className="font-semibold mb-2 text-white">
                  Summary of Changes
                </h4>
                <p className="text-white mb-1">
                  <strong>Paid To:</strong> {editFormData.paidTo}
                </p>
                <p className="text-white mb-1">
                  <strong>Reason:</strong> {editFormData.reason}
                </p>
                <p className="text-white mb-4">
                  <strong>Amount:</strong> ₹
                  {editFormData.amount.toLocaleString()}
                </p>

                <div className="flex justify-between">
                  <button
                    onClick={() => setShowSummary(false)}
                    className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      handleUpdateExpense(currentEditExpense.id, editFormData);
                      setShowEditModal(false);
                      setShowSummary(false);
                    }}
                    className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ArmUserTable;
