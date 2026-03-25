import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import About from './pages/About'
import Contact from './pages/Contact'
import Login from './pages/Login'
import PostReview from './pages/Review'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import ScrolltoTop from './components/ScrolltoTop'

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrolltoTop />
        <div className="min-h-screen bg-white flex flex-col">
          <Toaster />
          <Navbar />
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<AdminDashboard />} />
              <Route path="/employee-dashboard" element={<EmployeeDashboard />} />
              <Route path="/review" element={<PostReview />} />
              {/* Add more routes as needed */}
              <Route path="*" element={<div className="text-center text-gray-500">Page Not Found</div>} />

            </Routes>
          </div>
          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App