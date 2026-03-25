import React from "react";
import { Link } from "react-router-dom";
import { HiLocationMarker, HiPhone } from "react-icons/hi";
import { FaHeart } from "react-icons/fa";
import logo from "../assets/logo.png";
import { FaMapLocationDot } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="bg-[#325946] text-white py-8">
      <div className="container mx-auto px-4 lg:px-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info - Full width on tablet */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3">
              <img
                src={logo}
                alt="MR Logo"
                className="h-10 w-10 md:h-12 md:w-12 rounded-full"
              />
              <div>
                <h2 className="text-lg md:text-xl font-bold">
                  Medi-Tech Remedies
                </h2>
                <p className="text-[#a1cc59] text-xs md:text-sm">
                  Division of Alvin Willcure <br /> Labs Pvt Ltd.
                </p>
              </div>
            </div>
            <p className="text-gray-300 text-sm md:text-base">
              Your trusted partner for quality healthcare products and medical
              supplies.
            </p>
          </div>

          {/* Quick Links */}
          <div className="sm:pl-4 lg:pl-0">
            <h3 className="text-lg md:text-xl font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="hover:text-[#a1cc59] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-[#a1cc59] transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-[#a1cc59] transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-[#a1cc59] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="sm:pl-4 lg:pl-0">
            <h3 className="text-lg md:text-xl font-semibold mb-4">
              Categories
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="hover:text-[#a1cc59] transition-colors"
                >
                  Mouth Wash
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-[#a1cc59] transition-colors"
                >
                  Mouth Spray
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-[#a1cc59] transition-colors"
                >
                  Dental Care
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="hover:text-[#a1cc59] transition-colors"
                >
                  Gum Care
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info - Full width on tablet */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg md:text-xl font-semibold mb-4">Contact</h3>
            <div className="space-y-3">
              <p className="flex items-start space-x-2">
                <FaMapLocationDot className="h-6 w-6 flex-shrink-0" />
                <span>
                  Ambernath East, Dist. Thana, Maharashtra.
                </span>
              </p>
              <p className="flex items-start space-x-2">
                <HiLocationMarker className="h-6 w-6 flex-shrink-0" />
                <span>
                  <b>Correspondence Address:</b> 8, Chaitanya Market, Bhopal 462001
                </span>
              </p>
              <p className="flex items-center space-x-2">
                <HiPhone className="h-6 w-6" />
                <span>+91 9425010528</span>
              </p>
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-[#82bd60]/30 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-baseline justify-between gap-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1">
              <span className="text-sm">Designed and</span>
              <span className="text-sm">Developed</span>
              <span className="text-sm">with</span>
              <FaHeart className="text-red-500 animate-pulse w-4 h-4" />
              <span className="text-sm">by</span>
              <a
                className="text-[#a1cc59] text-sm"
                href="https://www.linkedin.com/in/raj-vardhan-3615b9151/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Raj Vardhan
              </a>
            </div>
            <div className="text-sm text-center md:text-left">
              All rights are reserved to Medi-Tech Remedies
            </div>
            <div className="text-sm whitespace-nowrap">
              &copy; {new Date().getFullYear()} Medi-Tech Remedies
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
