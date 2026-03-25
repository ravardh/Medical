import React, { useState } from "react";
import axios from "../../config/api";
import toast from "react-hot-toast";
import { FiCalendar, FiX } from "react-icons/fi";

const ApplyLeaveModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    leaveType: "casual",
    numberOfDays: "",
    startDate: "",
    reason: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "numberOfDays") {
      setFormData({
        ...formData,
        numberOfDays: value,
        startDate: "", // Reset date when days change
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const calculateEndDate = (startDate, days) => {
    const numDays = parseInt(days);
    if (!startDate || !numDays || numDays <= 0) return null;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + (numDays - 1));
    return end.toISOString().split('T')[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numDays = parseInt(formData.numberOfDays);

    if (!formData.numberOfDays || !numDays || numDays <= 0) {
      toast.error("Please enter a valid number of days");
      return;
    }

    if (!formData.startDate || !formData.reason.trim()) {
      toast.error("Please fill all required fields");
      return;
    }

    const endDate = calculateEndDate(formData.startDate, formData.numberOfDays);

    try {
      setLoading(true);
      const response = await axios.post("/mr/leaves", {
        leaveType: formData.leaveType,
        startDate: formData.startDate,
        endDate: endDate,
        reason: formData.reason,
      }, {
        withCredentials: true,
      });

      toast.success("Leave application submitted successfully");

      // Show email notification status
      if (response.data.emailSent) {
        toast.success("📧 Email notification sent to admin", { duration: 3000 });
      } else {
        toast.error("⚠️ Failed to send email notification", { duration: 4000 });
      }

      setFormData({
        leaveType: "casual",
        numberOfDays: "",
        startDate: "",
        reason: "",
      });
      onSuccess();
    } catch (error) {
      console.error("Error applying for leave:", error);
      toast.error(error.response?.data?.message || "Failed to submit leave application");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-4 px-4 sm:py-8">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-[#325946] text-white p-3 sm:p-4 flex items-center justify-between rounded-t-lg flex-shrink-0">
          <div className="flex items-center gap-2">
            <FiCalendar className="hidden sm:block" size={24} />
            <FiCalendar className="sm:hidden" size={20} />
            <h3 className="text-base sm:text-lg font-semibold">Apply for Leave</h3>
          </div>
          <button onClick={onClose} className="text-white hover:text-gray-200 flex-shrink-0">
            <FiX className="hidden sm:block" size={24} />
            <FiX className="sm:hidden" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3 sm:p-6 overflow-y-auto flex-1">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Leave Type <span className="text-red-500">*</span>
              </label>
              <select
                name="leaveType"
                value={formData.leaveType}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#325946] text-sm sm:text-base"
                required
              >
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="annual">Annual Leave</option>
                <option value="emergency">Emergency Leave</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Number of Days <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="numberOfDays"
                value={formData.numberOfDays}
                onChange={handleChange}
                min="1"
                placeholder="Enter number of days"
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#325946] text-sm sm:text-base"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                {parseInt(formData.numberOfDays) === 1 ? "Date" : "Start Date"} <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="w-full px-3 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#325946] text-sm sm:text-base"
                required
              />
              {parseInt(formData.numberOfDays) > 1 && formData.startDate && (
                <p className="text-xs text-gray-600 mt-1.5">
                  End Date: {calculateEndDate(formData.startDate, formData.numberOfDays)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#325946] resize-none text-xs sm:text-sm"
                placeholder="Please provide a reason for your leave..."
                required
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 sm:py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 sm:py-2 bg-[#325946] text-white rounded-lg hover:bg-[#4a7a5d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base font-medium"
            >
              {loading ? "Submitting..." : "Submit Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeaveModal;
