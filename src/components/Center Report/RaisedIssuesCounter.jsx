import React, { useState, useEffect } from "react";

const RaisedIssuesCounter = ({ customers, selectedDate }) => {
  const [issuesCount, setIssuesCount] = useState(0);

  useEffect(() => {
    const calculateIssuesRaised = () => {
      if (!Array.isArray(customers)) return;

      const issues = customers.filter(customer => {
        const status = customer.status ? customer.status.toLowerCase() : "";
        const isIssue = status && status !== "all ok" && status !== "null";
        if (selectedDate) {
          const customerInDate = customer?.inTime?.slice(0, 10);
          return isIssue && customerInDate === selectedDate;
        }
        return isIssue;
      });

      setIssuesCount(issues.length);
    };

    calculateIssuesRaised();
  }, [customers, selectedDate]);

  return (
    <div className="bg-red-600 text-white p-3 rounded-md shadow-md mb-2 w-64">
      <div className="flex justify-between items-center">
        <span className="font-bold text-lg">Raised Issues:</span>
        <span className="text-lg font-bold">{issuesCount}</span>
      </div>
      <div className="text-xs mt-1">
        {selectedDate 
          ? `Issues raised on (${selectedDate})`
          : "Total issues raised"}
      </div>
    </div>
  );
};

export default RaisedIssuesCounter;
