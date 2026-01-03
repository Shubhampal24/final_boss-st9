import React, { useState } from "react";

const Settlement = ({ onConfirmSettlement, loading }) => {
  const [settlementValue, setSettlementValue] = useState("");

  const handleConfirm = () => {
    if (settlementValue && parseFloat(settlementValue) > 0) {
      onConfirmSettlement(settlementValue);
      setSettlementValue("");
    }
  };

  return (
    <div className="p-4 bg-[#1E1D1D] rounded-lg border border-gray-600 mb-6">
      <label className="block text-base mb-3 text-gray-300 font-medium">Settlement</label>
      <input
        type="number"
        placeholder="Enter settlement amount"
        className="w-full p-3 rounded-lg border border-gray-600 bg-[#232323] text-white text-lg focus:outline-none focus:border-[#6F5FE7] transition-colors mb-4"
        value={settlementValue}
        onChange={e => setSettlementValue(e.target.value)}
        min={0}
      />
      <button
        onClick={handleConfirm}
        disabled={loading || !settlementValue || parseFloat(settlementValue) <= 0}
        className="w-full bg-[#6F5FE7] hover:bg-[#5A4FD7] text-white p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
      >
        {loading ? "Processing..." : "Confirm Settlement"}
      </button>
    </div>
  );
};

export default Settlement;