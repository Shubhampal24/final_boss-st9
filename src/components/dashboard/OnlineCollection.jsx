import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import DataTable from "../DataTable";
import { Listbox } from "@headlessui/react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import Loader from "../Loader";

const OnlineCollection = () => {
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [customers, setCustomers] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState("All");
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(""); // For searching centers

  const columns = [
    { label: "Sr No.", key: "srNo" },
    { label: "Customer Id", key: "customerId" },
    { label: "Center Name", key: "centerName" },
    { label: "Area Name", key: "Area" },
    { label: "1st Payment Amount", key: "firstAmount" },
    { label: "2nd Payment Amount", key: "secondAmount" },
    { label: "Online Commission", key: "totalCommission" },
    { label: "In Time", key: "inTime" },
  ];

  useEffect(() => {
    const fetchCustomers = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Authentication token is missing.");
        setLoading(false);
        return;
      }

      try {
        // Format date as required by API (YYYY-MM-DD)
        const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");

        const response = await axios.get(`${BASE_URL}/api/customer/fast-list`, {
          params: {
            date: formattedDate
          },
          headers: { Authorization: `Bearer ${token}` },
        });

        // Check if response has customers array
        if (response.data && Array.isArray(response.data.customers)) {
          const formattedCustomers = response.data.customers.map((customer, index) => ({
            srNo: index + 1,
            customerId: customer._id,
            centerName: customer.centreId?.centreId || "N/A",
            Area: customer.branchId?.name || "N/A",
            firstAmount: customer.paymentOnline1 || "N/A",
            secondAmount: customer.paymentOnline2 || "N/A",
            totalCommission: customer.onlineCommission || "N/A",
            inTime: formatIndianDate(customer.inTime),
            rawDate: customer.inTime, // Storing raw date for filtering
          }));

          setCustomers(formattedCustomers);
        } else {
          console.error("Unexpected API response format:", response.data);
          setCustomers([]);
        }
      } catch (error) {
        console.error("Error fetching customers:", error);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [BASE_URL, selectedDate]); // Re-fetch when date changes

  const formatIndianDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  // Extract unique center names after we have customer data
  const centerOptions = useMemo(() => {
    return ["All", ...new Set(customers.map((c) => c.centerName).filter(name => name !== "N/A"))];
  }, [customers]);

  // Memoized filtering to optimize performance
  const filteredCenters = useMemo(() => {
    return centerOptions.filter((center) =>
      center.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, centerOptions]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesCenter = selectedCenter === "All" || c.centerName === selectedCenter;

      // If no date selected or date matches
      const matchesDate = !selectedDate ||
        (c.rawDate && new Date(c.rawDate).toDateString() === selectedDate.toDateString());

      return matchesCenter && matchesDate;
    });
  }, [customers, selectedCenter, selectedDate]);

  if (loading) return <Loader />;

  return (
    <div className="p-5 text-white min-h-screen">
      <p className="text-2xl font-bold mb-5">Online Collection</p>

      <div className="flex gap-4 mb-4 flex-wrap">

        <div className="relative z-20"> {/* Higher z-index to ensure dropdown appears above table */}
          <h3 className="mb-2">Centre Filter</h3>
          <Listbox value={selectedCenter} onChange={setSelectedCenter}>
            <Listbox.Button className="py-2 min-w-52 px-4 bg-[#0D0D11] text-left text-white border border-gray-600 rounded-lg">
              {selectedCenter}
            </Listbox.Button>
            <Listbox.Options className="absolute max-h-60 overflow-auto min-w-52 z-30 bg-[#0D0D11] mt-1 border border-gray-700 rounded-lg shadow-lg">

              <div className="sticky top-0 bg-[#0D0D11] z-40">
                <input
                  type="text"
                  placeholder="Search centers"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-10 px-4 text-white bg-[#1a1a1a] border-b border-gray-600 focus:outline-none"
                />
              </div>

              {filteredCenters.map((center) => (
                <Listbox.Option
                  key={center}
                  value={center}
                  className={({ active }) =>
                    `cursor-pointer px-4 py-2 ${active ? "bg-gray-700 text-white" : "text-gray-300"}`
                  }
                >
                  {center}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Listbox>
        </div>
        <div className="z-20"> {/* Higher z-index for date picker too */}
          <h3 className="mb-2">Date Filter</h3>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            dateFormat="yyyy-MM-dd"
            className="py-2 px-4 bg-[#0D0D11] text-white border border-gray-600 rounded-lg"
            isClearable
          />
        </div>
      </div>
      <div className="z-10 relative">
        <div className="overflow-auto max-h-[calc(100vh-220px)] rounded-lg border border-gray-700">
          <DataTable columns={columns} data={filteredCustomers} />
        </div>

        {/* Customer count display */}
        <div className="mt-3 text-gray-300">
          Total Customers: {filteredCustomers.length}
        </div>
      </div>
    </div>
  );
};

export default OnlineCollection;