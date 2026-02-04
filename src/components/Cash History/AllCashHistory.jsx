import React, { useEffect, useState, useRef } from "react";
import DataTable from "../DataTable";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Loader from "../Loader";
import NavbarMain from "../NavbarMain";
import NavbarRouting from "../dashboard/NavbarRouting";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

// Add custom CSS for date picker and dropdown
const customStyles = `
  .react-datepicker-wrapper {
    display: block;
    width: 100%;
  }
  
  .react-datepicker-popper {
    z-index: 9999 !important;
  }
  
  .react-datepicker {
    font-family: inherit;
    background-color: #1f2937;
    color: white;
    border: 1px solid #4b5563;
    border-radius: 0.5rem;
  }
  
  .react-datepicker__header {
    background-color: #111827;
    border-bottom: 1px solid #4b5563;
  }
  
  .react-datepicker__current-month,
  .react-datepicker__day-name,
  .react-datepicker__day {
    color: white;
  }
  
  .react-datepicker__day:hover {
    background-color: #4b5563;
  }
  
  .react-datepicker__day--selected {
    background-color: #6366f1;
  }

  .custom-dropdown {
    position: relative;
    width: 100%;
  }
  
  .custom-dropdown-button {
    width: 100%;
    min-width: 200px;
    padding: 0.5rem 1rem;
    background-color: #27272a;
    color: white;
    border: 1px solid #6b7280;
    border-radius: 0.5rem;
    text-align: left;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .custom-dropdown-options {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    min-width: 240px;
    max-height: 15rem;
    overflow-y: auto;
    background-color: #1f2937;
    border: 1px solid #6b7280;
    border-radius: 0.5rem;
    z-index: 50;
    margin-top: 0.25rem;
  }
  
  .custom-dropdown-option {
    padding: 0.5rem 1rem;
    cursor: pointer;
  }
  
  .custom-dropdown-option:hover {
    background-color: #374151;
  }

  /* Confirmation Modal Styles */
  .confirmation-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.75);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .confirmation-modal {
    background-color: #1f2937;
    border: 1px solid #4b5563;
    border-radius: 0.75rem;
    padding: 2rem;
    max-width: 400px;
    width: 90%;
    margin: 1rem;
  }

  .confirmation-modal h3 {
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .confirmation-modal p {
    color: #d1d5db;
    margin-bottom: 1.5rem;
    line-height: 1.5;
  }

  .confirmation-modal-buttons {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  .confirmation-modal-button {
    padding: 0.5rem 1.5rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .confirmation-modal-button-cancel {
    background-color: #6b7280;
    color: white;
  }

  .confirmation-modal-button-cancel:hover {
    background-color: #4b5563;
  }

  .confirmation-modal-button-confirm {
    background-color: #dc2626;
    color: white;
  }

  .confirmation-modal-button-confirm:hover {
    background-color: #b91c1c;
  }

  .confirmation-modal-button-verify {
    background-color: #16a34a;
    color: white;
  }

  .confirmation-modal-button-verify:hover {
    background-color: #15803d;
  }
`;

const CashSubmissions = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [submissions, setSubmissions] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSubmittedBy, setSelectedSubmittedBy] = useState("All");
  const [selectedSubmittedTo, setSelectedSubmittedTo] = useState("All");
  const [selectedDate, setSelectedDate] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [submittedByDropdownOpen, setSubmittedByDropdownOpen] = useState(false);
  const [submittedToDropdownOpen, setSubmittedToDropdownOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track if update is from verification toggle
  const isVerificationUpdate = useRef(false);

  // Confirmation modal state
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(null);

  // Calculate unverified amount
  const calculateUnverifiedAmount = () => {
    return filteredData
      .filter((item) => !item.isVerified)
      .reduce((total, item) => total + (parseFloat(item.amountPaid) || 0), 0);
  };

  // Insert stylesheet once on mount
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = customStyles;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    // Add window resize listener
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 640) {
        setItemsPerPage(5);
      } else {
        setItemsPerPage(10);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        submittedByDropdownOpen &&
        !event.target.closest(".submitted-by-dropdown")
      ) {
        setSubmittedByDropdownOpen(false);
      }
      if (
        submittedToDropdownOpen &&
        !event.target.closest(".submitted-to-dropdown")
      ) {
        setSubmittedToDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [submittedByDropdownOpen, submittedToDropdownOpen]);

  // Fetch all submissions (sorted latest first)
  useEffect(() => {
    const fetchSubmissions = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication token is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${BASE_URL}/api/cashRecieve/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        let submissionsData = [];

        if (response.data.data) {
          submissionsData = response.data.data;
        } else if (Array.isArray(response.data)) {
          submissionsData = response.data;
        } else if (response.data.submissions) {
          submissionsData = response.data.submissions;
        }

        // Sort latest entry first by createdAt
        const sortedSubmissions = [...submissionsData].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        setSubmissions(sortedSubmissions);
        setCurrentPage(1);

        if (sortedSubmissions.length === 0) {
          setError(null);
        }
      } catch (error) {
        console.error("Error fetching submissions:", error);

        if (error.response?.data?.message === "No submissions found.") {
          setSubmissions([]);
          setError(null);
        } else {
          const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.error ||
            error.response?.statusText ||
            error.message ||
            "Failed to load submissions.";

          setError(errorMessage);
          setSubmissions([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [BASE_URL]);

  // Filtering effect (submissions already sorted latest-first)
  useEffect(() => {
    let filtered = submissions;

    // Search filtering
    if (searchQuery) {
      const searchValue = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        return (
          item.submittedBy?.name?.toLowerCase().includes(searchValue) ||
          item.submittedTo?.name?.toLowerCase().includes(searchValue) ||
          item.remark?.toLowerCase().includes(searchValue) ||
          item.amountPaid?.toString().includes(searchValue)
        );
      });
    }

    // Date filtering
    if (selectedDate) {
      const formattedSelectedDate = format(selectedDate, "yyyy-MM-dd");
      filtered = filtered.filter((item) => {
        if (!item.createdAt) return false;
        const itemDate = format(new Date(item.createdAt), "yyyy-MM-dd");
        return itemDate === formattedSelectedDate;
      });
    }

    // Submitted By filtering
    if (selectedSubmittedBy !== "All") {
      filtered = filtered.filter((item) => {
        const submittedByName = item.submittedBy?.name || "N/A";
        return submittedByName === selectedSubmittedBy;
      });
    }

    // Submitted To filtering
    if (selectedSubmittedTo !== "All") {
      filtered = filtered.filter((item) => {
        const submittedToName = item.submittedTo?.name || "N/A";
        return submittedToName === selectedSubmittedTo;
      });
    }

    setFilteredData(filtered);

    if (!isVerificationUpdate.current) {
      setCurrentPage(1);
    } else {
      isVerificationUpdate.current = false;
    }
  }, [
    searchQuery,
    selectedDate,
    selectedSubmittedBy,
    selectedSubmittedTo,
    submissions,
  ]);

  // Get unique options
  const submittedByOptions = [
    { label: "All", value: "All" },
    ...Array.from(
      new Set(
        submissions.map((item) => item.submittedBy?.name).filter((name) => name)
      )
    ).map((name) => ({ label: name, value: name })),
  ];

  const submittedToOptions = [
    { label: "All", value: "All" },
    ...Array.from(
      new Set(
        submissions.map((item) => item.submittedTo?.name).filter((name) => name)
      )
    ).map((name) => ({ label: name, value: name })),
  ];

  const selectedSubmittedByObj =
    submittedByOptions.find((person) => person.value === selectedSubmittedBy) ||
    submittedByOptions[0];
  const selectedSubmittedToObj =
    submittedToOptions.find((person) => person.value === selectedSubmittedTo) ||
    submittedToOptions[0];

  const handleSubmittedByChange = (selected) => {
    setSelectedSubmittedBy(selected.value);
    setSubmittedByDropdownOpen(false);
  };

  const handleSubmittedToChange = (selected) => {
    setSelectedSubmittedTo(selected.value);
    setSubmittedToDropdownOpen(false);
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Handle verification confirmation
  const handleVerificationClick = (row) => {
    setPendingVerification(row);
    setShowConfirmationModal(true);
  };

  const handleConfirmVerification = async () => {
    if (!pendingVerification) return;

    const token = localStorage.getItem("token");
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const currentUserId = currentUser?.id;

    if (!token || !currentUserId) {
      alert("Token or user ID not found.");
      setShowConfirmationModal(false);
      setPendingVerification(null);
      return;
    }

    try {
      isVerificationUpdate.current = true;

      const response = await axios.patch(
        `${BASE_URL}/api/cashRecieve/${pendingVerification.id}/verify`,
        {
          isVerified: !pendingVerification.isVerified,
          verifiedBy: currentUserId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedSubmission = response.data.submission;

      // Update submissions and preserve sort order
      setSubmissions((prev) => {
        const updated = prev.map((item) =>
          item.id === pendingVerification.id ? updatedSubmission : item
        );
        return [...updated].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      });

      setShowConfirmationModal(false);
      setPendingVerification(null);
    } catch (error) {
      console.error("Verification update failed:", error);
      alert("Failed to update verification.");
      isVerificationUpdate.current = false;
      setShowConfirmationModal(false);
      setPendingVerification(null);
    }
  };

  const handleCancelVerification = () => {
    setShowConfirmationModal(false);
    setPendingVerification(null);
  };

  const columns = [
    {
      label: "Sr No.",
      key: "srNo",
      render: (_, index) => indexOfFirstItem + index + 1,
    },
    {
      label: "Amount",
      key: "amountPaid",
      render: (row) => row.amountPaid || "N/A",
    },
    {
      label: "Submitted By",
      key: "submittedBy",
      render: (row) => row.submittedBy?.name || "N/A",
      hideOnMobile: true,
    },
    {
      label: "Submitted By Role",
      key: "submittedByRole",
      render: (row) => row.submittedBy?.role || "N/A",
      hideOnMobile: true,
    },
    {
      label: "Submitted To",
      key: "submittedTo",
      render: (row) => row.submittedTo?.name || "N/A",
    },
    {
      label: "Submitted To Role",
      key: "submittedToRole",
      render: (row) => row.submittedTo?.role || "N/A",
      hideOnMobile: true,
    },
    {
      label: "Remarks",
      key: "remark",
      render: (row) => row.remark || "N/A",
      hideOnMobile: true,
    },
    {
      label: "Submission Date",
      key: "createdAt",
      render: (row) =>
        row.createdAt
          ? new Date(row.createdAt).toLocaleString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "Asia/Kolkata",
            })
          : "N/A",
    },
    {
      label: "Is Verified",
      key: "isVerified",
      render: (row) => (
        <button
          onClick={() => handleVerificationClick(row)}
          className={`text-xl px-2 ${
            row.isVerified ? "text-green-500" : "text-red-500"
          }`}
          title={row.isVerified ? "Click to unverify" : "Click to verify"}
        >
          {row.isVerified ? "✅" : "❌"}
        </button>
      ),
    },
    {
      label: "Verified By",
      key: "verifiedBy",
      render: (row) => row.verifiedBy?.name || "N/A",
    },
  ];

  const visibleColumns =
    windowWidth < 768 ? columns.filter((col) => !col.hideOnMobile) : columns;

  if (loading) return <Loader />;

  if (error)
    return (
      <div className="w-full py-5 min-h-screen h-auto bg-[#0D0D11] px-4 md:px-8 lg:px-13">
        <p className="text-2xl font-bold mb-5 text-white">
          Cash Submissions (BSS Role Only)
        </p>
        <div className="bg-red-900/50 p-4 rounded-lg">
          <p className="text-red-200">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );

  return (
    <div className="w-full py-5 min-h-screen h-auto bg-[#0D0D11] px-4 md:px-8 lg:px-13">
      <NavbarMain />
      <NavbarRouting />
      <p className="text-2xl pt-5 font-bold mb-5 text-white">
        Cash Submissions
      </p>

      <div className="flex flex-wrap gap-4 mt-5 mb-5">
        <div className="relative mb-4 md:mb-0 w-full md:w-auto">
          <div
            className="custom-dropdown submitted-by-dropdown"
            style={{ minWidth: "240px" }}
          >
            <button
              className="custom-dropdown-button"
              onClick={() =>
                setSubmittedByDropdownOpen(!submittedByDropdownOpen)
              }
            >
              <span>{selectedSubmittedByObj.label}</span>
              <span className="ml-2">▼</span>
            </button>
            {submittedByDropdownOpen && (
              <div className="custom-dropdown-options text-white">
                {submittedByOptions.map((person) => (
                  <div
                    key={person.value}
                    className="custom-dropdown-option"
                    onClick={() => handleSubmittedByChange(person)}
                  >
                    {person.label}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-auto">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="py-2 px-4 w-full md:w-auto bg-zinc-800 text-white border border-gray-500 rounded-lg"
            isClearable
            placeholderText="Select date"
          />
        </div>

        <input
          type="text"
          placeholder="Search submissions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border bg-zinc-800 border-gray-500 p-2 text-white rounded-lg w-full sm:w-1/2 md:w-1/3"
        />

        {filteredData.length > 0 && (
          <div className="py-2 px-4 w-full md:w-auto bg-zinc-800 text-white border border-gray-500 rounded-lg ml-auto">
            <p className="text-white text-sm">
              Unverified Amount:{" "}
              <span className="font-semibold">
                ₹{calculateUnverifiedAmount().toLocaleString("en-IN")}
              </span>
            </p>
          </div>
        )}
      </div>

      {!loading && filteredData.length === 0 ? (
        <div className="bg-gray-800/50 p-8 rounded-lg text-center">
          <h3 className="text-xl font-semibold mb-2 text-white">
            No BSS Cash Submission Records
          </h3>
          <p className="text-white">
            {selectedSubmittedBy === "All" &&
            selectedSubmittedTo === "All" &&
            !selectedDate &&
            !searchQuery
              ? "There are no cash submission records available for BSS role."
              : "No BSS records found for the selected filters."}
          </p>
          {selectedDate && (
            <p className="text-gray-400 mt-2">
              No BSS records found for {format(selectedDate, "MMMM d, yyyy")}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto text-white">
            <DataTable columns={visibleColumns} data={currentItems} />
          </div>

          {filteredData.length > 0 && (
            <div className="flex flex-wrap items-center justify-between mt-6 mb-4 text-white">
              <div className="mb-2 sm:mb-0">
                <p>
                  Showing {indexOfFirstItem + 1} to{" "}
                  {Math.min(indexOfLastItem, filteredData.length)} of{" "}
                  {filteredData.length} BSS entries
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center p-2 rounded-md ${
                    currentPage === 1
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-[#6F5FE7] hover:bg-[#5A4DD3]"
                  }`}
                >
                  <FiChevronLeft />
                </button>

                <div className="hidden sm:flex space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (page === 1 || page === totalPages) return true;
                      if (Math.abs(page - currentPage) <= 1) return true;
                      return false;
                    })
                    .map((page, index, array) => {
                      if (index > 0 && array[index - 1] !== page - 1) {
                        return (
                          <React.Fragment key={`ellipsis-${page}`}>
                            <span className="px-2">...</span>
                            <button
                              onClick={() => handlePageChange(page)}
                              className={`w-8 h-8 flex items-center justify-center rounded-md ${
                                currentPage === page
                                  ? "bg-[#6F5FE7]"
                                  : "bg-gray-700 hover:bg-gray-600"
                              }`}
                            >
                              {page}
                            </button>
                          </React.Fragment>
                        );
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`w-8 h-8 flex items-center justify-center rounded-md ${
                            currentPage === page
                              ? "bg-[#6F5FE7]"
                              : "bg-gray-700 hover:bg-gray-600"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                </div>

                <span className="sm:hidden">
                  {currentPage} / {totalPages}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center p-2 rounded-md ${
                    currentPage === totalPages
                      ? "bg-gray-700 cursor-not-allowed"
                      : "bg-[#6F5FE7] hover:bg-[#5A4DD3]"
                  }`}
                >
                  <FiChevronRight />
                </button>
              </div>
              <div className="mt-2 sm:mt-0">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-zinc-800 border border-gray-500 text-white p-2 rounded-lg"
                >
                  <option value={5}>5 per page</option>
                  <option value={10}>10 per page</option>
                  <option value={25}>25 per page</option>
                  <option value={50}>50 per page</option>
                </select>
              </div>
            </div>
          )}
        </>
      )}

      {showConfirmationModal && pendingVerification && (
        <div className="confirmation-modal-overlay">
          <div className="confirmation-modal">
            <h3>Confirm Verification Action</h3>
            <p>
              Are you sure you want to{" "}
              <strong>
                {pendingVerification.isVerified ? "unverify" : "verify"}
              </strong>{" "}
              this cash submission of{" "}
              <strong>₹{pendingVerification.amountPaid}</strong> from{" "}
              <strong>{pendingVerification.submittedBy?.name || "N/A"}</strong>?
            </p>
            <div className="confirmation-modal-buttons">
              <button
                className="confirmation-modal-button confirmation-modal-button-cancel"
                onClick={handleCancelVerification}
              >
                Cancel
              </button>
              <button
                className={`confirmation-modal-button ${
                  pendingVerification.isVerified
                    ? "confirmation-modal-button-confirm"
                    : "confirmation-modal-button-verify"
                }`}
                onClick={handleConfirmVerification}
              >
                {pendingVerification.isVerified ? "Unverify" : "Verify"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashSubmissions;
