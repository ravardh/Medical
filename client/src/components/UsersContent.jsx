import React, { useState, useEffect } from "react";
import axios from "../config/api";
import toast from "react-hot-toast";
import AddUserModal from "./modals/AddUserModal";
import EditUserModal from "./modals/EditUserModal";
import ViewEmployeeReportsModal from "./modals/ViewEmployeeReportsModal";
import ViewEmployeeWarningsModal from "./modals/ViewEmployeeWarningsModal";
import OTPVerificationModal from "./modals/OTPVerificationModal";
import IssueWarningModal from "./modals/IssueWarningModal";
import { FiEdit, FiTrash2, FiUser, FiEye, FiAlertTriangle, FiMail, FiAlertCircle } from "react-icons/fi";

const UsersContent = () => {
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewReportsModalOpen, setIsViewReportsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeWarnings, setEmployeeWarnings] = useState([]);
  const [loadingWarnings, setLoadingWarnings] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isOTPModalOpen, setIsOTPModalOpen] = useState(false);
  const [pendingReenableUserId, setPendingReenableUserId] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);
  const [isIssueWarningModalOpen, setIsIssueWarningModalOpen] = useState(false);
  const [selectedUserForWarning, setSelectedUserForWarning] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/admin/users", {
        withCredentials: true,
      });
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      toast.error("Failed to fetch users");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (userId, userName) => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <div className="font-semibold text-gray-900">Confirm Employee Removal</div>
        <div className="text-sm text-gray-600">
          Are you sure you want to remove <span className="font-semibold">{userName}</span>?
        </div>
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          ⚠️ Note: This is for testing purposes only.
        </div>
        <div className="flex gap-2 justify-end mt-2">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                const response = await axios.delete(`/admin/users/${userId}`, {
                  withCredentials: true,
                });
                setUsers((prev) => prev.filter((u) => u._id !== userId));
                toast.success(response.data.message || "Employee removed successfully");
              } catch (error) {
                toast.error(
                  error.response?.data?.message || "Failed to remove employee"
                );
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
          >
            Confirm Remove
          </button>
        </div>
      </div>
    ), {
      duration: 8000,
      position: 'top-center',
    });
  };

  const fetchEmployeeWarnings = async (employeeId, employeeName) => {
    try {
      setLoadingWarnings(true);
      setSelectedEmployee({ id: employeeId, name: employeeName });
      
      // Fetch time extension request warnings
      const extensionRes = await axios.get("/admin/time-extension-requests", {
        withCredentials: true,
      });
      const extensionWarnings = extensionRes.data.filter(
        (req) => req.employee?._id === employeeId && req.status === "approved" && req.isWarning === true
      );
      
      // Fetch employee performance warnings
      const performanceRes = await axios.get(`/admin/warnings/${employeeId}`, {
        withCredentials: true,
      });
      
      // Combine both types of warnings
      const allWarnings = [...performanceRes.data, ...extensionWarnings];
      setEmployeeWarnings(allWarnings);
    } catch (error) {
      console.error("Error fetching employee warnings:", error);
      toast.error("Failed to fetch employee warnings");
    } finally {
      setLoadingWarnings(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleViewReports = (user) => {
    setSelectedUser(user);
    setIsViewReportsModalOpen(true);
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      // If account is disabled (trying to enable), require OTP
      if (currentStatus === false) {
        // Generate and send OTP
        const res = await axios.post(
          `/admin/users/${userId}/generate-reenable-otp`,
          {},
          { withCredentials: true }
        );
        
        toast.success(res.data.message);
        setPendingReenableUserId(userId);
        setIsOTPModalOpen(true);
        return;
      }

      // If account is active (trying to disable), proceed normally
      const res = await axios.patch(
        `/admin/users/${userId}/toggle-status`,
        {},
        { withCredentials: true }
      );
      
      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId ? { ...u, isActive: res.data.user.isActive } : u
        )
      );
      toast.success(res.data.message);
      if (res.data.emailStatus === "sent") {
        toast.success("Account disabled notification email sent.");
      } else if (res.data.emailStatus === "failed") {
        toast.error("Failed to send account disabled notification email.");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.error(
        error.response?.data?.message || "Failed to update user status"
      );
    }
  };

  const handleVerifyOTP = async (otp) => {
    if (!pendingReenableUserId) return;

    try {
      setOtpLoading(true);
      const res = await axios.post(
        `/admin/users/${pendingReenableUserId}/verify-reenable-otp`,
        { otp },
        { withCredentials: true }
      );

      // Update local state
      setUsers((prev) =>
        prev.map((u) =>
          u._id === pendingReenableUserId ? { ...u, isActive: res.data.user.isActive } : u
        )
      );

      toast.success(res.data.message);
      setIsOTPModalOpen(false);
      setPendingReenableUserId(null);
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(
        error.response?.data?.message || "Failed to verify OTP"
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!pendingReenableUserId) return;

    try {
      const res = await axios.post(
        `/admin/users/${pendingReenableUserId}/generate-reenable-otp`,
        { isResend: true }, // Flag to indicate this is a resend request
        { withCredentials: true }
      );

      toast.success(res.data.message || "New OTP sent successfully!");
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error(
        error.response?.data?.message || "Failed to resend OTP"
      );
      throw error; // Re-throw to let modal handle the error state
    }
  };

  const handleCloseOTPModal = () => {
    setIsOTPModalOpen(false);
    setPendingReenableUserId(null);

    // Note: We don't clear backend rate limiting data on modal close
    // because user might reopen modal with the same OTP within 10 minutes.
    // Backend will allow initial request again, only resends are rate-limited.
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.phone.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <h2 className="text-2xl font-semibold text-gray-800 mb-3">
        Employees Management
      </h2>
      <div className="bg-white rounded-lg shadow p-3">
        <div className="flex justify-between mb-3 flex-wrap gap-3">
          <button
            onClick={() => setIsAddUserModalOpen(true)}
            className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-700 transition-colors"
          >
            Add New Employee
          </button>
          <input
            type="search"
            placeholder="Search employees..."
            className="border rounded-md px-4 py-2 w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FiUser size={48} className="mx-auto mb-4 opacity-50" />
            <p>No employees found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-3">
              {filteredUsers.map((user) => (
                <div key={user._id} className="border rounded-lg p-4 bg-gray-50 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-gray-500">{user.phone} · <span className="capitalize">{user.gender}</span></p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none touch-manipulation ${
                          user.isActive !== false ? "bg-cyan-600" : "bg-gray-300"
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${user.isActive !== false ? "translate-x-6" : "translate-x-1"}`} />
                      </button>
                      <span className={`text-xs font-medium ${user.isActive !== false ? "text-green-600" : "text-red-600"}`}>
                        {user.isActive !== false ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 border-t pt-3">
                    <button onClick={() => handleViewReports(user)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                      <FiEye size={12} /> Reports
                    </button>
                    <button onClick={() => fetchEmployeeWarnings(user._id, user.name)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded hover:bg-yellow-100">
                      <FiAlertTriangle size={12} /> Warnings
                    </button>
                    <button onClick={() => handleEdit(user)} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded hover:bg-cyan-100">
                      <FiEdit size={12} /> Edit
                    </button>
                    <button onClick={() => { setSelectedUserForWarning(user); setIsIssueWarningModalOpen(true); }} className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded hover:bg-orange-100">
                      <FiAlertCircle size={12} /> Issue Warning
                    </button>
                    <button
                      onClick={async () => {
                        const password = window.prompt("Enter a new password to include in the welcome email:");
                        if (!password) { toast.error("Password is required to resend email."); return; }
                        try {
                          const res = await axios.post(`/admin/users/${user._id}/resend-welcome`, { password }, { withCredentials: true });
                          toast.success(res.data.message || "Welcome email resent successfully");
                        } catch (err) {
                          toast.error(err.response?.data?.message || "Failed to resend email");
                        }
                      }}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100"
                    >
                      <FiMail size={12} /> Resend Email
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <table className="hidden sm:table min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Gender
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{user.phone}</div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500 capitalize">
                        {user.gender}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 touch-manipulation ${
                            user.isActive !== false ? "bg-cyan-600" : "bg-gray-300"
                          }`}
                          title={user.isActive !== false ? "Click to disable" : "Click to enable"}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              user.isActive !== false ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-medium ${
                          user.isActive !== false ? "text-green-600" : "text-red-600"
                        }`}>
                          {user.isActive !== false ? "Active" : "Disabled"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewReports(user)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
                        >
                          <FiEye size={14} />
                          Reports
                        </button>
                        <button
                          onClick={() => fetchEmployeeWarnings(user._id, user.name)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-yellow-700 bg-yellow-50 border border-yellow-200 rounded hover:bg-yellow-100 transition-colors"
                        >
                          <FiAlertTriangle size={14} />
                          Warnings
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded hover:bg-cyan-100 transition-colors"
                        >
                          <FiEdit size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUserForWarning(user);
                            setIsIssueWarningModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded hover:bg-orange-100 transition-colors"
                        >
                          <FiAlertCircle size={14} />
                          Issue Warning
                        </button>
                        <button
                          onClick={async () => {
                            const password = window.prompt("Enter a new password to include in the welcome email:");
                            if (!password) {
                              toast.error("Password is required to resend email.");
                              return;
                            }
                            try {
                              const res = await axios.post(`/admin/users/${user._id}/resend-welcome`, { password }, { withCredentials: true });
                              toast.success(res.data.message || "Welcome email resent successfully");
                            } catch (err) {
                              toast.error(err.response?.data?.message || "Failed to resend email");
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-sm font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded hover:bg-purple-100 transition-colors"
                        >
                          <FiMail size={14} />
                          Resend Email
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddUserModalOpen && (
        <AddUserModal
          isOpen={isAddUserModalOpen}
          onClose={() => setIsAddUserModalOpen(false)}
          onSuccess={() => {
            fetchUsers();
            setIsAddUserModalOpen(false);
          }}
        />
      )}

      {isEditModalOpen && selectedUser && (
        <EditUserModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
          onSuccess={() => {
            fetchUsers();
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
        />
      )}

      {isViewReportsModalOpen && selectedUser && (
        <ViewEmployeeReportsModal
          isOpen={isViewReportsModalOpen}
          onClose={() => {
            setIsViewReportsModalOpen(false);
            setSelectedUser(null);
          }}
          employee={selectedUser}
        />
      )}

      {selectedEmployee && (
        <ViewEmployeeWarningsModal
          isOpen={!!selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
          employee={selectedEmployee}
          warnings={employeeWarnings}
          loading={loadingWarnings}
        />
      )}

      {isOTPModalOpen && (
        <OTPVerificationModal
          isOpen={isOTPModalOpen}
          onClose={handleCloseOTPModal}
          onVerify={handleVerifyOTP}
          onResend={handleResendOTP}
          loading={otpLoading}
        />
      )}

      {isIssueWarningModalOpen && selectedUserForWarning && (
        <IssueWarningModal
          isOpen={isIssueWarningModalOpen}
          onClose={() => {
            setIsIssueWarningModalOpen(false);
            setSelectedUserForWarning(null);
          }}
          employee={selectedUserForWarning}
          onSuccess={() => {
            setIsIssueWarningModalOpen(false);
            setSelectedUserForWarning(null);
          }}
        />
      )}
    </div>
  );
};

export default UsersContent;
