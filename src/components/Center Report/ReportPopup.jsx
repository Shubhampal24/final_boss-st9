import axios from "axios";
import { useEffect, useRef, useState } from "react";
import PendingEntriesCounter from "./PendingEntriesCounter";
import RaisedIssuesCounter from "./RaisedIssuesCounter";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const SummaryItem = ({ title, value, payCriteria }) => {
  const getBgColor = () => {
    if (title.includes("Today's Final Cash")) {
      return payCriteria === "plus" ? "bg-green-600" : "bg-yellow-600";
    }
    if (title.includes("Today's Cash Balance") && payCriteria === "minus") {
      return "bg-yellow-600";
    }
    return "bg-[#6F5FE7]";
  };
  // Convert value to string to ensure it's a valid React child
  const displayValue =
    typeof value === "object" ? JSON.stringify(value) : String(value || 0);
  return (
    <>
      <div className={`border border-gray-700 ${getBgColor()} p-2`}>
        {title}
      </div>
      <div className="border border-gray-700 p-2">{displayValue}</div>
    </>
  );
};
const AddExpenseForm = ({ onClose, centerIds }) => {
  const [expenseDate, setExpenseDate] = useState("");
  const [paidTo, setPaidTo] = useState("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState(0);
  const [verified, setVerified] = useState(false);
  const [modalStep, setModalStep] = useState("edit"); // 'edit' or 'summary'
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const newExpense = {
        expenseDate,
        paidTo,
        reason,
        amount,
        verified,
        centreIds: centerIds,
      };
      await axios.post(`${API_BASE_URL}/api/expense/add`, newExpense, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Expense added successfully!");
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#1E1E1E] p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Add Expense</h2>

        {modalStep === "edit" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setModalStep("summary");
            }}
            className="space-y-4"
          >
            <div>
              <label className="block mb-2">
                Expense Date:
                <input
                  type="date"
                  value={expenseDate}
                  onChange={(e) => setExpenseDate(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-800 rounded mt-1"
                />
              </label>
            </div>
            <div>
              <label className="block mb-2">
                Paid To:
                <input
                  type="text"
                  value={paidTo}
                  onChange={(e) => setPaidTo(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-800 rounded mt-1"
                />
              </label>
            </div>
            <div>
              <label className="block mb-2">
                Reason:
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full p-2 bg-gray-800 rounded mt-1"
                />
              </label>
            </div>
            <div>
              <label className="block mb-2">
                Amount:
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value))}
                  required
                  className="w-full p-2 bg-gray-800 rounded mt-1"
                />
              </label>
            </div>
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={verified}
                  onChange={(e) => setVerified(e.target.checked)}
                  className="w-4 h-4"
                />
                <span>Verified</span>
              </label>
            </div>
            <div className="flex justify-end gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Next
              </button>
            </div>
          </form>
        ) : (
          <>
            <h3 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
              Summary of Expense
            </h3>
            <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-3 mb-6">
              <div className="flex justify-between bg-gray-900 p-3 rounded">
                <span className="font-semibold text-gray-400">
                  Expense Date:
                </span>
                <span className="text-white">{expenseDate || "-"}</span>
              </div>
              <div className="flex justify-between bg-gray-900 p-3 rounded">
                <span className="font-semibold text-gray-400">Paid To:</span>
                <span className="text-white">{paidTo || "-"}</span>
              </div>
              <div className="flex justify-between bg-gray-900 p-3 rounded">
                <span className="font-semibold text-gray-400">Reason:</span>
                <span className="text-white">{reason || "-"}</span>
              </div>
              <div className="flex justify-between bg-gray-900 p-3 rounded">
                <span className="font-semibold text-gray-400">Amount:</span>
                <span className="text-white">{amount ?? "-"}</span>
              </div>
              <div className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={verified}
                  readOnly
                  className="w-4 h-4"
                />
                <span>Verified</span>
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                type="button"
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                onClick={() => setModalStep("edit")}
              >
                Back
              </button>
              <button
                type="button"
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Expense"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const ReportPopup = ({ selectedReport, closeModal }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const dateInputRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCustomerId, setDeletingCustomerId] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [issueRemark, setIssueRemark] = useState("");
  const [showIssuePopup, setShowIssuePopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalStep, setModalStep] = useState("edit");

  const handleEditFormSubmit = (e) => {
    e.preventDefault();
    setModalStep("summary");
  };
  const formatDateForInput = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };
  const handleIssueToggle = (remark) => {
    setIssueRemark(remark);
    setShowIssuePopup(true);
  };
  const closeIssuePopup = () => {
    setShowIssuePopup(false);
    setIssueRemark("");
  };
  const [centerIds, setCenterIds] = useState([]); // Set this based on your actual data
  const toggleAddExpenseForm = () => {
    setShowAddExpenseForm(!showAddExpenseForm);
  };
  // Add states for edit functionality
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    number: "",
    duration: "",
    paymentCash1: 0,
    paymentCash2: 0,
    paymentOnline1: 0,
    paymentOnline2: 0,
    cashCommission: 0,
    onlineCommission: 0,
    status: "",
  });
  // Add states for expense edit functionality
  const [showExpenseEditModal, setShowExpenseEditModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [expenseFormData, setExpenseFormData] = useState({
    reason: "",
    amount: 0,
  });
  const [expenses, setExpenses] = useState([]);
  // Initialize customers and expenses when selectedReport changes
  useEffect(() => {
    if (selectedReport?.customers) {
      setCustomers(selectedReport.customers);
    }
    if (selectedReport?.expenses) {
      setExpenses(selectedReport.expenses);
    }
  }, [selectedReport]);
  useEffect(() => {
    if (selectedReport?.report?.centerDetails?.id) {
      setCenterIds([selectedReport.report.centerDetails.id]);
    }
  }, [selectedReport]);
  // Update filtered customers when selectedDate or customers change
  useEffect(() => {
    if (selectedDate) {
      setFilteredCustomers(
        customers.filter(
          (customer) => customer?.inTime?.slice(0, 10) === selectedDate
        )
      );
    } else {
      setFilteredCustomers(customers);
    }
  }, [selectedDate, customers]);
  if (!selectedReport) return null;
  const handleDeleteCustomer = async (customerId) => {
    try {
      // Get authentication token
      const token = localStorage.getItem("token"); // Adjust to match your app's token storage

      await axios.delete(`${API_BASE_URL}/api/customer/${customerId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Customer deleted successfully");
      setCustomers((prevCustomers) =>
        prevCustomers.filter((cust) => cust.id !== customerId)
      );
      setShowDeleteConfirm(false);
      setDeletingCustomerId(null);
      window.location.reload();
    } catch (error) {
      console.error("Error deleting customer:", error);
      if (error.response && error.response.status === 401) {
        alert("Authentication error: You may need to log in again.");
      } else {
        alert(`Failed to delete customer: ${error.message}`);
      }
    }
  };
  const confirmDelete = (customerId) => {
    setDeletingCustomerId(customerId);
    setShowDeleteConfirm(true);
  };
  // Handle opening edit modal and setting edit data
  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setEditFormData({
      name: customer.name || "",
      number: customer.number || "",
      duration: customer.duration || "",
      paymentCash1: customer.paymentCash1 || 0,
      paymentCash2: customer.paymentCash2 || 0,
      paymentOnline1: customer.paymentOnline1 || 0,
      paymentOnline2: customer.paymentOnline2 || 0,
      cashCommission: customer.cashCommission || 0,
      onlineCommission: customer.onlineCommission || 0,
      status: customer.status || "",
    });
    setShowEditModal(true);
  };
  // Handle opening expense edit modal and setting expense data
  const handleExpenseEditClick = (expense) => {
    setEditingExpense(expense);
    setExpenseFormData({
      reason: expense.reason || "",
      amount: expense.amount || 0,
      expenseDate: expense.expenseDate || "",
    });
    setShowExpenseEditModal(true);
  };
  // Handle form field changes for customer
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({
      ...editFormData,
      [name]: name.includes("payment") ? parseFloat(value) || 0 : value,
    });
  };
  // Handle form field changes for expense
  const handleExpenseInputChange = (e) => {
    const { name, value } = e.target;
    setExpenseFormData({
      ...expenseFormData,
      [name]: name === "expenseDate" ? value : parseFloat(value) || 0,
      expenseDate: name === "expenseDate" ? value : expenseFormData.expenseDate,
    });
  };
  const handleExpenseAdded = (newExpense) => {
    setExpenses((prev) => [...prev, newExpense]);
  };
  // Handle form submission for updating customer
  const handleUpdateCustomer = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      // Get authentication token from localStorage or wherever it's stored in your app
      const token = localStorage.getItem("token"); // Adjust this to match how your app stores tokens
      // Make API request with authorization header
      await axios.put(
        `${API_BASE_URL}/api/customer/update/${editingCustomer.id}`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Adjust the format based on your API requirements
          },
        }
      );
      // Update the local state
      setCustomers((prevCustomers) =>
        prevCustomers.map((cust) =>
          cust.id === editingCustomer.id ? { ...cust, ...editFormData } : cust
        )
      );
      alert("Customer updated successfully");
      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating customer:", error);
      // More descriptive error message
      if (error.response) {
        if (error.response.status === 401) {
          alert("Authentication error: You may need to log in again.");
        } else {
          alert(
            `Failed to update customer: ${
              error.response.data.message || error.message
            }`
          );
        }
      } else {
        alert(`Failed to update customer: ${error.message}`);
      }
    }
    setLoading(false);
  };
  // Handle form submission for updating expense
  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    try {
      // Get authentication token
      const token = localStorage.getItem("token");
      // Make API request with authorization header
      await axios.put(
        `${API_BASE_URL}/api/expense/${editingExpense.id}`,
        expenseFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update the local state
      setExpenses((prevExpenses) =>
        prevExpenses.map((exp) =>
          exp.id === editingExpense.id ? { ...exp, ...expenseFormData } : exp
        )
      );
      alert("Expense updated successfully");
      setShowExpenseEditModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error updating expense:", error);

      if (error.response) {
        if (error.response.status === 401) {
          alert("Authentication error: You may need to log in again.");
        } else {
          alert(
            `Failed to update expense: ${
              error.response.data.message || error.message
            }`
          );
        }
      } else {
        alert(`Failed to update expense: ${error.message}`);
      }
    }
  };
  // Ensure proper data format for summary values
  const getSummaryValue = (value) => {
    if (value === undefined || value === null) return 0;
    return typeof value === "number" ? value : 0;
  };
  // Calculate business totals correctly
  // const RaisedIssuesCounter = ({ customers }) => {
  //     const count = customers.filter(
  //         cust => cust.status && cust.status.toLowerCase() !== "all ok"
  //     ).length;

  //     return (
  //         <div className="mb-4">
  //             <span className="font-semibold text-white">Total Issues Raised: </span>
  //             <span className="text-red-500 font-bold">{count}</span>
  //         </div>
  //     );
  // };
  const totalBusiness = getSummaryValue(selectedReport.report?.totalSales);
  const totalOnline = getSummaryValue(selectedReport.report?.totalOnline);
  const overallAmount = getSummaryValue(selectedReport.report?.overallAmount);
  const expensesTotal = getSummaryValue(selectedReport.report?.expensesTotal);
  const cashBalance = totalBusiness - totalOnline - expensesTotal;
  const cashCommission = getSummaryValue(selectedReport.report?.cashCommission);
  const onlineComm = getSummaryValue(selectedReport.report?.onlineComm);
  const totalCommission = cashCommission + onlineComm;
  const finalTotal = getSummaryValue(selectedReport.report?.finalTotal);
  const todayExpense = getSummaryValue(selectedReport.report?.todayExpense);
  const overallExpenses = getSummaryValue(
    selectedReport.report?.overallExpenses
  );
  const balance = getSummaryValue(
    selectedReport.report?.centerDetails.balance +
      selectedReport.report?.centerDetails.previousBalance -
      selectedReport.report?.overallExpenses
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-[#121212] text-white p-6 rounded-lg w-full max-w-[90%] max-h-[90vh] overflow-y-auto">
        <div className="w-full flex mb-10 justify-between items-center">
          <h2 className="text-2xl font-bold mb-4 text-center">
            {selectedReport.report?.centerDetails?.centreId
              ? `${selectedReport.report.centerDetails.centreId} (ID: ${selectedReport.report.centerDetails.id})`
              : "No Center Name"}
          </h2>
          {/* <button onClick={toggleAddExpenseForm} className="bg-blue-600 text-white px-4 py-2 rounded">
                        Add Expense
                    </button> */}
        </div>

        {/* {showAddExpenseForm && (
                <AddExpenseForm
                    onClose={toggleAddExpenseForm}
                    centerIds={centerIds}
                    onExpenseAdded={handleExpenseAdded}
                />
            )} */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <PendingEntriesCounter
            customers={filteredCustomers}
            selectedDate={selectedDate}
          />
          <RaisedIssuesCounter
            customers={filteredCustomers}
            selectedDate={selectedDate}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-700">
            <thead className="bg-[#6F5FE7]">
              <tr>
                <th className="border text-center px-4 py-2">Sr no.</th>
                <th className="border text-center px-4 py-2">Client Name</th>
                <th className="border text-center px-4 py-2">Contact No.</th>
                <th className="border text-center px-4 py-2">Duration</th>
                <th className="border text-center px-4 py-2">In Time</th>
                <th className="border text-center px-4 py-2">Out Time</th>
                <th className="border text-center px-4 py-2">Staff Name</th>
                <th className="border text-center px-4 py-2">Cash</th>
                <th className="border text-center px-4 py-2">Online</th>
                <th className="border text-center px-4 py-2">Cash Comm</th>
                <th className="border text-center px-4 py-2">Online Comm</th>
                <th className="border text-center px-4 py-2">Status</th>
                <th className="border text-center px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredCustomers) &&
              filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer, index) => (
                  <tr
                    key={customer.id || index}
                    className="border text-center border-gray-700"
                  >
                    <td className="border text-center px-4 py-2">
                      {index + 1}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {customer?.name || "N/A"}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {customer?.number || "N/A"}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {customer?.duration || "N/A"}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {customer?.inTime
                        ? new Date(customer.inTime).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })
                        : "N/A"}
                    </td>
                    <td
                      className={`border text-center px-4 py-2 ${
                        !customer?.outTime
                          ? "bg-red-100 text-red-800 font-semibold"
                          : ""
                      }`}
                    >
                      {customer?.outTime
                        ? new Date(customer.outTime).toLocaleString("en-IN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          })
                        : "N/A"}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {Array.isArray(customer?.staffAttending) &&
                      customer.staffAttending.length > 0
                        ? customer.staffAttending
                            .map((staff) => staff.name)
                            .join(", ")
                        : "N/A"}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {(customer?.paymentCash1 || 0) +
                        (customer?.paymentCash2 || 0)}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {(customer?.paymentOnline1 || 0) +
                        (customer?.paymentOnline2 || 0)}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {customer?.cashCommission || 0}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {customer?.onlineCommission || 0}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {customer?.status &&
                      customer.status.toLowerCase() !== "all ok" &&
                      customer.status.toLowerCase() !== "null" ? (
                        <button
                          onClick={() =>
                            handleIssueToggle(customer.remark || "No remark")
                          }
                          className="cursor-pointer p-1 rounded hover:bg-red-100 transition duration-200"
                          title="Click to view issue remark"
                          aria-label="Raised Issue"
                          type="button"
                        >
                          {/* Warning triangle SVG icon */}
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-red-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M10.29 3.86L1.82 18a1.007 1.007 0 00.86 1.5h18.64a1.007 1.007 0 00.86-1.5L13.71 3.86a1 1 0 00-1.42 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v4m0 4h.01"
                            />
                          </svg>
                        </button>
                      ) : (
                        customer?.status || "N/A"
                      )}
                    </td>
                    <td className="border text-center px-4 py-2">
                      {customer?.id && (
                        <div className="flex gap-2 justify-center">
                          {/* Edit button logic */}
                          {!customer.outTime ? (
                            <button
                              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                              onClick={() => handleEditClick(customer)}
                              title="Edit entry"
                            >
                              Edit
                            </button>
                          ) : Date.now() -
                              new Date(customer.outTime).getTime() <=
                            3 * 24 * 60 * 60 * 1000 ? (
                            <button
                              className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                              onClick={() => handleEditClick(customer)}
                              title="Edit within 5 days"
                            >
                              Edit
                            </button>
                          ) : (
                            <button
                              className="bg-gray-400 text-gray-700 px-2 py-1 rounded cursor-not-allowed flex items-center gap-1"
                              disabled
                              title="Edit locked after 5 days"
                              style={{ pointerEvents: "none" }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-gray-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 17a1 1 0 001 1h6a1 1 0 001-1V7a1 1 0 00-1-1h-6a1 1 0 00-1 1v10zm-4-8v-2a4 4 0 118 0v2"
                                />
                              </svg>
                              Edit
                            </button>
                          )}
                          {/* Delete button logic similar to Edit button */}
                          {!customer.outTime ? (
                            <button
                              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                              onClick={() => confirmDelete(customer.id)}
                              title="Delete entry"
                            >
                              Delete
                            </button>
                          ) : Date.now() -
                              new Date(customer.outTime).getTime() <=
                            3 * 24 * 60 * 60 * 1000 ? (
                            <button
                              className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                              onClick={() => confirmDelete(customer.id)}
                              title="Delete within 5 days"
                            >
                              Delete
                            </button>
                          ) : (
                            <button
                              className="bg-gray-400 text-gray-700 px-2 py-1 rounded cursor-not-allowed flex items-center gap-1"
                              disabled
                              title="Delete locked after 36 hours"
                              style={{ pointerEvents: "none" }}
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-gray-600"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"
                                />
                              </svg>
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border px-4 py-2 text-center" colSpan="13">
                    No Customers Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Issue Remark Popup */}
        {showIssuePopup && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto bg-[#1E1E1E]/90 backdrop-blur-sm p-6 rounded-lg w-[400px] shadow-lg border border-gray-600">
              <h3 className="text-xl font-bold mb-4 text-white">
                Issue Remark
              </h3>
              <p className="mb-6 whitespace-pre-wrap text-gray-200">
                {issueRemark}
              </p>
              <div className="flex justify-end">
                <button
                  onClick={closeIssuePopup}
                  className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 text-white transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        <div className="w-full flex gap-4 mt-10">
          <div className="w-full lg:w-1/2">
            <button
              onClick={toggleAddExpenseForm}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Add Expense
            </button>
            {showAddExpenseForm && (
              <AddExpenseForm
                onClose={toggleAddExpenseForm}
                centerIds={centerIds}
                onExpenseAdded={handleExpenseAdded}
              />
            )}
            <div className="mt-4 bg-[#6F5FE7] p-2 font-bold">
              Expenditure Details
            </div>
            <div className="overflow-y-auto max-h-[300px] border border-gray-700">
              <table className="w-full border-collapse">
                <thead className="bg-[#6F5FE7] sticky top-0 z-10">
                  <tr>
                    <th className="border px-4 py-2 text-white">Description</th>
                    <th className="border px-4 py-2 text-white">Amount</th>
                    <th className="border px-4 py-2 text-white">Date</th>
                    <th className="border px-4 py-2 text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(expenses) && expenses.length > 0 ? (
                    expenses.map((expense, index) => (
                      <tr key={expense.id || index}>
                        <td className="border text-center px-4 py-2">
                          {expense?.reason || "N/A"}
                        </td>
                        <td className="border text-center px-4 py-2">
                          {expense?.amount || 0}
                        </td>
                        <td className="border text-center px-4 py-2">
                          {expense?.expenseDate
                            ? new Date(expense.expenseDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="border text-center px-4 py-2">
                          {expense?.id &&
                            (!expense.expenseDate ||
                            Date.now() -
                              new Date(expense.expenseDate).getTime() <=
                              3 * 24 * 60 * 60 * 1000 ? (
                              <button
                                className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                onClick={() => handleExpenseEditClick(expense)}
                                title="Edit expense"
                              >
                                Edit
                              </button>
                            ) : (
                              <button
                                className="bg-gray-400 text-gray-700 px-2 py-1 rounded cursor-not-allowed flex items-center gap-1"
                                disabled
                                title="Edit locked after 5 days"
                                style={{ pointerEvents: "none" }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4 text-gray-600"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 17a1 1 0 001 1h6a1 1 0 001-1V7a1 1 0 00-1-1h-6a1 1 0 00-1 1v10zm-4-8v-2a4 4 0 118 0v2"
                                  />
                                </svg>
                                Edit
                              </button>
                            ))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border px-4 py-2 text-center" colSpan="3">
                        No Expenses
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mt-4 w-1/2 grid grid-cols-2 gap-2">
            <SummaryItem
              title="Total Business (onl+csh)- com"
              value={totalBusiness}
            />
            <SummaryItem
              title="Total Online (Onlinecust+Onlinecom)"
              value={totalOnline}
            />
            <SummaryItem title="Cash Expenses" value={expensesTotal} />
            <SummaryItem
              title="Today's Cash Balance (TB-TotalOnline-exp)"
              value={cashBalance}
              payCriteria={selectedReport.report?.centerDetails?.payCriteria}
            />
            <SummaryItem
              title="Commission Payable(cash+online)"
              value={totalCommission}
            />
            {selectedReport.report?.centerDetails?.payCriteria !== "minus" && (
              <>
                <SummaryItem
                  title={`Today's Final Cash ((cashCust+CashComm)-exp) (${
                    selectedReport.report?.centerDetails?.payCriteria || "N/A"
                  })`}
                  value={finalTotal}
                  payCriteria={
                    selectedReport.report?.centerDetails?.payCriteria
                  }
                />
              </>
            )}
            <SummaryItem
              title="Cash In Center"
              value={balance - overallAmount + todayExpense}
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="bg-red-600 cursor-pointer px-4 py-2 rounded-lg"
            onClick={closeModal}
          >
            Close
          </button>
        </div>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#1E1E1E] p-6 rounded-lg w-96">
              <h3 className="text-xl font-bold mb-4">Confirm Delete</h3>
              <p className="mb-6">
                Are you sure you want to delete this customer? This action
                cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingCustomerId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
                  onClick={() => handleDeleteCustomer(deletingCustomerId)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
        {showEditModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#1E1E1E] p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
              {modalStep === "edit" ? (
                <>
                  <h3 className="text-xl font-bold mb-4">Edit Customer</h3>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      setModalStep("summary");
                    }}
                  >
                    <div className="mb-4">
                      <label className="block mb-2">Client Name</label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-gray-800 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-2">Contact Number</label>
                      <input
                        type="text"
                        name="number"
                        value={editFormData.number}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-gray-800 rounded"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block mb-2">Duration</label>
                      <input
                        type="text"
                        name="duration"
                        value={editFormData.duration}
                        onChange={handleInputChange}
                        className="w-full p-2 bg-gray-800 rounded"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block mb-2">Cash Payment 1</label>
                        <input
                          type="number"
                          name="paymentCash1"
                          value={editFormData.paymentCash1}
                          onChange={handleInputChange}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                      </div>
                      <div>
                        <label className="block mb-2">Cash Payment 2</label>
                        <input
                          type="number"
                          name="paymentCash2"
                          value={editFormData.paymentCash2}
                          onChange={handleInputChange}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block mb-2">Online Payment 1</label>
                        <input
                          type="number"
                          name="paymentOnline1"
                          value={editFormData.paymentOnline1}
                          onChange={handleInputChange}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                      </div>
                      <div>
                        <label className="block mb-2">Online Payment 2</label>
                        <input
                          type="number"
                          name="paymentOnline2"
                          value={editFormData.paymentOnline2}
                          onChange={handleInputChange}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block mb-2">Cash Commission</label>
                        <input
                          type="number"
                          name="cashCommission"
                          value={editFormData.cashCommission}
                          onChange={handleInputChange}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                      </div>
                      <div>
                        <label className="block mb-2">Online Commission</label>
                        <input
                          type="number"
                          name="onlineCommission"
                          value={editFormData.onlineCommission}
                          onChange={handleInputChange}
                          className="w-full p-2 bg-gray-800 rounded"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-4 mt-6">
                      <button
                        type="button"
                        className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                        onClick={() => setShowEditModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
                        disabled={loading}
                      >
                        {loading ? <span>Updating...</span> : "Next"}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <>
                  <h3 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
                    Summary of Changes
                  </h3>
                  <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-3">
                    <div className="flex justify-between bg-gray-900 p-3 rounded">
                      <span className="font-semibold text-gray-400">
                        Client Name:
                      </span>
                      <span className="text-white">
                        {editFormData.name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between bg-gray-900 p-3 rounded">
                      <span className="font-semibold text-gray-400">
                        Contact Number:
                      </span>
                      <span className="text-white">
                        {editFormData.number || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between bg-gray-900 p-3 rounded">
                      <span className="font-semibold text-gray-400">
                        Duration:
                      </span>
                      <span className="text-white">
                        {editFormData.duration || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between bg-gray-900 p-3 rounded">
                      <span className="font-semibold text-gray-400">
                        Cash Payment 1:
                      </span>
                      <span className="text-white">
                        {editFormData.paymentCash1 ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between bg-gray-900 p-3 rounded">
                      <span className="font-semibold text-gray-400">
                        Cash Payment 2:
                      </span>
                      <span className="text-white">
                        {editFormData.paymentCash2 ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between bg-gray-900 p-3 rounded">
                      <span className="font-semibold text-gray-400">
                        Online Payment 1:
                      </span>
                      <span className="text-white">
                        {editFormData.paymentOnline1 ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between bg-gray-900 p-3 rounded">
                      <span className="font-semibold text-gray-400">
                        Online Payment 2:
                      </span>
                      <span className="text-white">
                        {editFormData.paymentOnline2 ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between bg-gray-900 p-3 rounded">
                      <span className="font-semibold text-gray-400">
                        Cash Commission:
                      </span>
                      <span className="text-white">
                        {editFormData.cashCommission ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between bg-gray-900 p-3 rounded">
                      <span className="font-semibold text-gray-400">
                        Online Commission:
                      </span>
                      <span className="text-white">
                        {editFormData.onlineCommission ?? "-"}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                      onClick={() => setModalStep("edit")}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
                      onClick={handleUpdateCustomer}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {showExpenseEditModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-[#1E1E1E] p-6 rounded-lg w-[400px] max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-4">Edit Expense</h3>

              {modalStep === "edit" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setModalStep("summary");
                  }}
                >
                  {/* Original form fields */}
                  <div className="mb-4">
                    <label className="block mb-2">Description</label>
                    <input
                      type="text"
                      name="reason"
                      value={expenseFormData.reason}
                      onChange={handleExpenseInputChange}
                      className="w-full p-2 bg-gray-800 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Amount</label>
                    <input
                      type="number"
                      name="amount"
                      value={expenseFormData.amount}
                      onChange={handleExpenseInputChange}
                      className="w-full p-2 bg-gray-800 rounded"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block mb-2">Date</label>
                    <input
                      type="date"
                      name="expenseDate"
                      value={formatDateForInput(expenseFormData.expenseDate)}
                      onChange={handleExpenseInputChange}
                      className="w-full p-2 bg-gray-800 rounded"
                    />
                  </div>
                  {/* Buttons: Cancel & Next */}
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                      onClick={() => {
                        setShowExpenseEditModal(false);
                        setModalStep("edit");
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                    >
                      Next
                    </button>
                  </div>
                </form>
              ) : (
                // Summary View
                <>
                  <h3 className="text-2xl font-bold mb-6 border-b border-gray-700 pb-2">
                    Summary of Changes
                  </h3>
                  {/* Display data plainly or styled as needed */}
                  <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-3">
                    <div className="flex justify-between bg-gray-900 p-3 rounded">
                      <span className="font-semibold text-gray-400">
                        Description:
                      </span>
                      <span className="text-white">
                        {expenseFormData.reason || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between bg-gray-900 p-3 rounded">
                      <span className="font-semibold text-gray-400">
                        Amount:
                      </span>
                      <span className="text-white">
                        {expenseFormData.amount ?? "-"}
                      </span>
                    </div>
                    <div className="flex justify-between bg-gray-900 p-3 rounded">
                      <span className="font-semibold text-gray-400">Date:</span>
                      <span className="text-white">
                        {expenseFormData.expenseDate || "-"}
                      </span>
                    </div>
                  </div>
                  {/* Buttons: Back & Confirm Update */}
                  <div className="flex justify-end gap-4 mt-6">
                    <button
                      type="button"
                      className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
                      onClick={() => setModalStep("edit")}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                      onClick={handleUpdateExpense}
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Update"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ReportPopup;
