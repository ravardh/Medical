import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const handleMenuClick = () => {
    setIsMenuOpen(false)
  }

  const handleDashboardClick = () => {
    if (user?.role === 'admin') {
      navigate('/dashboard')
    } else {
      navigate('/employee-dashboard')
    }
    setIsMenuOpen(false)
  }

  return (
    <nav className="bg-[#325946] py-3 px-4 lg:px-10 shadow-lg sticky top-0 z-99 border-b-2 border-[#a1cc59]">
      <div className="container mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <img src={logo} alt="Logo" className="h-8 w-8 lg:h-12 lg:w-12 object-cover rounded-full" />
            <div className='grid'>
              <span className="text-white text-lg lg:text-2xl font-bold tracking-wide">
                Medi-Tech Remedies
              </span>
              <span className="text-[#a1cc59] text-xs lg:text-sm font-medium">
                Division of Alvin Willcure Labs Pvt Ltd.
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center">
            <NavLink 
              to="/" 
              className={({isActive}) => 
                `text-white hover:text-[#a1cc59] transition-colors duration-300 font-medium relative group ${isActive ? 'text-[#a1cc59]' : ''}`
              }
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#a1cc59] transition-all duration-300 group-hover:w-full"></span>
            </NavLink>
            <NavLink 
              to="/products" 
              className={({isActive}) => 
                `text-white hover:text-[#a1cc59] transition-colors duration-300 font-medium relative group ${isActive ? 'text-[#a1cc59]' : ''}`
              }
            >
              Products
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#a1cc59] transition-all duration-300 group-hover:w-full"></span>
            </NavLink>
            <NavLink 
              to="/about" 
              className={({isActive}) => 
                `text-white hover:text-[#a1cc59] transition-colors duration-300 font-medium relative group ${isActive ? 'text-[#a1cc59]' : ''}`
              }
            >
              About Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#a1cc59] transition-all duration-300 group-hover:w-full"></span>
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({isActive}) => 
                `text-white hover:text-[#a1cc59] transition-colors duration-300 font-medium relative group ${isActive ? 'text-[#a1cc59]' : ''}`
              }
            >
              Contact Us
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#a1cc59] transition-all duration-300 group-hover:w-full"></span>
            </NavLink>
            <NavLink 
              to="/review" 
              className={({isActive}) => 
                `text-white hover:text-[#a1cc59] transition-colors duration-300 font-medium relative group ${isActive ? 'text-[#a1cc59]' : ''}`
              }
            >
              Post a Review
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#a1cc59] transition-all duration-300 group-hover:w-full"></span>
            </NavLink>
            {isAuthenticated ? (
              <button
                onClick={handleDashboardClick}
                className="px-6 py-2 bg-[#a1cc59] text-[#325946] font-bold rounded-lg hover:bg-[#8bb84a] transition-colors duration-300"
              >
                Dashboard
              </button>
            ) : (
              <NavLink 
                to="/login" 
                className={({isActive}) => 
                  `px-6 py-2 bg-[#a1cc59] text-[#325946] font-bold rounded-lg hover:bg-[#8bb84a] transition-colors duration-300 ${isActive ? 'bg-[#8bb84a]' : ''}`
                }
              >
                Login
              </NavLink>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-[#a1cc59] focus:outline-none transition-colors duration-300"
            >
              <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-[#325946] shadow-lg border-t border-[#82bd60]/30 overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen ? 'max-h-[500px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
        }`}>
          <div className="flex flex-col space-y-6 py-4 px-6">
            <div className="flex flex-col space-y-4">
              <NavLink 
                to="/" 
                onClick={handleMenuClick}
                className={({isActive}) => 
                  `text-white hover:text-[#a1cc59] transition-colors duration-300 font-medium text-lg ${isActive ? 'text-[#a1cc59]' : ''}`
                }
              >
                Home
              </NavLink>
              <NavLink 
                to="/products" 
                onClick={handleMenuClick}
                className={({isActive}) => 
                  `text-white hover:text-[#a1cc59] transition-colors duration-300 font-medium text-lg ${isActive ? 'text-[#a1cc59]' : ''}`
                }
              >
                Products
              </NavLink>
              <NavLink 
                to="/about" 
                onClick={handleMenuClick}
                className={({isActive}) => 
                  `text-white hover:text-[#a1cc59] transition-colors duration-300 font-medium text-lg ${isActive ? 'text-[#a1cc59]' : ''}`
                }
              >
                About Us
              </NavLink>
              <NavLink 
                to="/contact" 
                onClick={handleMenuClick}
                className={({isActive}) => 
                  `text-white hover:text-[#a1cc59] transition-colors duration-300 font-medium text-lg ${isActive ? 'text-[#a1cc59]' : ''}`
                }
              >
                Contact Us
              </NavLink>
              <NavLink 
                to="/review" 
                onClick={handleMenuClick}
                className={({isActive}) => 
                  `text-white hover:text-[#a1cc59] transition-colors duration-300 font-medium text-lg ${isActive ? 'text-[#a1cc59]' : ''}`
                }
              >
                Post a Review
              </NavLink>
              {isAuthenticated ? (
                <button
                  onClick={handleDashboardClick}
                  className="px-4 py-2 bg-[#a1cc59] text-[#325946] font-bold rounded-lg hover:bg-[#8bb84a] transition-colors duration-300 text-lg inline-block text-left"
                >
                  Dashboard
                </button>
              ) : (
                <NavLink 
                  to="/login" 
                  onClick={handleMenuClick}
                  className={({isActive}) => 
                    `px-4 py-2 bg-[#a1cc59] text-[#325946] font-bold rounded-lg hover:bg-[#8bb84a] transition-colors duration-300 text-lg inline-block ${isActive ? 'bg-[#8bb84a]' : ''}`
                  }
                >
                  Login
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar