import React, { useState } from "react";
import { FiX, FiAlertTriangle } from "react-icons/fi";
import axios from "../../config/api";
import toast from "react-hot-toast";

const IssueWarningModal = ({ isOpen, onClose, employee, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    severity: "medium",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !employee) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `/admin/warnings/${employee._id}`,
        formData,
        { withCredentials: true }
      );
      toast.success(res.data.message);
      onSuccess();
      onClose();
      setFormData({ title: "", description: "", severity: "medium", notes: "" });
    } catch (error) {
      console.error("Error issuing warning:", error);
      toast.error(error.response?.data?.message || "Failed to issue warning");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed top-16 left-0 right-0 bottom-0 bg-black/50 flex items-center justify-center overflow-y-auto py-4 px-4 sm:py-8 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-[#325946] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/10 p-2 rounded-lg">
                <FiAlertTriangle size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">Issue Warning</h2>
                <p className="text-white/80 text-sm">To: {employee.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors"
              disabled={loading}
            >
              <FiX size={22} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Warning Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              placeholder="e.g., Unprofessional Behavior"
              required
              disabled={loading}
            />
          </div>

          {/* Severity */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Severity <span className="text-red-500">*</span>
            </label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
              disabled={loading}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              placeholder="Provide detailed description of the issue..."
              required
              disabled={loading}
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="2"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
              placeholder="Any additional information..."
              disabled={loading}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#325946] text-white rounded-lg hover:bg-[#4a7a5d] disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-medium"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Issuing...
                </span>
              ) : (
                "Issue Warning"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IssueWarningModal;
