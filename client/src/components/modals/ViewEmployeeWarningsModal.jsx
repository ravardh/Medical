import React from "react";
import { FiAlertTriangle, FiAlertCircle, FiCalendar, FiUser } from "react-icons/fi";

const ViewEmployeeWarningsModal = ({ isOpen, onClose, employee, warnings, loading }) => {
  if (!isOpen) return null;

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

  const isPerformanceWarning = (warning) => {
    return warning.title && warning.severity; // Performance warnings have title and severity
  };

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-4 px-4 sm:py-8">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
        <div className="bg-yellow-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertTriangle size={24} />
            <h3 className="text-lg font-semibold">
              Warnings for {employee?.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-64px)]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
            </div>
          ) : warnings.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto mb-3 text-green-500">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-700">No Warnings</p>
              <p className="text-gray-500 mt-1">This employee has a clean record.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {warnings.map((warning) => 
                isPerformanceWarning(warning) ? (
                  // Performance Warning Display
                  <div
                    key={warning._id}
                    className={`border rounded-lg p-4 ${getSeverityColor(warning.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <FiAlertCircle className={`mt-1 flex-shrink-0 ${getSeverityIcon(warning.severity)}`} size={20} />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {warning.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <FiCalendar size={12} />
                              <span>{formatDate(warning.createdAt)}</span>
                            </div>
                            {warning.issuedBy && (
                              <div className="flex items-center gap-1">
                                <FiUser size={12} />
                                <span>By: {warning.issuedBy.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase ${getSeverityBadge(warning.severity)}`}>
                        {warning.severity}
                      </span>
                    </div>

                    <div className="bg-white border border-gray-200 rounded p-3 mb-2">
                      <p className="text-xs font-medium text-gray-600 mb-1">Description:</p>
                      <p className="text-sm text-gray-800">{warning.description}</p>
                    </div>

                    {warning.notes && (
                      <div className="bg-white border border-gray-200 rounded p-3">
                        <p className="text-xs font-medium text-gray-600 mb-1">Additional Notes:</p>
                        <p className="text-sm text-gray-800">{warning.notes}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Extension Request Warning Display
                  <div
                    key={warning._id}
                    className="bg-yellow-50 border border-yellow-200 rounded-lg p-4"
                  >
                    <div className="flex items-start gap-3">
                      <FiAlertTriangle className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-yellow-900">
                            Extension Request Warning
                          </span>
                          <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">
                            {formatDate(warning.respondedAt)}
                          </span>
                        </div>

                        <div className="bg-white border border-yellow-200 rounded p-3 mb-2">
                          <p className="text-xs font-medium text-gray-600 mb-1">Employee's Reason:</p>
                          <p className="text-sm text-gray-800">{warning.reason}</p>
                        </div>

                        <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
                          <p className="text-xs font-medium text-yellow-900 mb-1">Warning Message:</p>
                          <p className="text-sm text-yellow-900 font-medium">{warning.adminNote}</p>
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          Issued by: {warning.respondedBy?.name || "Admin"}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewEmployeeWarningsModal;
