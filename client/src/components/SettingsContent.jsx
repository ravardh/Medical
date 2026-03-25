import React, { useState, useEffect } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import { FiClock, FiCheckCircle, FiXCircle, FiAlertCircle, FiMail } from "react-icons/fi";

const SettingsContent = ({ refreshPendingCount }) => {
  const [extensionRequests, setExtensionRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [resendingEmail, setResendingEmail] = useState(null);

  useEffect(() => {
    fetchExtensionRequests();
  }, []);

  const fetchExtensionRequests = async () => {
    try {
      setLoadingRequests(true);
      const res = await axios.get("/admin/time-extension-requests", {
        withCredentials: true,
      });
      setExtensionRequests(res.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to fetch extension requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleRespondToRequest = async (requestId, status, adminNote = "", isWarning = false) => {
    try {
      setLoadingRequests(true);
      await axios.patch(
        `/admin/time-extension-requests/${requestId}`,
        { status, adminNote, isWarning },
        { withCredentials: true }
      );
      toast.success(`Request ${status} successfully`);
      await fetchExtensionRequests();
      if (refreshPendingCount) {
        await refreshPendingCount();
      }
    } catch (error) {
      console.error("Error responding to request:", error);
      toast.error(error.response?.data?.message || "Failed to process request");
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleResendEmail = async (requestId) => {
    try {
      setResendingEmail(requestId);
      await axios.post(
        `/admin/time-extension-requests/${requestId}/resend-email`,
        {},
        { withCredentials: true }
      );
      toast.success("Email resent successfully");
      fetchExtensionRequests();
    } catch (error) {
      console.error("Error resending email:", error);
      toast.error(error.response?.data?.message || "Failed to resend email");
    } finally {
      setResendingEmail(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <FiAlertCircle className="text-yellow-500" size={18} />;
      case "approved":
        return <FiCheckCircle className="text-green-500" size={18} />;
      case "rejected":
        return <FiXCircle className="text-red-500" size={18} />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
        Time Extension Requests
      </h2>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-3">
          <FiClock size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1 text-sm sm:text-base">
              Default Time Limit: 3 Days
            </h3>
            <p className="text-xs sm:text-sm text-blue-800">
              Employees can submit daily call reports for the last 3 days by default.
              If they need to submit reports for older dates, they can request an extension below.
            </p>
          </div>
        </div>
      </div>

      {/* Extension Requests */}
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
          Time Extension Requests
        </h3>

        {loadingRequests ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
          </div>
        ) : extensionRequests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FiAlertCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm sm:text-base">No extension requests</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {extensionRequests.map((request) => (
              <div
                key={request._id}
                className="border rounded-lg p-3 sm:p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(request.status)}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                        {request.employee?.name}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {request.employee?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex-shrink-0 self-start sm:self-auto">
                    {getStatusBadge(request.status)}
                  </div>
                </div>

                <div className="ml-0 sm:ml-9 space-y-2">
                  <div className="text-xs sm:text-sm">
                    <span className="font-medium text-gray-700">Requested Date:</span>{" "}
                    <span className="text-gray-900">
                      {formatDate(request.requestedDate)}
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm">
                    <span className="font-medium text-gray-700">Reason:</span>
                    <p className="text-gray-900 mt-1 bg-gray-50 p-2 rounded text-xs sm:text-sm">
                      {request.reason}
                    </p>
                  </div>

                  <div className="text-xs text-gray-500">
                    Requested on: {formatDate(request.createdAt)}
                  </div>

                  {request.status === "pending" && (
                    <div className="flex flex-col sm:flex-row gap-2 mt-3">
                      <button
                        onClick={() => {
                          const note = prompt("Add a note (optional):");
                          if (note !== null) {
                            handleRespondToRequest(request._id, "approved", note, false);
                          }
                        }}
                        className="px-3 sm:px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-xs sm:text-sm font-medium"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => {
                          const note = prompt("Add a warning message:");
                          if (note !== null && note.trim() !== "") {
                            handleRespondToRequest(request._id, "approved", note, true);
                          } else if (note !== null) {
                            toast.error("Warning message is required");
                          }
                        }}
                        className="px-3 sm:px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-xs sm:text-sm font-medium"
                      >
                        Warn & Accept
                      </button>
                    </div>
                  )}

                  {request.status !== "pending" && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs text-gray-600">
                            {request.status === "approved" ? (request.isWarning ? "Approved with Warning" : "Approved") : "Rejected"} by{" "}
                            {request.respondedBy?.name || "Admin"} on{" "}
                            {formatDate(request.respondedAt)}
                          </div>
                          {request.adminNote && (
                            <div className="text-xs sm:text-sm mt-1">
                              <span className="font-medium text-gray-700">{request.isWarning ? "Warning:" : "Admin Note:"}</span>{" "}
                              <span className={`${request.isWarning ? "text-yellow-900 font-medium" : "text-gray-900"} break-words`}>{request.adminNote}</span>
                            </div>
                          )}
                          {request.status === "approved" && (
                            <div className="text-xs mt-1">
                              {request.emailSent ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <FiCheckCircle size={12} />
                                  <span className="truncate">Email sent on {formatDate(request.emailSentAt)}</span>
                                </span>
                              ) : (
                                <span className="text-red-600 flex items-start gap-1">
                                  <FiXCircle size={12} className="mt-0.5 flex-shrink-0" />
                                  <span className="break-words">Email failed: {request.emailError || "Unknown error"}</span>
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {request.status === "approved" && (
                          <button
                            onClick={() => handleResendEmail(request._id)}
                            disabled={resendingEmail === request._id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 w-full sm:w-auto justify-center"
                          >
                            <FiMail size={14} />
                            {resendingEmail === request._id ? "Sending..." : "Resend Email"}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsContent;
