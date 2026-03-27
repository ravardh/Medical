import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../config/api";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("/auth/login", formData);
      if (response.data) {
        // Update auth context
        login(response.data.token, response.data);

        // Redirect based on user role
        const userRole = response.data.user?.role;

        if (userRole === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/employee-dashboard");
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-gradient-to-r from-cyan-50 to-blue-50 py-2 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900">
            Medi-Tech Remedies
          </h2>
          <p className="mt-2 text-center text-sm text-[#a1cc59]">
            Enter your credentials to access the dashboard
          </p>
        </div>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          <div className="grid gap-5">
            <div>
              <input
                name="email"
                type="email"
                required
                className="w-[100%] p-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a1cc59] transition-colors duration-200"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <input
                name="password"
                type="password"
                required
                className="w-[100%] p-3 rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a1cc59] transition-colors duration-200"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#a1cc59] hover:bg-[#325946] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors duration-200"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
