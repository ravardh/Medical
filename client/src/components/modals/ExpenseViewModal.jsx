import React from "react";
import { FiX, FiCheck, FiEdit2, FiSave } from "react-icons/fi";

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const getStatusBadge = (status) => {
  const colors = {
    draft: "bg-gray-100 text-gray-700",
    submitted: "bg-blue-100 text-blue-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const entryTotal = (entry) =>
  (entry.fare || 0) +
  (entry.dailyAllowance?.hq || 0) +
  (entry.dailyAllowance?.ex || 0) +
  (entry.dailyAllowance?.os || 0) +
  (entry.otherExpenses || 0);

const ExpenseViewModal = ({
  expense,
  isEditing,
  saving,
  adminNote,
  onAdminNoteChange,
  onEntryChange,
  onEdit,
  onCancelEdit,
  onSave,
  onApprove,
  onReject,
  onClose,
}) => {
  if (!expense) return null;

  return (
    <div
      className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 z-50 flex items-center justify-center overflow-y-auto p-3 sm:p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Modal container — flex column, max height */}
      <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl w-full max-w-6xl flex flex-col my-auto"
           style={{ maxHeight: "calc(100vh - 88px)", minHeight: "300px" }}>

        {/* ── Header ── */}
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-start justify-between px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-white rounded-t-lg sm:rounded-t-xl gap-2 sm:gap-0">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">
              Expense Statement —{" "}
              <span className="text-blue-700">{expense.employee?.name}</span>
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <p className="text-xs sm:text-sm text-gray-500">
                {months[expense.month - 1]} {expense.year}
              </p>
              <span className="text-gray-400">·</span>
              {getStatusBadge(expense.status)}
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 w-full sm:w-auto">
            {isEditing ? (
              <>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs sm:text-sm rounded-lg disabled:opacity-60 active:scale-95 transition-transform min-h-[40px]"
                >
                  <FiSave size={14} />
                  <span>{saving ? "Saving…" : "Save"}</span>
                </button>
                <button
                  onClick={onCancelEdit}
                  className="flex-1 sm:flex-none px-3 py-2 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-700 text-xs sm:text-sm rounded-lg active:scale-95 transition-transform min-h-[40px]"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                {expense.status === "submitted" && (
                  <>
                    <button
                      onClick={onApprove}
                      disabled={saving}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-xs sm:text-sm rounded-lg disabled:opacity-60 active:scale-95 transition-transform min-h-[40px]"
                    >
                      <FiCheck size={14} /> <span className="hidden sm:inline">Approve</span><span className="sm:hidden">✓</span>
                    </button>
                    <button
                      onClick={onReject}
                      disabled={saving}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-xs sm:text-sm rounded-lg disabled:opacity-60 active:scale-95 transition-transform min-h-[40px]"
                    >
                      <FiX size={14} /> <span className="hidden sm:inline">Reject</span><span className="sm:hidden">✗</span>
                    </button>
                  </>
                )}
                <button
                  onClick={onEdit}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white text-xs sm:text-sm rounded-lg active:scale-95 transition-transform min-h-[40px]"
                >
                  <FiEdit2 size={14} /> <span>Edit</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 active:scale-95 transition-transform flex-shrink-0"
              title="Close"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-3 sm:py-4">

          {/* Admin note */}
          <div className="mb-3 sm:mb-4">
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
              Admin Note
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => onAdminNoteChange(e.target.value)}
              disabled={!isEditing && expense.status !== "submitted"}
              rows={3}
              placeholder="Add a note for the employee…"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50 resize-none min-h-[72px]"
            />
          </div>

          {/* Swipe hint for mobile */}
          <div className="mb-2 sm:mb-3 lg:hidden">
            <p className="text-xs text-blue-600 font-medium text-center bg-blue-50 py-2 rounded-lg border border-blue-200">
              👉 Swipe left/right to view all columns
            </p>
          </div>

          {/* Expense entries table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 mb-3 sm:mb-4 -mx-3 sm:mx-0">
            <div className="min-w-[960px] px-3 sm:px-0">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700">
                  <th className="px-2 sm:px-3 py-2 border border-gray-200 font-semibold text-center w-12 sm:w-auto">Date</th>
                  <th className="px-2 sm:px-3 py-2 border border-gray-200 font-semibold text-left">Place</th>
                  <th className="px-2 sm:px-3 py-2 border border-gray-200 font-semibold text-center">Fare</th>
                  <th colSpan={3} className="px-2 sm:px-3 py-2 border border-gray-200 font-semibold text-center">
                    Daily Allowance
                  </th>
                  <th className="px-2 sm:px-3 py-2 border border-gray-200 font-semibold text-center">Other Exp.</th>
                  <th className="px-2 sm:px-3 py-2 border border-gray-200 font-semibold text-center">Total</th>
                  <th className="px-2 sm:px-3 py-2 border border-gray-200 font-semibold text-left">Remark</th>
                </tr>
                <tr className="bg-gray-50 text-gray-500 text-xs">
                  <th className="border border-gray-200" />
                  <th className="border border-gray-200" />
                  <th className="border border-gray-200" />
                  <th className="px-2 py-1 border border-gray-200 text-center font-medium">H.Q.</th>
                  <th className="px-2 py-1 border border-gray-200 text-center font-medium">E.X</th>
                  <th className="px-2 py-1 border border-gray-200 text-center font-medium">OS</th>
                  <th className="border border-gray-200" />
                  <th className="border border-gray-200" />
                  <th className="border border-gray-200" />
                </tr>
              </thead>
              <tbody>
                {expense.entries.map((entry, index) => (
                  <tr
                    key={index}
                    className={
                      entry.isLeave
                        ? "bg-yellow-50"
                        : entry.isHoliday
                        ? "bg-blue-50"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-1.5 sm:px-2 py-1.5 border border-gray-200 text-center text-xs font-medium whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="px-1.5 sm:px-2 py-1.5 border border-gray-200">
                      <input
                        type="text"
                        value={entry.place}
                        onChange={(e) => onEntryChange(index, "place", e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-1.5 py-1 text-xs sm:text-sm rounded border-0 focus:ring-2 focus:ring-blue-400 disabled:bg-transparent min-h-[32px]"
                      />
                    </td>
                    <td className="px-1 sm:px-1.5 py-1.5 border border-gray-200">
                      <input
                        type="number"
                        value={entry.fare || ""}
                        onChange={(e) => onEntryChange(index, "fare", e.target.value)}
                        disabled={!isEditing}
                        className="w-14 sm:w-16 px-1.5 py-1 text-xs sm:text-sm text-center rounded border-0 focus:ring-2 focus:ring-blue-400 disabled:bg-transparent min-h-[32px]"
                        min="0"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-1 sm:px-1.5 py-1.5 border border-gray-200">
                      <input
                        type="number"
                        value={entry.dailyAllowance.hq || ""}
                        onChange={(e) => onEntryChange(index, "dailyAllowance.hq", e.target.value)}
                        disabled={!isEditing}
                        className="w-14 sm:w-16 px-1.5 py-1 text-xs sm:text-sm text-center rounded border-0 focus:ring-2 focus:ring-blue-400 disabled:bg-transparent min-h-[32px]"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-1 sm:px-1.5 py-1.5 border border-gray-200">
                      <input
                        type="number"
                        value={entry.dailyAllowance.ex || ""}
                        onChange={(e) => onEntryChange(index, "dailyAllowance.ex", e.target.value)}
                        disabled={!isEditing}
                        className="w-14 sm:w-16 px-1.5 py-1 text-xs sm:text-sm text-center rounded border-0 focus:ring-2 focus:ring-blue-400 disabled:bg-transparent min-h-[32px]"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-1 sm:px-1.5 py-1.5 border border-gray-200">
                      <input
                        type="number"
                        value={entry.dailyAllowance.os || ""}
                        onChange={(e) => onEntryChange(index, "dailyAllowance.os", e.target.value)}
                        disabled={!isEditing}
                        className="w-14 sm:w-16 px-1.5 py-1 text-xs sm:text-sm text-center rounded border-0 focus:ring-2 focus:ring-blue-400 disabled:bg-transparent min-h-[32px]"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-1 sm:px-1.5 py-1.5 border border-gray-200">
                      <input
                        type="number"
                        value={entry.otherExpenses || ""}
                        onChange={(e) => onEntryChange(index, "otherExpenses", e.target.value)}
                        disabled={!isEditing}
                        className="w-14 sm:w-16 px-1.5 py-1 text-xs sm:text-sm text-center rounded border-0 focus:ring-2 focus:ring-blue-400 disabled:bg-transparent min-h-[32px]"
                        placeholder="0"
                      />
                    </td>
                    <td className="px-2 py-1.5 border border-gray-200 text-center text-xs font-semibold whitespace-nowrap">
                      ₹{entryTotal(entry).toFixed(2)}
                    </td>
                    <td className="px-1.5 sm:px-2 py-1.5 border border-gray-200">
                      <input
                        type="text"
                        value={entry.remark}
                        onChange={(e) => onEntryChange(index, "remark", e.target.value)}
                        disabled={!isEditing}
                        className="w-full px-1.5 py-1 text-xs sm:text-sm rounded border-0 focus:ring-2 focus:ring-blue-400 disabled:bg-transparent min-h-[32px]"
                      />
                    </td>
                  </tr>
                ))}

                {/* Totals row */}
                <tr className="bg-gradient-to-r from-gray-100 to-gray-50 font-semibold text-xs sm:text-sm">
                  <td colSpan={2} className="px-2 sm:px-3 py-2 border border-gray-200 text-right text-gray-700">
                    TOTAL
                  </td>
                  <td className="px-2 sm:px-3 py-2 border border-gray-200 text-center">
                    ₹{(expense.totals?.fare ?? 0).toFixed(2)}
                  </td>
                  <td className="px-2 sm:px-3 py-2 border border-gray-200 text-center">
                    ₹{(expense.totals?.hq ?? 0).toFixed(2)}
                  </td>
                  <td className="px-2 sm:px-3 py-2 border border-gray-200 text-center">
                    ₹{(expense.totals?.ex ?? 0).toFixed(2)}
                  </td>
                  <td className="px-2 sm:px-3 py-2 border border-gray-200 text-center">
                    ₹{(expense.totals?.os ?? 0).toFixed(2)}
                  </td>
                  <td className="px-2 sm:px-3 py-2 border border-gray-200 text-center">
                    ₹{(expense.totals?.otherExpenses ?? 0).toFixed(2)}
                  </td>
                  <td className="px-2 sm:px-3 py-2 border border-gray-200 text-center text-blue-700">
                    ₹{(expense.totals?.grandTotal ?? 0).toFixed(2)}
                  </td>
                  <td className="border border-gray-200" />
                </tr>
              </tbody>
            </table>
            </div>
          </div>

          {/* Summary cards */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 sm:p-4 border border-gray-200">
            <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Summary</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {[
                { label: "AT HQ", value: expense.summary?.atHQ },
                { label: "AT Ex Stn", value: expense.summary?.atExStn },
                { label: "AT Out Stn", value: expense.summary?.atOutStn },
                { label: "Leave", value: expense.summary?.leaveTaken },
                { label: "Holiday", value: expense.summary?.holiday },
                { label: "Total Days", value: expense.summary?.total },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white rounded-lg p-2 sm:p-2.5 text-center shadow-sm border border-gray-200">
                  <p className="text-xs text-gray-500 leading-none mb-1">{label}</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-800">{value ?? 0}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseViewModal;
