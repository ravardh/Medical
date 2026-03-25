import React, { useState, useEffect } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import { FiAlertTriangle, FiCalendar, FiUser, FiAlertCircle } from "react-icons/fi";

const WarningsContent = () => {
  const [extensionWarnings, setExtensionWarnings] = useState([]);
  const [employeeWarnings, setEmployeeWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWarnings();
  }, []);

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      
      // Fetch extension request warnings
      const extensionRes = await axios.get("/mr/time-extension-requests", {
        withCredentials: true,
      });
      const warningRequests = extensionRes.data.filter(
        (req) => req.status === "approved" && req.isWarning === true
      );
      setExtensionWarnings(warningRequests);

      // Fetch employee warnings issued by admin
      try {
        const warningsRes = await axios.get("/mr/warnings", {
          withCredentials: true,
        });
        setEmployeeWarnings(warningsRes.data);
      } catch (err) {
        console.error("Error fetching employee warnings:", err);
        // Don't show error toast if endpoint doesn't exist or user doesn't have access
      }
    } catch (error) {
      console.error("Error fetching warnings:", error);
      toast.error("Failed to fetch warnings");
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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-50 border-red-200";
      case "medium":
        return "bg-orange-50 border-orange-200";
      case "low":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-yellow-50 border-yellow-200";
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-orange-500 text-white";
      case "low":
        return "bg-yellow-500 text-white";
      default:
        return "bg-yellow-500 text-white";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case "high":
        return "text-red-600";
      case "medium":
        return "text-orange-600";
      case "low":
        return "text-yellow-600";
      default:
        return "text-yellow-600";
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiAlertTriangle className="text-yellow-600" />
          <span>Warnings</span>
        </h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          View all warnings issued to you
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 sm:py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
        </div>
      ) : extensionWarnings.length === 0 && employeeWarnings.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 sm:p-8 text-center">
          <FiAlertTriangle className="mx-auto text-green-600 mb-3" size={48} />
          <p className="text-base sm:text-lg font-medium text-green-800">
            No warnings issued
          </p>
          <p className="text-sm sm:text-base text-green-600 mt-2">
            You have a clean record. Keep up the good work!
          </p>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Employee Warnings from Admin */}
          {employeeWarnings.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                <FiAlertCircle className="text-[#325946] flex-shrink-0" />
                <span>Performance & Conduct Warnings</span>
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {employeeWarnings.map((warning) => (
                  <div
                    key={warning._id}
                    className={`border rounded-lg p-4 sm:p-5 shadow-sm ${getSeverityColor(warning.severity)}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                      <div className="flex items-start gap-3">
                        <FiAlertCircle className={`mt-1 flex-shrink-0 ${getSeverityIcon(warning.severity)}`} size={24} />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 break-words">
                            {warning.title}
                          </h4>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <FiCalendar size={14} />
                              <span>{formatDate(warning.createdAt)}</span>
                            </div>
                            {warning.issuedBy && (
                              <div className="flex items-center gap-1">
                                <FiUser size={14} />
                                <span className="break-words">By: {warning.issuedBy.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getSeverityBadge(warning.severity)} self-start sm:self-auto flex-shrink-0`}>
                        {warning.severity}
                      </span>
                    </div>

                    <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 mb-3">
                      <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Description:</p>
                      <p className="text-gray-800 text-xs sm:text-sm break-words">{warning.description}</p>
                    </div>

                    {warning.notes && (
                      <div className="bg-white border border-gray-200 rounded p-3 sm:p-4 mb-3">
                        <p className="text-xs sm:text-sm font-medium text-gray-700 mb-2">Additional Notes:</p>
                        <p className="text-gray-800 text-xs sm:text-sm break-words">{warning.notes}</p>
                      </div>
                    )}

                    <div className="mt-3 text-xs text-gray-600 italic">
                      Please take note of this feedback and work on improving in these areas.
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Extension Request Warnings */}
          {extensionWarnings.length > 0 && (
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center gap-2">
                <FiAlertTriangle className="text-yellow-600 flex-shrink-0" />
                <span>Extension Request Warnings</span>
              </h3>
              <div className="space-y-3 sm:space-y-4">
                {extensionWarnings.map((warning) => (
                  <div
                    key={warning._id}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-5 shadow-sm"
                  >
                    <div className="flex items-start gap-3">
                      <FiAlertTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={24} />
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-yellow-900 break-words">
                              Warning Issued
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-xs sm:text-sm text-yellow-700">
                              <div className="flex items-center gap-1">
                                <FiCalendar size={14} />
                                <span>Date: {formatDate(warning.requestedDate)}</span>
                              </div>
                              {warning.respondedBy && (
                                <div className="flex items-center gap-1">
                                  <FiUser size={14} />
                                  <span className="break-words">By: {warning.respondedBy.name}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded self-start sm:self-auto flex-shrink-0">
                            {formatDate(warning.respondedAt)}
                          </span>
                        </div>

                        <div className="bg-white border border-yellow-200 rounded p-3 mb-3">
                          <p className="text-xs sm:text-sm font-medium text-gray-700 mb-1">
                            Your Request Reason:
                          </p>
                          <p className="text-gray-800 text-xs sm:text-sm break-words">{warning.reason}</p>
                        </div>

                        <div className="bg-yellow-100 border border-yellow-300 rounded p-3 mb-3">
                          <p className="text-xs sm:text-sm font-medium text-yellow-900 mb-1">
                            Admin Warning Message:
                          </p>
                          <p className="text-yellow-900 text-xs sm:text-sm font-medium break-words">
                            {warning.adminNote}
                          </p>
                        </div>

                        <div className="mt-3 text-xs text-yellow-600 italic">
                          Note: While your extension was approved, please be mindful of
                          the admin's feedback for future requests.
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WarningsContent;
