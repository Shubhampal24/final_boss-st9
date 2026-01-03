import React, { useState, useEffect } from "react";

const PendingEntriesCounter = ({ customers, selectedDate }) => {
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Filter customers to find those that are pending (no outTime)
    const calculatePendingEntries = () => {
      if (!Array.isArray(customers)) return;

      const pending = customers.filter(customer => {
        // If selectedDate is provided, only count entries from that date
        if (selectedDate) {
          const customerInDate = customer?.inTime?.slice(0, 10);
          return customerInDate === selectedDate && (!customer.outTime || customer.status === "active");
        }

        // If no date filter, count all pending entries
        return !customer.outTime || customer.status === "active";
      });

      setPendingCount(pending.length);
    };

    calculatePendingEntries();
  }, [customers, selectedDate]);

  return (
    <div className="bg-yellow-600 text-white p-3 rounded-md shadow-md mb-2 w-64">
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg">Pending Checkouts:</span>
        <span className="text-lg font-bold">{pendingCount}</span>
      </div>
      <div className="text-xs mt-1">
        {selectedDate 
          ? `Not checked out (${selectedDate})`
          : "Total pending checkouts"}
      </div>
    </div>
  );
};

export default PendingEntriesCounter;