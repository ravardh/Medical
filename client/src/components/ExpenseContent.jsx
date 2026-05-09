import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import { FiSend, FiRefreshCw, FiCheck } from "react-icons/fi";

const ExpenseContent = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState(null); // null | "saving" | "saved"
  const autoSaveTimer = useRef(null);
  const isFirstLoad = useRef(true);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const years = [];
  for (let i = new Date().getFullYear(); i >= 2020; i--) years.push(i);

  // Filter months based on selected year
  const getAvailableMonths = () => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // getMonth() returns 0-11, so add 1

    if (selectedYear === currentYear) {
      // For current year, only show months up to current month
      return months.slice(0, currentMonth);
    } else {
      // For previous years, show all months
      return months;
    }
  };

  const availableMonths = getAvailableMonths();

  useEffect(() => {
    isFirstLoad.current = true;
    fetchExpense();
  }, [selectedMonth, selectedYear]);

  // Handle month validation when year changes
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // If current year is selected and selected month is beyond current month,
    // reset to current month
    if (selectedYear === currentYear && selectedMonth > currentMonth) {
      setSelectedMonth(currentMonth);
    }
  }, [selectedYear]);

  // Auto-save whenever expense entries change (after first load)
  useEffect(() => {
    if (!expense || isFirstLoad.current) return;
    if (expense.status !== "draft" && expense.status !== "rejected") return;

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    setAutoSaveStatus("saving");

    autoSaveTimer.current = setTimeout(() => {
      autoSave(expense);
    }, 1500);

    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [expense?.entries]);

  const fetchExpense = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/mr/expenses/${selectedMonth}/${selectedYear}`, {
        withCredentials: true,
      });
      setExpense(res.data);
      setAutoSaveStatus(null);
      isFirstLoad.current = false;
    } catch (error) {
      console.error("Error fetching expense:", error);
      toast.error("Failed to fetch expense statement");
    } finally {
      setLoading(false);
    }
  };

  const autoSave = async (currentExpense) => {
    if (!currentExpense?._id) return;
    try {
      // Preserve existing status during auto-save — don't overwrite "rejected" with "draft"
      await axios.put(`/mr/expenses/${currentExpense._id}`, {
        entries: currentExpense.entries,
        status: currentExpense.status,
      }, { withCredentials: true });
      setAutoSaveStatus("saved");
      setTimeout(() => setAutoSaveStatus(null), 2000);
    } catch (error) {
      console.error("Auto-save failed:", error);
      setAutoSaveStatus(null);
    }
  };

  const handleEntryChange = (index, field, value) => {
    setExpense((prev) => {
      const updated = { ...prev, entries: prev.entries.map((e, i) => i !== index ? e : { ...e }) };
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        updated.entries[index] = {
          ...updated.entries[index],
          [parent]: { ...updated.entries[index][parent], [child]: parseFloat(value) || 0 },
        };
      } else {
        updated.entries[index] = {
          ...updated.entries[index],
          [field]: field === "place" || field === "remark" ? value : parseFloat(value) || 0,
        };
      }
      recalculate(updated);
      return updated;
    });
  };

  const handleToggleLeave = (index) => {
    setExpense((prev) => {
      const updated = { ...prev, entries: prev.entries.map((e, i) => i !== index ? e : { ...e }) };
      const wasLeave = updated.entries[index].isLeave;
      updated.entries[index] = {
        ...updated.entries[index],
        isLeave: !wasLeave,
        isHoliday: false,
        place: !wasLeave ? "Leave" : "",
        fare: !wasLeave ? 0 : updated.entries[index].fare,
        dailyAllowance: !wasLeave ? { hq: 0, ex: 0, os: 0 } : updated.entries[index].dailyAllowance,
        otherExpenses: !wasLeave ? 0 : updated.entries[index].otherExpenses,
      };
      recalculate(updated);
      return updated;
    });
  };

  const handleToggleHoliday = (index) => {
    setExpense((prev) => {
      const updated = { ...prev, entries: prev.entries.map((e, i) => i !== index ? e : { ...e }) };
      const wasHoliday = updated.entries[index].isHoliday;
      updated.entries[index] = {
        ...updated.entries[index],
        isHoliday: !wasHoliday,
        isLeave: false,
        place: !wasHoliday ? "Holiday" : "",
        fare: !wasHoliday ? 0 : updated.entries[index].fare,
        dailyAllowance: !wasHoliday ? { hq: 0, ex: 0, os: 0 } : updated.entries[index].dailyAllowance,
        otherExpenses: !wasHoliday ? 0 : updated.entries[index].otherExpenses,
      };
      recalculate(updated);
      return updated;
    });
  };

  const recalculate = (expenseData) => {
    const totals = { fare: 0, hq: 0, ex: 0, os: 0, otherExpenses: 0, grandTotal: 0 };
    const summary = { atHQ: 0, atExStn: 0, atOutStn: 0, leaveTaken: 0, holiday: 0, total: expenseData.entries.length };

    expenseData.entries.forEach((entry) => {
      totals.fare += entry.fare || 0;
      totals.hq += entry.dailyAllowance?.hq || 0;
      totals.ex += entry.dailyAllowance?.ex || 0;
      totals.os += entry.dailyAllowance?.os || 0;
      totals.otherExpenses += entry.otherExpenses || 0;

      if (entry.isLeave) {
        summary.leaveTaken += 1;
      } else if (entry.isHoliday) {
        summary.holiday += 1;
      } else if (entry.place) {
        if (entry.dailyAllowance?.hq > 0) summary.atHQ += 1;
        if (entry.dailyAllowance?.ex > 0) summary.atExStn += 1;
        if (entry.dailyAllowance?.os > 0) summary.atOutStn += 1;
      }
    });

    totals.grandTotal = totals.fare + totals.hq + totals.ex + totals.os + totals.otherExpenses;
    expenseData.totals = totals;
    expenseData.summary = summary;
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      // Cancel any pending auto-save first
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      await axios.put(`/mr/expenses/${expense._id}`, {
        entries: expense.entries,
        dateOfPosting: new Date(),
        status: "submitted",
      }, { withCredentials: true });
      toast.success("Expense statement submitted for review");
      fetchExpense();
    } catch (error) {
      console.error("Error submitting expense:", error);
      toast.error(error.response?.data?.message || "Failed to submit expense statement");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncPlaces = async () => {
    try {
      setSyncing(true);
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
      const res = await axios.post(`/mr/expenses/${expense._id}/sync`, {}, { withCredentials: true });
      setExpense(res.data);
      setAutoSaveStatus(null);
      isFirstLoad.current = false;
      toast.success("Places synced from daily call reports!");
    } catch (error) {
      console.error("Error syncing places:", error);
      toast.error(error.response?.data?.message || "Failed to sync places");
    } finally {
      setSyncing(false);
    }
  };

  const entryTotal = (entry) =>
    (entry.fare || 0) +
    (entry.dailyAllowance?.hq || 0) +
    (entry.dailyAllowance?.ex || 0) +
    (entry.dailyAllowance?.os || 0) +
    (entry.otherExpenses || 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!expense) {
    return <div className="text-center py-8 text-gray-500">No expense data available</div>;
  }

  const canEdit = expense.status === "draft" || expense.status === "rejected";

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Expense Statement</h2>

          {/* Auto-save indicator - Mobile optimized */}
          {canEdit && autoSaveStatus && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              {autoSaveStatus === "saving" && (
                <><span className="animate-pulse">⏳</span> Saving...</>
              )}
              {autoSaveStatus === "saved" && (
                <><FiCheck className="text-green-500" /> Saved</>
              )}
            </span>
          )}
        </div>

        {/* Month/Year Selectors - Full width on mobile */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {availableMonths.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
          >
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Action buttons */}
          {canEdit && (
            <>
              <button
                onClick={handleSyncPlaces}
                disabled={syncing}
                className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 active:scale-95 transition-transform"
                title="Auto-fill places from daily call reports"
              >
                <FiRefreshCw className={syncing ? "animate-spin" : ""} size={16} />
                <span className="hidden sm:inline">{syncing ? "Syncing..." : "Sync Places"}</span>
                <span className="sm:hidden">{syncing ? "Syncing..." : "Sync"}</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`flex items-center justify-center gap-2 px-4 py-2 text-sm sm:text-base text-white rounded-lg disabled:bg-gray-400 active:scale-95 transition-transform ${
                  expense.status === "rejected"
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                <FiSend size={16} />
                <span className="hidden sm:inline">
                  {submitting
                    ? (expense.status === "rejected" ? "Resubmitting..." : "Submitting...")
                    : (expense.status === "rejected" ? "Resubmit for Review" : "Submit for Review")}
                </span>
                <span className="sm:hidden">
                  {submitting
                    ? (expense.status === "rejected" ? "Resubmit..." : "Submit...")
                    : (expense.status === "rejected" ? "Resubmit" : "Submit")}
                </span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Rejection Banner */}
      {expense.status === "rejected" && (
        <div className="mb-4 p-3 sm:p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="text-red-500 text-lg sm:text-xl mt-0.5 flex-shrink-0">✗</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-red-800 text-sm sm:text-base">Expense Statement Rejected</p>
              <p className="text-xs sm:text-sm text-red-700 mt-1">
                Your expense statement for {months[selectedMonth - 1]} {selectedYear} was rejected by the admin.
                Please review the note below, make corrections, and resubmit.
              </p>
              {expense.adminNote && (
                <p className="mt-2 text-xs sm:text-sm text-red-900 bg-red-100 px-2 sm:px-3 py-1.5 sm:py-2 rounded break-words">
                  <strong>Admin's Reason:</strong> {expense.adminNote}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold ${
          expense.status === "approved" ? "bg-green-100 text-green-800" :
          expense.status === "submitted" ? "bg-blue-100 text-blue-800" :
          expense.status === "rejected" ? "bg-red-100 text-red-800" :
          "bg-gray-100 text-gray-800"
        }`}>
          Status: {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
        </span>
        {expense.status !== "rejected" && expense.adminNote && (
          <div className="mt-2 p-2 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs sm:text-sm text-yellow-800 break-words"><strong>Admin Note:</strong> {expense.adminNote}</p>
          </div>
        )}
        {canEdit && (
          <div className="mt-2 p-2 sm:p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs sm:text-sm text-blue-800">
              <strong>💡 Tip:</strong> Your changes are saved automatically. Click "Sync" to fill places from your daily call reports, then submit when ready.
            </p>
          </div>
        )}
      </div>

      {/* Expense Table */}
      <div className="mb-3 sm:mb-4">
        <p className="text-xs text-blue-600 font-medium sm:hidden mb-2 text-center bg-blue-50 py-2 rounded-lg border border-blue-200">
          👉 Swipe left/right to view all columns
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-md overflow-x-auto -mx-3 sm:mx-0 mb-4 sm:mb-6">
        <div className="min-w-[1000px] px-3 sm:px-0">
          <table className="w-full border-collapse">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200">
              <tr>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r">Date</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r w-32 sm:w-48">Place</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r">Fare</th>
                <th colSpan="3" className="px-2 sm:px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase border-r">
                  Daily Allowance
                </th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r">Other Exp.</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs font-semibold text-gray-700 uppercase border-r">Total</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-left text-xs font-semibold text-gray-700 uppercase border-r">Remark</th>
                <th className="px-2 sm:px-3 py-2 sm:py-3 text-center text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
              <tr className="bg-gray-50 text-xs text-gray-600">
                <th className="border-r"></th>
                <th className="border-r"></th>
                <th className="border-r"></th>
                <th className="px-2 py-1 sm:py-2 text-center border-r font-medium">H.Q.</th>
                <th className="px-2 py-1 sm:py-2 text-center border-r font-medium">E.X</th>
                <th className="px-2 py-1 sm:py-2 text-center border-r font-medium">OS</th>
                <th className="border-r"></th>
                <th className="border-r"></th>
                <th className="border-r"></th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expense.entries.map((entry, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 transition-colors ${entry.isLeave ? "bg-yellow-50" : entry.isHoliday ? "bg-blue-50" : ""}`}
                >
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-900 border-r font-medium whitespace-nowrap">{entry.date}</td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 border-r">
                    <input
                      type="text"
                      value={entry.place}
                      onChange={(e) => handleEntryChange(index, "place", e.target.value)}
                      disabled={!canEdit || entry.isLeave || entry.isHoliday}
                      className="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 min-h-[36px]"
                    />
                  </td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 border-r">
                    <input
                      type="number"
                      value={entry.fare || ""}
                      onChange={(e) => handleEntryChange(index, "fare", e.target.value)}
                      disabled={!canEdit || entry.isLeave || entry.isHoliday}
                      className="w-16 sm:w-20 px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 min-h-[36px]"
                      min="0"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-1.5 sm:px-2 py-1.5 sm:py-2 border-r">
                    <input
                      type="number"
                      value={entry.dailyAllowance?.hq || ""}
                      onChange={(e) => handleEntryChange(index, "dailyAllowance.hq", e.target.value)}
                      disabled={!canEdit || entry.isLeave || entry.isHoliday}
                      className="w-16 sm:w-20 px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 min-h-[36px]"
                      min="0"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-1.5 sm:px-2 py-1.5 sm:py-2 border-r">
                    <input
                      type="number"
                      value={entry.dailyAllowance?.ex || ""}
                      onChange={(e) => handleEntryChange(index, "dailyAllowance.ex", e.target.value)}
                      disabled={!canEdit || entry.isLeave || entry.isHoliday}
                      className="w-16 sm:w-20 px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 min-h-[36px]"
                      min="0"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-1.5 sm:px-2 py-1.5 sm:py-2 border-r">
                    <input
                      type="number"
                      value={entry.dailyAllowance?.os || ""}
                      onChange={(e) => handleEntryChange(index, "dailyAllowance.os", e.target.value)}
                      disabled={!canEdit || entry.isLeave || entry.isHoliday}
                      className="w-16 sm:w-20 px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 min-h-[36px]"
                      min="0"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 border-r">
                    <input
                      type="number"
                      value={entry.otherExpenses || ""}
                      onChange={(e) => handleEntryChange(index, "otherExpenses", e.target.value)}
                      disabled={!canEdit || entry.isLeave || entry.isHoliday}
                      className="w-16 sm:w-20 px-1.5 sm:px-2 py-1.5 text-xs sm:text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 min-h-[36px]"
                      min="0"
                      placeholder="0"
                    />
                  </td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-center font-semibold border-r whitespace-nowrap">
                    ₹{entryTotal(entry).toFixed(2)}
                  </td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 border-r">
                    <input
                      type="text"
                      value={entry.remark}
                      onChange={(e) => handleEntryChange(index, "remark", e.target.value)}
                      disabled={!canEdit}
                      className="w-full px-2 py-1.5 text-xs sm:text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 min-h-[36px]"
                    />
                  </td>
                  <td className="px-2 sm:px-3 py-1.5 sm:py-2 text-center">
                    {canEdit && (
                      <div className="flex gap-1 justify-center flex-wrap">
                        <button
                          onClick={() => handleToggleLeave(index)}
                          className={`px-2 py-1.5 text-xs rounded min-h-[32px] min-w-[52px] active:scale-95 transition-transform ${entry.isLeave ? "bg-yellow-500 text-white font-medium" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                        >
                          Leave
                        </button>
                        <button
                          onClick={() => handleToggleHoliday(index)}
                          className={`px-2 py-1.5 text-xs rounded min-h-[32px] min-w-[52px] active:scale-95 transition-transform ${entry.isHoliday ? "bg-blue-500 text-white font-medium" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                        >
                          Holiday
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}

              {/* Total Row */}
              <tr className="bg-gradient-to-r from-gray-100 to-gray-50 font-bold">
                <td colSpan="2" className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-right border-r">TOTAL</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-center border-r">₹{(expense.totals?.fare ?? 0).toFixed(2)}</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-center border-r">₹{(expense.totals?.hq ?? 0).toFixed(2)}</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-center border-r">₹{(expense.totals?.ex ?? 0).toFixed(2)}</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-center border-r">₹{(expense.totals?.os ?? 0).toFixed(2)}</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-center border-r">₹{(expense.totals?.otherExpenses ?? 0).toFixed(2)}</td>
                <td className="px-2 sm:px-3 py-2 sm:py-3 text-xs sm:text-sm text-center border-r text-blue-700">₹{(expense.totals?.grandTotal ?? 0).toFixed(2)}</td>
                <td colSpan="2"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800">Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4">
          {[
            { label: "AT HQ", value: expense.summary?.atHQ, color: "blue" },
            { label: "AT Ex Stn", value: expense.summary?.atExStn, color: "green" },
            { label: "AT Out Stn", value: expense.summary?.atOutStn, color: "purple" },
            { label: "Leave Taken", value: expense.summary?.leaveTaken, color: "yellow" },
            { label: "Holiday", value: expense.summary?.holiday, color: "indigo" },
            { label: "Total Days", value: expense.summary?.total, color: "gray" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`text-center p-2.5 sm:p-3 bg-${color}-50 rounded-lg shadow-sm border border-${color}-100`}>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">{label}</div>
              <div className={`text-xl sm:text-2xl font-bold text-${color}-600`}>{value ?? 0}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseContent;
