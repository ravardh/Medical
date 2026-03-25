import React, { useState } from "react";
import axios from "../../config/api";
import toast from "react-hot-toast";
import { FiCalendar, FiX, FiCheckCircle, FiXCircle, FiUser, FiMail } from "react-icons/fi";

const ViewLeaveModal = ({ isOpen, onClose, leave, onSuccess }) => {
  const [responding, setResponding] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [resending, setResending] = useState(false);

  if (!isOpen || !leave) return null;

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

  const getLeaveTypeLabel = (type) => {
    const labels = {
      sick: "Sick Leave",
      casual: "Casual Leave",
      annual: "Annual Leave",
      emergency: "Emergency Leave",
    };
    return labels[type] || type;
  };

  const handleRespond = async (status) => {
    const confirmMessage = status === "approved" 
      ? "Are you sure you want to approve this leave?" 
      : "Are you sure you want to reject this leave?";

    toast((t) => (
      <div className="flex flex-col gap-3 w-full max-w-sm">
        <div className="flex items-center gap-2">
          {status === "approved" ? (
            <FiCheckCircle className="text-green-500 flex-shrink-0" size={20} />
          ) : (
            <FiXCircle className="text-red-500 flex-shrink-0" size={20} />
          )}
          <span className="font-semibold text-sm sm:text-base">{confirmMessage}</span>
        </div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-xs sm:text-sm"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                setResponding(true);
                const response = await axios.patch(`/admin/leaves/${leave._id}`, {
                  status,
                  adminNote,
                }, {
                  withCredentials: true,
                });
                
                toast.success(`Leave ${status} successfully`);
                
                // Show email notification status
                if (response.data.emailSent) {
                  toast.success(`Email notification sent to employee`, { duration: 3000 });
                } else {
                  toast.error(`⚠️ Failed to send email notification`, { duration: 4000 });
                }
                
                onSuccess();
              } catch (error) {
                console.error("Error responding to leave:", error);
                toast.error(error.response?.data?.message || "Failed to respond to leave");
              } finally {
                setResponding(false);
              }
            }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-white rounded-lg transition-colors text-xs sm:text-sm ${
              status === "approved" 
                ? "bg-green-500 hover:bg-green-600" 
                : "bg-red-500 hover:bg-red-600"
            }`}
          >
            {status === "approved" ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: "top-center",
    });
  };

  const handleResendEmail = async () => {
    try {
      setResending(true);
      await axios.post(`/admin/leaves/${leave._id}/resend-email`, {}, {
        withCredentials: true,
      });
      toast.success("📧 Email resent successfully");
    } catch (error) {
      console.error("Error resending email:", error);
      toast.error(error.response?.data?.message || "Failed to resend email");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-4 px-4 sm:py-8">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
        <div className="bg-[#325946] text-white p-3 sm:p-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <FiCalendar className="hidden sm:block" size={24} />
            <FiCalendar className="sm:hidden" size={20} />
            <h3 className="text-base sm:text-lg font-semibold truncate">Leave Application Details</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 flex-shrink-0">
            <FiX className="hidden sm:block" size={24} />
            <FiX className="sm:hidden" size={20} />
          </button>
        </div>

        <div className="p-3 sm:p-6 overflow-y-auto max-h-[calc(95vh-56px)] sm:max-h-[calc(90vh-64px)]">
          <div className="space-y-3 sm:space-y-4">
            {/* Employee Info */}
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-2">
                <FiUser className="text-gray-600 flex-shrink-0" size={18} />
                <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Employee Information</h4>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="break-words">
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 font-medium text-gray-900">{leave.employee?.name}</span>
                </div>
                <div className="break-words">
                  <span className="text-gray-600">Email:</span>
                  <span className="ml-2 font-medium text-gray-900 text-xs sm:text-sm">{leave.employee?.email}</span>
                </div>
              </div>
            </div>

            {/* Leave Details */}
            <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Leave Details</h4>
              <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-gray-600 flex-shrink-0">Leave Type:</span>
                  <span className="font-medium text-gray-900 text-right">{getLeaveTypeLabel(leave.leaveType)}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-gray-600 flex-shrink-0">Start Date:</span>
                  <span className="font-medium text-gray-900 text-right">{formatDate(leave.startDate)}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-gray-600 flex-shrink-0">End Date:</span>
                  <span className="font-medium text-gray-900 text-right">{formatDate(leave.endDate)}</span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-gray-600 flex-shrink-0">Total Days:</span>
                  <span className="font-medium text-[#325946] text-right">
                    {calculateDays(leave.startDate, leave.endDate)} day{calculateDays(leave.startDate, leave.endDate) > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex justify-between items-start gap-2">
                  <span className="text-gray-600 flex-shrink-0">Applied On:</span>
                  <span className="font-medium text-gray-900 text-right">{formatDate(leave.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Reason for Leave</h4>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{leave.reason}</p>
            </div>

            {/* Admin Response Section */}
            {leave.status === "pending" && (
              <div className="border border-gray-200 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Admin Note (Optional)</h4>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#325946] resize-none text-xs sm:text-sm"
                  placeholder="Add a note for the employee..."
                />
              </div>
            )}

            {/* Existing Response */}
            {leave.status !== "pending" && (
              <div className={`rounded-lg p-3 sm:p-4 ${leave.status === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Admin Response</h4>
                  <button
                    onClick={handleResendEmail}
                    disabled={resending}
                    className="flex items-center justify-center gap-1 px-3 py-1.5 sm:py-1 text-xs bg-[#325946] text-white rounded hover:bg-[#274434] transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                    title="Resend email notification to employee"
                  >
                    <FiMail size={12} />
                    <span className="whitespace-nowrap">{resending ? "Sending..." : "Resend Email"}</span>
                  </button>
                </div>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${leave.status === 'approved' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {leave.status}
                    </span>
                  </div>
                  {leave.adminNote && (
                    <div>
                      <span className="text-gray-600">Note:</span>
                      <p className="mt-1 text-gray-900 leading-relaxed">{leave.adminNote}</p>
                    </div>
                  )}
                  {leave.respondedBy && (
                    <div className="flex flex-col sm:flex-row sm:justify-between gap-1 text-xs text-gray-500 pt-2 border-t">
                      <span>Responded by: {leave.respondedBy.name}</span>
                      <span>{formatDate(leave.respondedAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {leave.status === "pending" && (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={() => handleRespond("rejected")}
                disabled={responding}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <FiXCircle size={18} />
                <span>Reject Leave</span>
              </button>
              <button
                onClick={() => handleRespond("approved")}
                disabled={responding}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                <FiCheckCircle size={18} />
                <span>Approve Leave</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewLeaveModal;
