import React, { useState } from "react";
import axios from "../../config/api";
import toast from "react-hot-toast";

const RequestExtensionModal = ({ isOpen, onClose, onSuccess, selectedDate }) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }

    try {
      setIsSubmitting(true);
      await axios.post(
        "/mr/time-extension-requests",
        {
          requestedDate: selectedDate,
          reason: reason.trim(),
        },
        { withCredentials: true }
      );
      toast.success("Extension request submitted successfully");
      setReason("");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error submitting request:", error);
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-4 px-4 sm:py-8">
      <div className="bg-white rounded-lg max-w-md w-full my-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-xl font-semibold text-gray-800">
            Request Time Extension
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selected Date
            </label>
            <input
              type="text"
              value={
                selectedDate
                  ? new Date(selectedDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : ""
              }
              disabled
              className="w-full border rounded-md px-3 py-2 bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Extension <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Explain why you need to submit a report for this date..."
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              required
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Your request will be reviewed by an admin. You
              will be able to submit the report once approved.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-cyan-600 text-white rounded-md hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestExtensionModal;
