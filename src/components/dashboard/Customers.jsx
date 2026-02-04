import axios from "axios";
import React, { useEffect, useState } from "react";
import DataTable from "../DataTable";
import { Listbox } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "../Loader";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedBranchCode, setSelectedBranchCode] = useState("");
  const [selectedCenter, setSelectedCenter] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [centerSearchQuery, setCenterSearchQuery] = useState("");

  const columns = [
    { label: "Sr No.", key: "index", render: (_, index) => index + 1 },
    {
      label: "Center Name",
      key: "centreId.name",
      render: (row) => row.centreId || "N/A",
    },
    {
      label: "Area Name",
      key: "centreId.name",
      render: (row) => row.branchName || "N/A",
    },
    {
      label: "Customer Name",
      key: "name",
      render: (row) => (
        <>
          {row.name} <br /> ({row.number})
        </>
      ),
    },
    {
      label: "Service",
      key: "serviceName",
      render: (row) => row.serviceName || "N/A",

    },
    {
      label: "Duration",
      key: "duration",
      render: (row) => (
        <>
          {row.duration} mins.
          <br />
          {row.inTime
            ? new Date(row.inTime).toLocaleTimeString()
            : "N/A"} -{" "}
          {row.outTime ? new Date(row.outTime).toLocaleTimeString() : "N/A"}
        </>
      ),
    },
    {
      label: "Total Cash",
      key: "paymentCash1",
      render: (row) =>
        (row.paymentCash1 || 0) + (row.paymentCash2 || 0) || "N/A",
    },
    {
      label: "Total Online",
      key: "paymentOnline1",
      render: (row) =>
        (row.paymentOnline1 || 0) + (row.paymentOnline2 || 0) || "N/A",
    },
    {
      label: "Total Commission",
      key: "Total Commission",
      render: (row) =>
        (row.onlineCommission || 0) + (row.cashCommission || 0) || "N/A",
    },
    {
      label: "Actions",
      key: "actions",
      render: (row) => (
        <button
          onClick={() => handleDeleteCustomer(row.id)}
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Delete
        </button>
      ),
    },
  ];

  const fetchCustomersForDate = async (date) => {
  setLoading(true);
  const token = localStorage.getItem("token");

  try {
    const formattedDate = date
      ? date.toLocaleDateString("en-CA")
      : new Date().toLocaleDateString("en-CA");

    const response = await axios.get(`${BASE_URL}/api/customers/fast`, {
      params: { date: formattedDate },
      headers: { Authorization: `Bearer ${token}` },
    });

    const customersArray = response.data.customers || [];
    setCustomers(customersArray);
    setFilteredCustomers(customersArray);
  } catch (error) {
    console.error("Error fetching customers:", error);
    setCustomers([]);
    setFilteredCustomers([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    // Fetch customers for the selected date
    fetchCustomersForDate(selectedDate);

    // SSE Setup
    const customerEventSource = new EventSource(`${BASE_URL}/api/customers/events`);

    customerEventSource.onopen = () => {
      console.log("SSE connection established");
    };

    customerEventSource.onmessage = (event) => {
      try {
        const eventData = JSON.parse(event.data);
        if (eventData.customerId) {
  fetchCustomersForDate(selectedDate);
}

      } catch (error) {
        console.error("Error parsing customer SSE data:", error);
      }
    };

    customerEventSource.onerror = (error) => {
      console.error("SSE Error:", error);
      customerEventSource.close();
    };

    return () => {
      customerEventSource.close();
    };
  }, [selectedDate]);

  useEffect(() => {
    let filtered = [...customers];

    if (selectedRegion) {
      filtered = filtered.filter(
  (c) => c.regionName === selectedRegion
);

    }

    if (selectedBranch) {
      filtered = filtered.filter((c) => c.branchName === selectedBranch);
    }

    // if (selectedBranchCode) {
    //   filtered = filtered.filter(
    //     (c) => c.centreId?.centreid == selectedBranchCode
    //   );
    // }

    if (selectedCenter) {
  filtered = filtered.filter(
    (c) => c.centreId === selectedCenter
  );
}



    setFilteredCustomers(filtered);
  }, [
    selectedRegion,
    selectedBranch,
    selectedBranchCode,
    selectedCenter,
    customers,
  ]);

  // Handle date change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    // The useEffect will handle fetching new data when selectedDate changes
  };

  const handleDeleteCustomer = async (customerId) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("Are you sure you want to delete this customer?"))
      return;

    try {
      await axios.delete(`${BASE_URL}/api/customers/${customerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Remove the customer from state
      setCustomers((prev) => prev.filter((c) => c.id !== customerId));
      setFilteredCustomers((prev) => prev.filter((c) => c.id !== customerId));
    } catch (error) {
      console.error("Error deleting customer:", error);
      alert("Failed to delete customer.");
    }
  };

  // Get unique centers
  const centerOptions = [
  { id: "all", value: "", label: "All Centers" },
  ...[...new Set(customers.map((c) => c.centreId))]
    .filter(Boolean)
    .map((center) => ({
      id: center,
      value: center,
      label: center,
    })),
];


  // Filter centers based on search query
  const filteredCenterOptions = centerOptions.filter((center) =>
    center.label.toLowerCase().includes(centerSearchQuery.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="p-5 text-white min-h-screen">
      <p className="text-2xl text-white font-bold mb-5">Customers</p>

      {/* Responsive filter container */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Center Filter */}
        <div className="relative z-20">
          <h3 className="mb-2 text-white">Center Filter</h3>
          <Listbox value={selectedCenter} onChange={setSelectedCenter}>
            <div className="relative">
              <Listbox.Button className="py-2 px-4 w-full bg-[#0D0D11] text-left text-white border border-gray-600 rounded-lg">
                {selectedCenter || "Select Center"}
              </Listbox.Button>
              <Listbox.Options className="absolute max-h-60 w-full overflow-y-auto bg-[#0D0D11] mt-1 border border-gray-700 rounded-lg shadow-lg z-50">
                {/* Search Input */}
                <div className="sticky top-0 bg-[#0D0D11] p-2">
                  <input
                    type="text"
                    placeholder="Search centers..."
                    className="w-full px-3 py-2 bg-[#1A1A24] border border-gray-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={centerSearchQuery}
                    onChange={(e) => setCenterSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()} // Prevent the dropdown from closing when clicking the input
                  />
                </div>

                {filteredCenterOptions.length > 0 ? (
                  filteredCenterOptions.map((center) => (
                    <Listbox.Option
                      key={center.id}
                      value={center.value}
                      className={({ active }) =>
                        `cursor-pointer px-4 py-2 ${
                          active ? "bg-gray-700 text-white" : "text-gray-300"
                        }`
                      }
                    >
                      {center.label}
                    </Listbox.Option>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-400">
                    No centers found
                  </div>
                )}
              </Listbox.Options>
            </div>
          </Listbox>
        </div>

        {/* Date Filter */}
        <div className="relative z-10">
          <h3 className="mb-2 text-white">Date Filter</h3>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="yyyy-MM-dd"
            className="py-2 px-4 w-full bg-[#0D0D11] text-white border border-gray-600 rounded-lg"
            isClearable
            placeholderText="Select a date"
          />
        </div>
      </div>

      {/* Data count display */}
      <div className="mb-4 text-gray-300">
        Showing {filteredCustomers.length} customer
        {filteredCustomers.length !== 1 ? "s" : ""}
      </div>

      {/* Table with scrollbar */}
      <div
        className="relative z-0 overflow-x-auto"
        style={{ maxHeight: "calc(100vh - 250px)" }}
      >
        <div className="overflow-y-auto">
          <DataTable columns={columns} data={filteredCustomers || []} />
        </div>
      </div>
    </div>
  );
};

export default Customers;
