import { useState } from "react";

const CashSummary = ({ branchData }) => {
    const [selectedBranch, setSelectedBranch] = useState(null);
  
    return (
      <div className="px-6 w-full py-6 h-auto space-y-3">
        <div className="flex justify-between items-center">
          <span>Previous Balance</span>
          <span className="text-[#6F5FE7]">
            {branchData.previousBalance !== undefined ? `Rs. ${branchData.previousBalance}` : "N/A"} ▸
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Cash in Centre</span>
          <span className="text-[#6F5FE7]">
            {branchData.balance !== undefined ? `Rs. ${branchData.balance}` : "N/A"} ▸
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span>Total</span>
          <span className="text-[#6F5FE7]">
            {branchData.previousBalance !== undefined && branchData.balance !== undefined
              ? `Rs. ${branchData.previousBalance + branchData.balance}`
              : "N/A"} ▸
          </span>
        </div>
      </div>
    );
  };
  
  export default CashSummary;
  