import React, { useState, useEffect } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import { FiEye, FiFilter } from "react-icons/fi";
import ExpenseViewModal from "./modals/ExpenseViewModal";

const ExpenseAdminContent = () => {
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  
  const [filters, setFilters] = useState({
    status: "",
    month: "",
    year: new Date().getFullYear(),
    employee: "",
  });

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const years = [];
  for (let i = new Date().getFullYear(); i >= 2020; i--) {
    years.push(i);
  }

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, expenses]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/expenses", {
        withCredentials: true,
      });
      setExpenses(res.data);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      toast.error("Failed to fetch expense statements");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...expenses];

    if (filters.status) {
      filtered = filtered.filter(exp => exp.status === filters.status);
    }
    if (filters.month) {
      filtered = filtered.filter(exp => exp.month === parseInt(filters.month));
    }
    if (filters.year) {
      filtered = filtered.filter(exp => exp.year === parseInt(filters.year));
    }
    if (filters.employee) {
      filtered = filtered.filter(exp => 
        exp.employee?.name.toLowerCase().includes(filters.employee.toLowerCase()) ||
        exp.employee?.email.toLowerCase().includes(filters.employee.toLowerCase()) ||
        exp.employee?.employeeId?.toLowerCase().includes(filters.employee.toLowerCase())
      );
    }

    setFilteredExpenses(filtered);
  };

  const handleViewExpense = async (expenseId) => {
    try {
      const res = await axios.get(`/admin/expenses/${expenseId}`, {
        withCredentials: true,
      });
      setSelectedExpense(res.data);
      setAdminNote(res.data.adminNote || "");
      setIsViewModalOpen(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Error fetching expense:", error);
      toast.error("Failed to fetch expense details");
    }
  };

  const handleEntryChange = (index, field, value) => {
    const newExpense = { ...selectedExpense };
    
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      newExpense.entries[index][parent][child] = parseFloat(value) || 0;
    } else {
      newExpense.entries[index][field] = field === "place" || field === "remark" ? value : parseFloat(value) || 0;
    }

    recalculate(newExpense);
    setSelectedExpense(newExpense);
  };

  const recalculate = (expenseData) => {
    const totals = {
      hq: 0,
      ex: 0,
      os: 0,
      otherExpenses: 0,
      grandTotal: 0,
    };

    const summary = {
      atHQ: 0,
      atExStn: 0,
      atOutStn: 0,
      leaveTaken: 0,
      holiday: 0,
      total: expenseData.entries.length,
    };

    expenseData.entries.forEach((entry) => {
      totals.hq += entry.dailyAllowance?.hq || 0;
      totals.ex += entry.dailyAllowance?.ex || 0;
      totals.os += entry.dailyAllowance?.os || 0;
      totals.otherExpenses += entry.otherExpenses || 0;

      if (entry.isLeave) {
        summary.leaveTaken += 1;
      } else if (entry.isHoliday) {
        summary.holiday += 1;
      } else if (entry.place && !entry.isLeave && !entry.isHoliday) {
        if (entry.dailyAllowance?.hq > 0) summary.atHQ += 1;
        if (entry.dailyAllowance?.ex > 0) summary.atExStn += 1;
        if (entry.dailyAllowance?.os > 0) summary.atOutStn += 1;
      }
    });

    totals.grandTotal = totals.hq + totals.ex + totals.os + totals.otherExpenses;

    expenseData.totals = totals;
    expenseData.summary = summary;
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      await axios.put(`/admin/expenses/${selectedExpense._id}`, {
        entries: selectedExpense.entries,
        adminNote,
      }, {
        withCredentials: true,
      });
      toast.success("Changes saved successfully");
      setIsEditing(false);
      fetchExpenses();
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = async () => {
    try {
      setSaving(true);
      await axios.put(`/admin/expenses/${selectedExpense._id}`, {
        status: "approved",
        adminNote,
      }, {
        withCredentials: true,
      });
      toast.success("Expense approved successfully");
      setIsViewModalOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error("Error approving expense:", error);
      toast.error("Failed to approve expense");
    } finally {
      setSaving(false);
    }
  };

  const handleReject = async () => {
    if (!adminNote.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    try {
      setSaving(true);
      await axios.put(`/admin/expenses/${selectedExpense._id}`, {
        status: "rejected",
        adminNote,
      }, {
        withCredentials: true,
      });
      toast.success("Expense rejected");
      setIsViewModalOpen(false);
      fetchExpenses();
    } catch (error) {
      console.error("Error rejecting expense:", error);
      toast.error("Failed to reject expense");
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Expense Statements Review</h2>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 mb-3">
          <FiFilter className="text-gray-600" size={16} />
          <h3 className="font-semibold text-sm sm:text-base text-gray-700">Filters</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white min-h-[40px]"
            >
              <option value="">All</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Month</label>
            <select
              value={filters.month}
              onChange={(e) => setFilters({ ...filters, month: e.target.value })}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white min-h-[40px]"
            >
              <option value="">All</option>
              {months.map((month, index) => (
                <option key={index} value={index + 1}>{month}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Year</label>
            <select
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white min-h-[40px]"
            >
              <option value="">All</option>
              {years.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-1.5">Employee</label>
            <input
              type="text"
              value={filters.employee}
              onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
              placeholder="Search by name, email, or ID"
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[40px]"
            />
          </div>
        </div>
      </div>

      {/* Expense List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Mobile Card View */}
        <div className="lg:hidden divide-y divide-gray-200">
          {filteredExpenses.length === 0 ? (
            <p className="px-4 py-12 text-center text-gray-500 text-sm sm:text-base">No expense statements found</p>
          ) : (
            filteredExpenses.map((expense) => (
              <div key={expense._id} className="p-3 sm:p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{expense.employee?.name}</p>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">{expense.employee?.email}</p>
                  </div>
                  {getStatusBadge(expense.status)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 space-y-1 mb-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Period:</span>
                    <span>{months[expense.month - 1]} {expense.year}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Total:</span>
                    <span className="font-semibold text-gray-900">₹{expense.totals?.grandTotal?.toFixed(2) || "0.00"}</span>
                  </div>
                  {expense.dateOfPosting && (
                    <div className="flex justify-between">
                      <span className="font-medium">Submitted:</span>
                      <span>{new Date(expense.dateOfPosting).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleViewExpense(expense._id)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:scale-95 transition-all text-sm sm:text-base min-h-[40px]"
                >
                  <FiEye size={16} /> <span>View Details</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  No expense statements found
                </td>
              </tr>
            ) : (
              filteredExpenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{expense.employee?.name}</div>
                    <div className="text-sm text-gray-500">{expense.employee?.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {months[expense.month - 1]} {expense.year}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    ₹{expense.totals?.grandTotal?.toFixed(2) || "0.00"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(expense.status)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {expense.dateOfPosting ? new Date(expense.dateOfPosting).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleViewExpense(expense._id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      <FiEye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* View/Edit Modal */}
      {isViewModalOpen && selectedExpense && (
        <ExpenseViewModal
          expense={selectedExpense}
          isEditing={isEditing}
          saving={saving}
          adminNote={adminNote}
          onAdminNoteChange={setAdminNote}
          onEntryChange={handleEntryChange}
          onEdit={() => setIsEditing(true)}
          onCancelEdit={() => setIsEditing(false)}
          onSave={handleSaveChanges}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}

    </div>
  );
};

export default ExpenseAdminContent;
