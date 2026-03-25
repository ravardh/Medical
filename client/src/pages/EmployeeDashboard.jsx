import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from 'js-cookie';
import axios from "../config/api";
import { useAuth } from "../context/AuthContext";
import {
  AiOutlineDashboard,
  AiOutlineLogout,
  AiOutlineUser,
} from "react-icons/ai";
import { BiPackage } from "react-icons/bi";
import { FiUsers, FiClipboard, FiAlertTriangle, FiCalendar, FiDollarSign } from "react-icons/fi";
import DoctorsContent from "../components/DoctorsContent";
import DailyCallContent from "../components/DailyCallContent";
import WarningsContent from "../components/WarningsContent";
import LeaveContent from "../components/LeaveContent";
import ExpenseContent from "../components/ExpenseContent";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchEmployeeInfo = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const userInfo = JSON.parse(localStorage.getItem("adminInfo"));
        
        console.log("EmployeeDashboard - Token:", token);
        console.log("EmployeeDashboard - Info:", userInfo);
        console.log("EmployeeDashboard - Role:", userInfo?.user?.role);
        
        if (!token) {
          console.log("No token, redirecting to login");
          navigate("/login");
          return;
        }

        // Check if user is not admin
        if (userInfo?.user?.role === "admin") {
          console.log("Is admin, redirecting to admin dashboard");
          navigate("/dashboard");
          return;
        }

        console.log("Employee verified, setting info");
        setEmployeeInfo(userInfo?.user);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching employee info:", error);
        navigate("/login");
      }
    };

    window.scrollTo(0, 0);
    fetchEmployeeInfo();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      // Clear auth context and local storage
      logout();
      Cookies.remove("jwt");
    } catch (error) {
      console.error("Logout error:", error);
      // Even if API fails, clear local auth
      logout();
    }
    navigate("/login");
  };

  const menuItems = [
    {
      id: "dashboard",
      icon: <AiOutlineDashboard size={20} />,
      title: "Dashboard",
    },
    { id: "doctors", icon: <FiUsers size={20} />, title: "My Doctors" },
    { id: "daily-call", icon: <FiClipboard size={20} />, title: "Daily Call Report" },
    { id: "expenses", icon: <FiDollarSign size={20} />, title: "Expense Statement" },
    { id: "leaves", icon: <FiCalendar size={20} />, title: "My Leaves" },
    { id: "warnings", icon: <FiAlertTriangle size={20} />, title: "Warnings" },
    { id: "profile", icon: <AiOutlineUser size={20} />, title: "My Profile" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              Welcome, {employeeInfo?.name}!
            </h1>
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-700 mb-4">
                Employee Dashboard
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Welcome to your Medical Representative dashboard. Use the menu to manage your doctors and submit daily call reports.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-blue-600 font-medium">Email</p>
                      <p className="text-sm sm:text-lg font-bold text-gray-800 mt-1 truncate">
                        {employeeInfo?.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-green-600 font-medium">Phone</p>
                      <p className="text-sm sm:text-lg font-bold text-gray-800 mt-1 truncate">
                        {employeeInfo?.phone}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-purple-600 font-medium">Role</p>
                      <p className="text-sm sm:text-lg font-bold text-gray-800 mt-1 capitalize">
                        Medical Representative
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "doctors":
        return <DoctorsContent isEmployee={true} />;
      case "daily-call":
        return <DailyCallContent isEmployee={true} />;
      case "expenses":
        return <ExpenseContent />;
      case "warnings":
        return <WarningsContent />;
      case "leaves":
        return <LeaveContent />;
      case "profile":
        return (
          <div className="p-4 sm:p-6">
            <div className="bg-white rounded-lg shadow p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
                My Profile
              </h2>
              <div className="space-y-3 sm:space-y-4">
                <div className="border-b pb-3 sm:pb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-600">
                    Full Name
                  </label>
                  <p className="text-base sm:text-lg text-gray-800 mt-1 break-words">
                    {employeeInfo?.name}
                  </p>
                </div>
                <div className="border-b pb-3 sm:pb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-600">
                    Email Address
                  </label>
                  <p className="text-base sm:text-lg text-gray-800 mt-1 break-words">
                    {employeeInfo?.email}
                  </p>
                </div>
                <div className="border-b pb-3 sm:pb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-600">
                    Phone Number
                  </label>
                  <p className="text-base sm:text-lg text-gray-800 mt-1 break-words">
                    {employeeInfo?.phone}
                  </p>
                </div>
                <div className="border-b pb-3 sm:pb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-600">
                    Gender
                  </label>
                  <p className="text-base sm:text-lg text-gray-800 mt-1 capitalize">
                    {employeeInfo?.gender}
                  </p>
                </div>
                <div className="border-b pb-3 sm:pb-4">
                  <label className="block text-xs sm:text-sm font-medium text-gray-600">
                    Role
                  </label>
                  <p className="text-base sm:text-lg text-gray-800 mt-1 capitalize">
                    Medical Representative
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-4 sm:p-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
              Welcome, {employeeInfo?.name}!
            </h1>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-2">{item.icon}</span>
                  <span>{item.title}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-200"
              >
                <AiOutlineLogout size={16} className="mr-2" />
                <span>Logout</span>
              </button>
            </nav>

            {/* Tablet Navigation */}
            <nav className="hidden md:flex lg:hidden items-center space-x-1">
              {menuItems.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative p-2 rounded-md transition-colors duration-200 ${
                    activeTab === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                  title={item.title}
                >
                  <span>{item.icon}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold text-white bg-red-500 rounded-full min-w-[18px] h-[18px]">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile/Tablet Dropdown */}
          <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="border-t border-gray-200 bg-white px-4 py-3 space-y-1">
              {(window.innerWidth < 768 ? menuItems : menuItems.slice(4)).map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-200 ${
                    activeTab === item.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                  {item.badge && item.badge > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}

              <div className="border-t border-gray-200 pt-3 mt-3">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors duration-200"
                >
                  <AiOutlineLogout size={18} className="mr-3" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>
    </div>
  );
};

export default EmployeeDashboard;
