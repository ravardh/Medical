import React, { useState, useEffect } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import { FiAlertCircle, FiCheckCircle, FiXCircle, FiMail, FiTrash2, FiUser } from "react-icons/fi";

const EmployeeWarningsContent = () => {
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resendingEmail, setResendingEmail] = useState(null);

  useEffect(() => {
    fetchWarnings();
  }, []);

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/warnings", {
        withCredentials: true,
      });
      setWarnings(res.data);
    } catch (error) {
      console.error("Error fetching warnings:", error);
      toast.error("Failed to fetch warnings");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async (warningId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FiMail className="text-[#325946]" size={20} />
          <span className="font-semibold">Confirm Resend Email</span>
        </div>
        <p className="text-sm text-gray-600">
          Are you sure you want to resend the warning email to this employee?
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                setResendingEmail(warningId);
                await axios.post(`/admin/warnings/${warningId}/resend-email`, {}, {
                  withCredentials: true,
                });
                toast.success("Warning email resent successfully");
                fetchWarnings(); // Refresh to get updated email status
              } catch (error) {
                console.error("Error resending email:", error);
                toast.error(error.response?.data?.message || "Failed to resend email");
              } finally {
                setResendingEmail(null);
              }
            }}
            className="px-4 py-2 bg-[#325946] text-white rounded-lg hover:bg-[#4a7a5d] transition-colors text-sm"
          >
            Resend
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: "top-center",
    });
  };

  const handleDeleteWarning = async (warningId) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <FiAlertCircle className="text-red-500" size={20} />
          <span className="font-semibold">Confirm Delete</span>
        </div>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete this warning? This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors text-sm"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await axios.delete(`/admin/warnings/${warningId}`, {
                  withCredentials: true,
                });
                toast.success("Warning deleted successfully");
                fetchWarnings();
              } catch (error) {
                console.error("Error deleting warning:", error);
                toast.error("Failed to delete warning");
              }
            }}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
          >
            Delete
          </button>
        </div>
      </div>
    ), {
      duration: Infinity,
      position: "top-center",
    });
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-100 border-red-300 text-red-800";
      case "medium":
        return "bg-orange-100 border-orange-300 text-orange-800";
      case "low":
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      default:
        return "bg-gray-100 border-gray-300 text-gray-800";
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-orange-500 text-white";
      case "low":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#325946]"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiAlertCircle className="text-[#325946]" />
          <span>Employee Warnings Management</span>
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          View and manage all issued warnings
        </p>
      </div>

      {warnings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-lg p-6 sm:p-8 text-center">
          <FiAlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
          <p className="text-base sm:text-lg font-medium text-gray-800">No warnings issued</p>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            No employee warnings have been issued yet
          </p>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {warnings.map((warning) => (
            <div
              key={warning._id}
              className={`border rounded-lg p-4 sm:p-5 shadow-sm ${getSeverityColor(warning.severity)}`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                <div className="flex items-start gap-3">
                  <FiUser className="text-gray-700 mt-1 flex-shrink-0" size={20} />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                      {warning.employee?.name || "Unknown Employee"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 break-words">
                      {warning.employee?.email || "No email"}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getSeverityBadgeColor(warning.severity)} self-start sm:self-auto flex-shrink-0`}>
                  {warning.severity}
                </span>
              </div>

              <div className="bg-white rounded-lg p-3 sm:p-4 mb-3">
                <h4 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base break-words">{warning.title}</h4>
                <p className="text-gray-700 text-xs sm:text-sm mb-2 break-words">{warning.description}</p>
                {warning.notes && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Additional Notes:</p>
                    <p className="text-xs sm:text-sm text-gray-700 break-words">{warning.notes}</p>
                  </div>
                )}
              </div>

              {/* Info section - responsive layout */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-gray-600">
                  <span className="break-words">Issued: {formatDate(warning.createdAt)}</span>
                  <span className="break-words">By: {warning.issuedBy?.name || "Admin"}</span>
                  {warning.emailSent ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <FiCheckCircle size={14} />
                      <span className="break-words">Email sent {warning.emailSentAt && `at ${formatDate(warning.emailSentAt)}`}</span>
                    </div>
                  ) : warning.emailError ? (
                    <div className="flex items-center gap-1 text-red-600">
                      <FiXCircle size={14} />
                      <span>Email failed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-gray-500">
                      <FiXCircle size={14} />
                      <span>Email not sent</span>
                    </div>
                  )}
                </div>

                {/* Action buttons - responsive */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <button
                    onClick={() => handleResendEmail(warning._id)}
                    disabled={resendingEmail === warning._id}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-[#325946] text-white rounded-lg hover:bg-[#4a7a5d] transition-colors text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiMail size={14} />
                    <span>{resendingEmail === warning._id ? "Sending..." : "Resend Email"}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteWarning(warning._id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm"
                  >
                    <FiTrash2 size={14} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeWarningsContent;
