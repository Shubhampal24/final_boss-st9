import axios from "axios";
import React, { useEffect, useState } from "react";
import { Toaster, toast } from "react-hot-toast";
import NavbarRouting from "../dashboard/NavbarRouting";
import Loader from "../Loader";
import NavbarMain from "../NavbarMain";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { ArrowDownToLine } from "lucide-react";

// Define the custom sorting order for regions
const regionSortOrder = [
  "Navi Mumbai",
  "Mumbai",
  "Thane",
  "Kalyan Dombivali",
  "Vasai Virar",
  "Pune",
  "Pimpri Chinchwad",
  "Rest of Maharashtra",
  "Goa",
  "Bengaluru",
  "Karnataka",
  "Delhi",
  "Gujarat",
  "Rajasthan",
  "Uttarpradesh",
  "Uttrakhand",
  "Kerela",
  "Hydrabad",
];

const DailySummary = () => {
  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(getYesterdayDate());
  const [monthFilter, setMonthFilter] = useState("");
  const [filterType, setFilterType] = useState("date"); // "date" or "month"
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const [searchTerm, setSearchTerm] = useState("");

  // Format date as YYYY-MM-DD
  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  const filteredSummaries = summaries.filter((summary) => {
    const search = searchTerm.toLowerCase();
    return (
      summary.centreId.centreId?.toString().toLowerCase().includes(search) ||
      summary.centreId.name?.toLowerCase().includes(search) ||
      summary.centreId.branchName?.toLowerCase().includes(search)
    );
  });

  // Format month as YYYY-MM
  function formatMonth(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  }

  // Get yesterday's date as default
  function getYesterdayDate() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return formatDate(yesterday);
  }

  // Get current month as default
  function getCurrentMonth() {
    return formatMonth(new Date());
  }

  // Helper to format expense reasons from object or string
  const formatExpenseReasons = (data) => {
    if (
      data.expenseReasonsDateWise &&
      typeof data.expenseReasonsDateWise === "object" &&
      data.expenseReasonsDateWise !== null
    ) {
      const entries = Object.entries(data.expenseReasonsDateWise);
      if (entries.length > 0) {
        return entries.map(([date, reason]) => `${date}: ${reason}`).join("\n");
      }
    }
    return data.expenseReasons || "-";
  };

  const fetchDailySummaries = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setLoading(true);
    try {
      let url = `${BASE_URL}/api/dailysummary`;
      const params = new URLSearchParams();

      if (filterType === "date" && dateFilter) {
        params.append("date", dateFilter);
      } else if (filterType === "month" && monthFilter) {
        params.append("month", monthFilter);
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiData = response.data || [];

      const regionOrderMap = new Map(
        regionSortOrder.map((region, index) => [region, index])
      );

      const sortedData = [...apiData].sort((a, b) => {
        const regionA = a.centreId?.regionName || "N/A";
        const regionB = b.centreId?.regionName || "N/A";

        const indexA = regionOrderMap.has(regionA)
          ? regionOrderMap.get(regionA)
          : Infinity;
        const indexB = regionOrderMap.has(regionB)
          ? regionOrderMap.get(regionB)
          : Infinity;

        if (indexA !== indexB) {
          return indexA - indexB;
        }

        const idA = String(a.centreId.centreId);
        const idB = String(b.centreId.centreId);
        return idA.localeCompare(idB, undefined, {
          numeric: true,
          sensitivity: "base",
        });
      });
      setSummaries(sortedData);
    } catch (error) {
      if (error.response?.status === 404) {
        setSummaries([]);
      } else {
        toast.error("Error fetching daily summaries");
      }
    } finally {
      setLoading(false);
    }
  };

  const renderFinalCashTable = ({
    doc,
    startY,
    totals,
    payCriteria,
    periodLabel, // 👈 date or month label
  }) => {
    const paymentCash1 = Number(totals.totalCash || 0);
    const paymentCash2 = 0;
    const cashCommission = Number(totals.totalCashCommission || 0);
    const onlineCommission = Number(totals.totalOnlineCommission || 0);
    const expenses = Number(totals.totalExpense || 0);

    const todaysFinalCash =
      payCriteria === "plus"
        ? paymentCash1 + paymentCash2 + cashCommission - expenses
        : paymentCash1 + paymentCash2 - onlineCommission - expenses;

    autoTable(doc, {
      startY,
      theme: "grid",
      body: [
        ["Total Business (onl + cash)", totals.totalRevenue],
        ["Total Online (cust + com)", totals.grandtotalonline],
        ["Cash Expenses", expenses],
        ["Commission Payable (cash + online)", totals.totalPayCom],
        [`Final Cash in centre`, todaysFinalCash],
      ],
      styles: {
        fontSize: 11,
        cellPadding: 4,
        halign: "right",
      },
      columnStyles: {
        0: { halign: "left", fontStyle: "bold" },
      },
      didParseCell: (data) => {
        // Highlight ONLY final cash row
        if (data.row.index === 4) {
          if (payCriteria === "plus") {
            data.cell.styles.fillColor = [16, 185, 129]; // GREEN
            data.cell.styles.textColor = [255, 255, 255];
          } else {
            data.cell.styles.fillColor = [234, 179, 8]; // YELLOW
            data.cell.styles.textColor = [0, 0, 0];
          }
        }
      },
    });
  };

  // --- RECALCULATION ADDED IN CENTRE REPORT PDF ---
  const downloadCentreReport = async (centreId) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Not authorized");
    try {
      let url = `${BASE_URL}/api/download-report?centreId=${centreId}`;
      if (filterType === "date" && dateFilter) {
        url += `&date=${dateFilter}`;
      } else if (filterType === "month" && monthFilter) {
        url += `&month=${monthFilter}`;
      }
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "json",
      });
      const dataArr = response.data;
      if (!Array.isArray(dataArr) || dataArr.length === 0) {
        toast.error("No data found for this centre.");
        return;
      }
      const doc = new jsPDF("landscape");

      doc.setFontSize(14);
      doc.setTextColor(100);
      const centerHeader = `${dataArr[0].centreId.name} (${dataArr[0].centreId.centreId})`;
      doc.text(centerHeader, 14, 15);

      doc.setFontSize(18);
      doc.setTextColor(0);
      doc.text("Daily Summary Report", 14, 25);

      doc.setFontSize(12);
      const filterText =
        filterType === "date" ? `Date: ${dateFilter}` : `Month: ${monthFilter}`;
      doc.text(filterText, 14, 33);

      const tableColumn = [
        "Sr No.",
        "Date",
        "Net Revenue\n(Business)",
        "Customer\nCount",
        "Cash\nBus.",
        "Online\n(Bus.)",
        "Online\nCom.",
        "Total\nOnline",
        "Cash\nCom.",
        "Total\nPayCom",
        "Expenses",
        "Exp. Reasons",
      ];

      const tableRows = dataArr.map((item, index) => {
        const netRevenue = (item.totalCash || 0) + (item.totalOnline || 0);
        return [
          index + 1,
          item.istDateString
            ? new Date(item.istDateString).toLocaleDateString("en-IN")
            : "N/A",
          "Rs. " + formatCurrencyForPDF(netRevenue),
          item.customerCount || 0,
          "Rs. " + formatCurrencyForPDF(item.totalCash),
          "Rs. " + formatCurrencyForPDF(item.totalOnline),
          "Rs. " + formatCurrencyForPDF(item.totalOnlineCommission),
          "Rs. " + formatCurrencyForPDF(item.grandtotalonline),
          "Rs. " + formatCurrencyForPDF(item.totalCashCommission),
          "Rs. " + formatCurrencyForPDF(item.totalPayCom),
          "Rs. " + formatCurrencyForPDF(item.totalExpense),
          formatExpenseReasons(item),
        ];
      });

      const totals = dataArr.reduce(
        (acc, item) => {
          acc.totalCash += item.totalCash || 0;
          acc.totalOnline += item.totalOnline || 0;
          acc.totalCashCommission += item.totalCashCommission || 0;
          acc.totalOnlineCommission += item.totalOnlineCommission || 0;
          acc.grandtotalonline += item.grandtotalonline || 0;
          acc.totalPayCom += item.totalPayCom || 0;
          acc.totalExpense += item.totalExpense || 0;
          acc.totalCustomerCount += item.customerCount || 0;
          acc.totalRevenue += (item.totalCash || 0) + (item.totalOnline || 0);
          return acc;
        },
        {
          totalCash: 0,
          totalOnline: 0,
          totalCashCommission: 0,
          totalOnlineCommission: 0,
          grandtotalonline: 0,
          totalPayCom: 0,
          totalExpense: 0,
          totalCustomerCount: 0,
          totalRevenue: 0,
        }
      );

      // Add Total Row
      tableRows.push([
        "",
        "Total",
        "Rs. " + formatCurrencyForPDF(totals.totalRevenue),
        totals.totalCustomerCount,
        "Rs. " + formatCurrencyForPDF(totals.totalCash),
        "Rs. " + formatCurrencyForPDF(totals.totalOnline),
        "Rs. " + formatCurrencyForPDF(totals.totalOnlineCommission),
        "Rs. " + formatCurrencyForPDF(totals.grandtotalonline),
        "Rs. " + formatCurrencyForPDF(totals.totalCashCommission),
        "Rs. " + formatCurrencyForPDF(totals.totalPayCom),
        "Rs. " + formatCurrencyForPDF(totals.totalExpense),
        "",
      ]);

      // --- ADDED PROFIT CALCULATION ROW ---
      const netProfit = totals.totalRevenue - totals.totalExpense;
      tableRows.push([
        "",
        "Net Profit\n(Rev - Exp)",
        "Rs. " + formatCurrencyForPDF(netProfit),
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle",
          halign: "center",
        },
        columnStyles: {
          11: { halign: "left", cellWidth: 60 },
        },
        headStyles: {
          fillColor: [111, 95, 231],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        footStyles: {
          fillColor: [50, 50, 50],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        didDrawCell: (data) => {
          // Logic for Net Revenue Color (Index 2)
          if (data.section === "body" && data.column.index === 2) {
            const cellText = data.cell.text && data.cell.text[0];
            if (typeof cellText === "string") {
              const value = parseFloat(cellText.replace(/Rs\.|,/g, "").trim());
              if (!isNaN(value)) {
                if (value >= 0) {
                  data.doc.setTextColor(0, 180, 0);
                } else {
                  data.doc.setTextColor(255, 0, 0);
                }
              }
            }
          }
        },
      });
      const payCriteria = dataArr[0]?.centreId?.payCriteria;

      renderFinalCashTable({
        doc,
        startY: doc.lastAutoTable.finalY + 12,
        totals,
        payCriteria,
      });
      const fileName = `Centre-Report-${dataArr[0].centreId.centreId}-${filterType === "date" ? dateFilter : monthFilter
        }.pdf`;
      doc.save(fileName);
      toast.success("Centre PDF report downloaded!");
    } catch (error) {
      toast.error("Error downloading centre report");
    }
  };

  useEffect(() => {
    if (filterType === "month" && !monthFilter) {
      setMonthFilter(getCurrentMonth());
    }
  }, [filterType]);

  useEffect(() => {
    if (
      (filterType === "date" && dateFilter) ||
      (filterType === "month" && monthFilter)
    ) {
      fetchDailySummaries();
    }
  }, [filterType, dateFilter, monthFilter]);

  const calculateTotals = () => {
    return summaries.reduce(
      (acc, summary) => {
        acc.totalCash += summary.totalCash || 0;
        acc.totalOnline += summary.totalOnline || 0;
        acc.totalCashCommission += summary.totalCashCommission || 0;
        acc.totalOnlineCommission += summary.totalOnlineCommission || 0;
        acc.grandtotalonline +=
          (summary.totalOnline || 0) + (summary.totalOnlineCommission || 0);
        acc.totalPayCom +=
          (summary.totalOnlineCommission || 0) +
          (summary.totalCashCommission || 0);
        acc.totalExpense += summary.totalExpense || 0;
        acc.totalCustomerCount += summary.customerCount || 0;
        acc.totalRevenue +=
          (summary.totalCash || 0) + (summary.totalOnline || 0);
        return acc;
      },
      {
        totalCash: 0,
        totalOnline: 0,
        totalCashCommission: 0,
        totalOnlineCommission: 0,
        grandtotalonline: 0,
        totalPayCom: 0,
        totalExpense: 0,
        totalCustomerCount: 0,
        totalRevenue: 0,
      }
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCurrencyForPDF = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // --- RECALCULATION ADDED IN MAIN SUMMARY PDF ---
  const downloadPDF = () => {
    if (filteredSummaries.length === 0) {
      toast.error("No data to download");
      return;
    }
    try {
      const totals = calculateTotals();
      const doc = new jsPDF("landscape");

      doc.setFontSize(18);
      doc.text("Daily Summary Report", 14, 22);

      doc.setFontSize(12);
      const filterText =
        filterType === "date" ? `Date: ${dateFilter}` : `Month: ${monthFilter}`;
      doc.text(filterText, 14, 30);

      const tableColumn = [
        "Sr No.",
        "Centre ID",
        "Centre Name",
        "Net Revenue\n(Business)",
        "Customer\nCount",
        "Cash\nBus.",
        "Online\n(Bus.)",
        "Online\nCom.",
        "Total\nOnline",
        "Cash\nCom.",
        "Total\nPayCom",
        "Expenses",
        "Exp. Reasons",
      ];

      const tableRows = filteredSummaries.map((summary, index) => {
        const netRevenue =
          (summary.totalCash || 0) + (summary.totalOnline || 0);
        return [
          index + 1,
          summary.centreId.centreId,
          summary.centreId.name,
          "Rs. " + formatCurrencyForPDF(netRevenue),
          summary.customerCount || 0,
          "Rs. " + formatCurrencyForPDF(summary.totalCash),
          "Rs. " + formatCurrencyForPDF(summary.totalOnline),
          "Rs. " + formatCurrencyForPDF(summary.totalOnlineCommission),
          "Rs. " +
          formatCurrencyForPDF(
            (summary.totalOnline || 0) + (summary.totalOnlineCommission || 0)
          ),
          "Rs. " + formatCurrencyForPDF(summary.totalCashCommission),
          "Rs. " +
          formatCurrencyForPDF(
            (summary.totalOnlineCommission || 0) +
            (summary.totalCashCommission || 0)
          ),
          "Rs. " + formatCurrencyForPDF(summary.totalExpense),
          formatExpenseReasons(summary),
        ];
      });

      // Total Row
      tableRows.push([
        "",
        "",
        "Total",
        "Rs. " + formatCurrencyForPDF(totals.totalRevenue),
        totals.totalCustomerCount,
        "Rs. " + formatCurrencyForPDF(totals.totalCash),
        "Rs. " + formatCurrencyForPDF(totals.totalOnline),
        "Rs. " + formatCurrencyForPDF(totals.totalOnlineCommission),
        "Rs. " + formatCurrencyForPDF(totals.grandtotalonline),
        "Rs. " + formatCurrencyForPDF(totals.totalCashCommission),
        "Rs. " + formatCurrencyForPDF(totals.totalPayCom),
        "Rs. " + formatCurrencyForPDF(totals.totalExpense),
        "",
      ]);

      // --- ADDED PROFIT CALCULATION ROW ---
      const grandNetProfit = totals.totalRevenue - totals.totalExpense;
      tableRows.push([
        "",
        "",
        "Net Profit\n(Rev - Exp)", // Label in Centre Name column
        "Rs. " + formatCurrencyForPDF(grandNetProfit), // Value in Net Revenue column
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: "linebreak",
          valign: "middle",
          halign: "center",
        },
        columnStyles: {
          1: { halign: "left" },
          2: { halign: "left" },
          12: { halign: "left", cellWidth: 50 },
        },
        headStyles: {
          fillColor: [111, 95, 231],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        footStyles: {
          fillColor: [50, 50, 50],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          halign: "center",
        },
        didDrawCell: (data) => {
          // Logic to color Net Revenue (Column Index 3)
          // This will also apply to our new Net Profit row because we placed the value in index 3
          if (data.section === "body" && data.column.index === 3) {
            const cellText = data.cell.text && data.cell.text[0];
            if (typeof cellText === "string") {
              const value = parseFloat(cellText.replace(/Rs\.|,/g, "").trim());
              if (!isNaN(value)) {
                if (value >= 0) {
                  data.doc.setTextColor(0, 180, 0);
                } else {
                  data.doc.setTextColor(255, 0, 0);
                }
              }
            }
          }
        },
      });

      const fileName =
        filterType === "date"
          ? `Daily-Summary-${dateFilter}.pdf`
          : `Monthly-Summary-${monthFilter}.pdf`;
      doc.save(fileName);
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Error generating PDF");
    }
  };

  if (loading) return <Loader />;

  // Calculate totals for UI
  const totals = calculateTotals();
  // --- ADDED PROFIT CALCULATION FOR UI ---
  const netProfit = totals.totalRevenue - totals.totalExpense;

  return (
    <div className="w-full py-5 min-h-screen h-auto bg-[#0D0D11] px-13 text-white">
      <Toaster position="top-center" reverseOrder={false} />
      <NavbarMain />
      <NavbarRouting />
     <div className="w-full mt-6 h-auto flex flex-col md:flex-row md:items-center gap-4">
  
  {/* LEFT — Search */}
  <input
    type="text"
    placeholder="Search by Centre ID, Name, Branch"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full md:w-80 py-2.5 px-4 bg-[#1E1E24] text-white rounded-xl border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#6F5FE7] transition-all shadow-lg shadow-black/20"
  />

  {/* RIGHT — Filter + Date/Month + Download */}
  <div className="ml-auto w-full md:w-auto flex flex-row flex-wrap sm:flex-nowrap items-center gap-3 bg-[#1E1E24]/50 p-1.5 rounded-xl border border-white/5 backdrop-blur-sm">
    
    <div className="flex items-center gap-2 px-2">
      <label className="text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
        Filter by
      </label>
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="bg-[#2A2A30] text-white text-sm py-1.5 px-3 rounded-lg border border-white/10 focus:outline-none focus:ring-1 focus:ring-[#6F5FE7] cursor-pointer"
      >
        <option value="date">Date</option>
        <option value="month">Month</option>
      </select>
    </div>
    
    <div className="h-6 w-[1px] bg-white/10 hidden sm:block"></div>
    
    {filterType === "date" && (
      <>
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
          DATE
        </label>
        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="bg-[#2A2A30] text-white text-sm py-1.5 px-3 rounded-lg border border-white/10 focus:outline-none focus:ring-1 focus:ring-[#6F5FE7] cursor-pointer"
        />
      </>
    )}

    {filterType === "month" && (
      <>
        <label className="text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
          MONTH
        </label>
        <input
          type="month"
          value={monthFilter}
          onChange={(e) => setMonthFilter(e.target.value)}
          className="py-2 px-3 bg-[#1E1E24] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6F5FE7]"
        />
      </>
    )}

    {filteredSummaries.length > 0 && (
      <button
        onClick={downloadPDF}
        className="flex items-center gap-2 py-2 px-4 bg-[#6F5FE7] text-white rounded-lg hover:bg-[#5A4DD0] transition duration-300"
      >
        <ArrowDownToLine size={16} />
        Download All Centers Report
      </button>
    )}
  </div>
  
    <div>
        <button className="flex items-center gap-2 py-2 px-4 bg-[#6F5FE7] text-white rounded-lg hover:bg-[#5A4DD0] transition duration-300">
          <ArrowDownToLine size={16} />
          Download Report
          </button>
        </div>
    </div>

      {filteredSummaries.length === 0 ? (
        <div className="mt-10 p-6 text-center bg-[#1E1E24] rounded-lg shadow-md text-gray-400">
          <p className="text-xl mb-2">
            No summary data available for{" "}
            {filterType === "date" ? dateFilter : monthFilter}
          </p>
          <p>
            Try selecting a different {filterType} or check if data has been
            submitted.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto mt-6">
          <div style={{ maxHeight: "800px", overflowY: "auto" }}>
            <table className="w-full text-left border border-gray-600">
              <thead className="sticky top-0 z-10 bg-[#6F5FE7]">
                <tr className="text-center text-white">
                  <th className="py-3 px-4 border">Sr No.</th>
                  <th className="py-3 px-4 border">Centre ID</th>
                  <th className="py-3 px-4 border">Centre Name</th>
                  <th className="py-3 px-4 border">Net Revenue</th>
                  <th className="py-3 px-4 border">Cash Bus.</th>
                  <th className="py-3 px-4 border">Online (Bus.)</th>
                  <th className="py-3 px-4 border">Online Com.</th>
                  <th className="py-3 px-4 border">Total Online</th>
                  <th className="py-3 px-4 border">Cash Com.</th>
                  <th className="py-3 px-4 border">Total PayCom</th>
                  <th className="py-3 px-4 border">Expenses</th>
                  <th className="py-3 px-4 border">Customer Count</th>
                  <th className="py-3 px-4 border">Download Report</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummaries.map((summary, index) => {
                  const netRevenue =
                    (summary.totalCash || 0) + (summary.totalOnline || 0);
                  return (
                    <tr
                      key={summary.id || summary.id}
                      className="border text-center border-gray-600"
                    >
                      <td className="py-3 px-4 border">{index + 1}</td>
                      <td className="py-3 px-4 border">
                        {summary.centreId.centreId?.toString().slice(0, 3)}
                      </td>
                      <td className="py-3 px-4 border">
                        {summary.centreId.name}
                      </td>
                      <td
                        className={`py-3 px-4 border ${netRevenue >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                      >
                        {formatCurrency(netRevenue)}
                      </td>
                      <td className="py-3 px-4 border">
                        {formatCurrency(summary.totalCash)}
                      </td>
                      <td className="py-3 px-4 border">
                        {formatCurrency(summary.totalOnline)}
                      </td>
                      <td className="py-2 px-3 border">
                        {formatCurrency(summary.totalOnlineCommission)}
                      </td>
                      <td className="py-2 px-3 border">
                        {formatCurrency(
                          (summary.totalOnline || 0) +
                          (summary.totalOnlineCommission || 0)
                        )}
                      </td>
                      <td className="py-3 px-4 border">
                        {formatCurrency(summary.totalCashCommission)}
                      </td>
                      <td className="py-2 px-3 border">
                        {formatCurrency(
                          (summary.totalOnlineCommission || 0) +
                          (summary.totalCashCommission || 0)
                        )}
                      </td>
                      <td className="py-3 px-4 border">
                        {formatCurrency(summary.totalExpense)}
                      </td>
                      {/* <td className="py-3 px-4 border text-left text-xs whitespace-pre-wrap">
                                                {formatExpenseReasons(summary)}
                                            </td> */}
                      <td className="py-3 px-4 border">
                        {summary.customerCount || 0}
                      </td>
                      <td className="py-3 px-4 border">
                        <button
                          onClick={() =>
                            downloadCentreReport(summary.centreId.id)
                          }
                          className="bg-[#6F5FE7] hover:bg-[#5A4DD0] text-white px-3 py-1 rounded transition"
                          title="Download Centre Report"
                        >
                          <ArrowDownToLine size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {/* Summary row with totals */}
                <tr className="border text-center border-gray-600 bg-gray-800 font-bold">
                  <td className="py-3 px-4 border" colSpan="3">
                    Total
                  </td>
                  <td
                    className={`py-3 px-4 border ${totals.totalRevenue >= 0
                      ? "text-green-400"
                      : "text-red-400"
                      }`}
                  >
                    {formatCurrency(totals.totalRevenue)}
                  </td>
                  <td className="py-3 px-4 border">
                    {formatCurrency(totals.totalCash)}
                  </td>
                  <td className="py-3 px-4 border">
                    {formatCurrency(totals.totalOnline)}
                  </td>
                  <td className="py-3 px-4 border">
                    {formatCurrency(totals.totalOnlineCommission)}
                  </td>
                  <td className="py-3 px-4 border">
                    {formatCurrency(totals.grandtotalonline)}
                  </td>
                  <td className="py-3 px-4 border">
                    {formatCurrency(totals.totalCashCommission)}
                  </td>
                  <td className="py-3 px-4 border">
                    {formatCurrency(totals.totalPayCom)}
                  </td>
                  <td className="py-3 px-4 border">
                    {formatCurrency(totals.totalExpense)}
                  </td>
                  <td className="py-3 px-4 border"></td>
                  <td className="py-3 px-4 border">
                    {totals.totalCustomerCount}
                  </td>
                  <td className="py-3 px-4 border"></td>
                </tr>

                {/* --- NEW ROW: NET PROFIT CALCULATION --- */}
                <tr className="border text-center border-gray-600 bg-[#252530] font-bold">
                  <td className="py-3 px-4 border text-right" colSpan="3">
                    Net Profit (Revenue - Expenses)
                  </td>
                  <td
                    className={`py-3 px-4 border ${netProfit >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                  >
                    {formatCurrency(netProfit)}
                  </td>
                  <td className="py-3 px-4 border" colSpan="10"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailySummary;
