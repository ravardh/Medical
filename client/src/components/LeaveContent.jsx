import React, { useState, useEffect } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import { FiCalendar, FiCheckCircle, FiXCircle, FiClock } from "react-icons/fi";
import ApplyLeaveModal from "./modals/ApplyLeaveModal";

const LeaveContent = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/mr/leaves", {
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <FiCheckCircle className="text-green-600" />;
      case "rejected":
        return <FiXCircle className="text-red-600" />;
      case "pending":
        return <FiClock className="text-yellow-600" />;
      default:
        return null;
    }
  };

  const getLeaveTypeLabel = (type) => {
    const labels = {
      sick: "Sick Leave",
      casual: "Casual Leave",
      annual: "Annual Leave",
      emergency: "Emergency Leave",
      unpaid: "Unpaid Leave",
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#325946]"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FiCalendar className="text-[#325946]" size={20} />
            <span className="hidden sm:inline">My Leave Applications</span>
            <span className="sm:hidden">My Leaves</span>
          </h2>
          <p className="text-gray-600 mt-1 text-xs sm:text-sm">Apply for and track your leaves</p>
        </div>
        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2.5 sm:py-2 bg-[#325946] text-white rounded-lg hover:bg-[#4a7a5d] transition-colors flex items-center justify-center gap-2 text-sm sm:text-base w-full sm:w-auto"
        >
          <FiCalendar size={18} />
          Apply for Leave
        </button>
      </div>

      {leaves.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
          <FiCalendar className="mx-auto text-gray-400 mb-3" size={40} />
          <p className="text-base sm:text-lg font-medium text-gray-800">No leave applications</p>
          <p className="text-gray-600 mt-2 text-xs sm:text-sm">Click "Apply for Leave" to submit a new application</p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {leaves.map((leave) => (
            <div
              key={leave._id}
              className="bg-white border border-gray-200 rounded-lg p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                      {getLeaveTypeLabel(leave.leaveType)}
                    </h3>
                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold uppercase border whitespace-nowrap ${getStatusBadge(leave.status)}`}>
                      {leave.status}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <FiCalendar size={14} className="flex-shrink-0" />
                      <span className="truncate">{formatDate(leave.startDate)} - {formatDate(leave.endDate)}</span>
                    </div>
                    <span className="text-[#325946] font-medium">
                      {calculateDays(leave.startDate, leave.endDate)} day{calculateDays(leave.startDate, leave.endDate) > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {getStatusIcon(leave.status)}
                </div>
              </div>

              <div className="bg-gray-50 rounded p-2 sm:p-3 mb-2 sm:mb-3">
                <p className="text-xs font-medium text-gray-600 mb-1">Reason:</p>
                <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">{leave.reason}</p>
              </div>

              {leave.adminNote && (
                <div className={`rounded p-2 sm:p-3 mb-2 sm:mb-0 ${leave.status === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                  <p className="text-xs font-medium text-gray-600 mb-1">Admin Response:</p>
                  <p className="text-xs sm:text-sm text-gray-800 leading-relaxed">{leave.adminNote}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
                <span className="text-xs text-gray-500">
                  Applied on {formatDate(leave.createdAt)}
                </span>
                {leave.respondedBy && (
                  <span className="text-xs text-gray-500">
                    Responded by {leave.respondedBy.name} on {formatDate(leave.respondedAt)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <ApplyLeaveModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        onSuccess={() => {
          fetchLeaves();
          setIsApplyModalOpen(false);
        }}
      />
    </div>
  );
};

export default LeaveContent;
