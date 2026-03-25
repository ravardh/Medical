import React, { useState, useEffect } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import { FiCalendar, FiEye, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
import ViewLeaveModal from "./modals/ViewLeaveModal";

const LeaveManagementContent = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/leaves", {
        withCredentials: true,
      });
      setLeaves(res.data);
    } catch (error) {
      console.error("Error fetching leaves:", error);
      toast.error("Failed to fetch leave applications");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const calculateDays = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getLeaveTypeLabel = (type) => {
    const labels = {
      sick: "Sick Leave",
      casual: "Casual Leave",
      annual: "Annual Leave",
      emergency: "Emergency Leave",
    };
    return labels[type] || type;
  };

  const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setIsViewModalOpen(true);
  };

  const pendingLeaves = leaves.filter((l) => l.status === "pending");
  const approvedLeaves = leaves.filter((l) => l.status === "approved");
  const rejectedLeaves = leaves.filter((l) => l.status === "rejected");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#325946]"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiCalendar className="text-[#325946]" size={20} />
          <span className="hidden sm:inline">Leave Applications Management</span>
          <span className="sm:hidden">Leave Management</span>
        </h2>
        <p className="text-gray-600 mt-1 text-xs sm:text-sm">Review and respond to employee leave requests</p>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-4">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <FiClock className="text-yellow-600" size={16} />
            <span className="text-xs sm:text-sm font-medium text-gray-600">Pending</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-yellow-600">{pendingLeaves.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-4">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <FiCheckCircle className="text-green-600" size={16} />
            <span className="text-xs sm:text-sm font-medium text-gray-600">Approved</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-green-600">{approvedLeaves.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-4">
          <div className="flex items-center gap-1 sm:gap-2 mb-1">
            <FiXCircle className="text-red-600" size={16} />
            <span className="text-xs sm:text-sm font-medium text-gray-600">Rejected</span>
          </div>
          <p className="text-lg sm:text-2xl font-bold text-red-600">{rejectedLeaves.length}</p>
        </div>
      </div>

      {leaves.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
          <FiCalendar className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-base sm:text-lg font-medium text-gray-800">No leave applications</p>
          <p className="text-gray-600 mt-2 text-xs sm:text-sm">No employees have submitted leave applications yet</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Leave Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Days
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied On
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {leave.employee?.name}
                        </div>
                        <div className="text-xs text-gray-500">{leave.employee?.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {getLeaveTypeLabel(leave.leaveType)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm font-medium text-[#325946]">
                        {calculateDays(leave.startDate, leave.endDate)} day{calculateDays(leave.startDate, leave.endDate) > 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border uppercase ${getStatusBadge(leave.status)}`}>
                        {leave.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(leave.createdAt)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleViewLeave(leave)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#325946] text-white rounded-lg hover:bg-[#4a7a5d] transition-colors text-sm"
                      >
                        <FiEye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-3">
            {leaves.map((leave) => (
              <div
                key={leave._id}
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                      {leave.employee?.name}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{leave.employee?.email}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full border uppercase whitespace-nowrap ml-2 ${getStatusBadge(leave.status)}`}>
                    {leave.status}
                  </span>
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-900">{getLeaveTypeLabel(leave.leaveType)}</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium text-[#325946]">
                      {calculateDays(leave.startDate, leave.endDate)} day{calculateDays(leave.startDate, leave.endDate) > 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Dates:</span>
                    <span className="text-gray-900 text-right">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Applied:</span>
                    <span className="text-gray-900">{formatDate(leave.createdAt)}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleViewLeave(leave)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#325946] text-white rounded-lg hover:bg-[#4a7a5d] transition-colors text-sm font-medium"
                >
                  <FiEye size={16} />
                  View Details
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      <ViewLeaveModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setSelectedLeave(null);
        }}
        leave={selectedLeave}
        onSuccess={() => {
          fetchLeaves();
          setIsViewModalOpen(false);
          setSelectedLeave(null);
        }}
      />
    </div>
  );
};

export default LeaveManagementContent;
