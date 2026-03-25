import React from "react";
import { FiAward, FiUsers, FiHeart, FiShield } from "react-icons/fi";
import { FaUsers } from "react-icons/fa";
import { BsShieldFillPlus, BsShieldCheck } from "react-icons/bs";
import { GrLineChart } from "react-icons/gr";
import { FaUserDoctor, FaBuildingColumns } from "react-icons/fa6";

import logo from "../assets/logo.png";

const About = () => {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 flex flex-col-reverse md:flex-row items-center gap-10">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#325946] mb-4">
            About <span className="text-[#a1cc59]">Medi-Tech Remedies</span>
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            Welcome to{" "}
            <span className="font-semibold">
              Medi-Tech Remedies
            </span>
            , your trusted partner in health and wellness. We are dedicated to
            providing high-quality medical products and exceptional service to
            help you live your healthiest life.
          </p>
        </div>

        <div className="md:w-1/2 flex justify-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-4">
            <div className="flex items-center gap-2 bg-white border border-cyan-200 shadow-sm px-5 py-3 rounded-full">
              <FaUsers className="text-cyan-600 text-xl" />
              <span className="text-cyan-700 font-semibold text-sm">
                Trusted by 10,000+ customers
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white border border-green-200 shadow-sm px-5 py-3 rounded-full">
              <FaUserDoctor className="text-green-600 text-xl" />
              <span className="text-green-700 font-semibold text-sm">
                Suggested by doctors
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Company Story & Mission - Clean Card Style */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col md:flex-row gap-8 items-center">
          <div className="md:w-2/3">
            <h2 className="text-2xl font-bold text-[#325946] mb-4 flex items-center gap-2">
              <FaBuildingColumns className="text-[#a1cc59] text-3xl" /> Who We
              Are
            </h2>
            <div className="bg-[#f6fef7] rounded-xl p-6 shadow mb-4">
              <p className="text-gray-700 mb-3">
                <span className="font-semibold text-[#a1cc59]">
                  Alvin Willcure Labs Pvt. Ltd.
                </span>{" "}
                was established in 2004 by a young and enthusiastic team
                committed to making a difference in the healthcare sector. Since
                then, we have worked across a wide range of medical specialties,
                always striving to improve health standards and fulfill our
                social responsibilities.
              </p>
              <p className="text-gray-700 mb-3">
                Our journey has been marked by the trust and confidence of our
                customers and partners, inspiring us to grow and bring
                innovative solutions to medical science.
              </p>
              <p className="text-gray-700 mb-3">
                In 2000, we launched{" "}
                <span className="font-semibold text-[#a1cc59]">
                  Medi-Tech Remedies
                </span>
                —a dedicated division focused on advanced, reliable, and
                affordable dental care products for India, under the umbrella of
                Alvin Willcure Labs Pvt. Ltd.
              </p>
            </div>
          </div>
          <div className="md:w-1/3 flex flex-col items-center justify-center">
            <img
              src={logo}
              alt="Meditech Remedies Logo"
              className="w-48 h-48 object-contain drop-shadow-xl rounded-2xl bg-[#f6fef7] p-4 mb-4"
            />
            <div className="bg-[#f6fef7] rounded-xl p-6 shadow flex flex-col items-center">
              <BsShieldFillPlus className="text-5xl text-[#a1cc59] mb-3" />
              <h3 className="font-bold text-lg text-[#325946] mb-2">
                Trusted. Innovative. Caring.
              </h3>
              <p className="text-gray-600 text-sm text-center">
                Making a difference in healthcare, one smile at a time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 ">
            <h2 className="text-2xl font-bold text-[#325946] mb-3 flex items-center gap-2">
              <FiHeart className="text-[#a1cc59] text-3xl" /> Our Mission
            </h2>
            <p className="text-gray-700">
              Deliver the best and latest dental care products for all,
              supporting community well-being without financial strain.
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-[#325946] mb-3 flex items-center gap-2">
              <GrLineChart className="text-[#a1cc59] text-3xl" /> Our Vision
            </h2>
            <p className="text-gray-700">
              To be the most trusted and innovative healthcare partner, making
              quality healthcare accessible to everyone, everywhere.
            </p>
          </div>
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-center text-[#325946] mb-10">
          Why Choose <span className="text-[#a1cc59]">Us?</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition">
            <FiAward className="text-4xl text-[#a1cc59] mb-3" />
            <h3 className="font-semibold text-lg mb-2">Quality Products</h3>
            <p className="text-gray-600 text-sm">
              We offer only the best, certified, and thoroughly tested medical
              products.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition">
            <FiUsers className="text-4xl text-[#a1cc59] mb-3" />
            <h3 className="font-semibold text-lg mb-2">Expert Team</h3>
            <p className="text-gray-600 text-sm">
              Our team consists of experienced healthcare professionals and
              support staff.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition">
            <FiHeart className="text-4xl text-[#a1cc59] mb-3" />
            <h3 className="font-semibold text-lg mb-2">Customer Care</h3>
            <p className="text-gray-600 text-sm">
              We are committed to your satisfaction and well-being, every step
              of the way.
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-xl transition">
            <BsShieldCheck className="text-4xl text-[#a1cc59] mb-3" />
            <h3 className="font-semibold text-lg mb-2">Secure & Reliable</h3>
            <p className="text-gray-600 text-sm">
              Your privacy and safety are our top priorities, always.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 py-12 text-center flex gap-4">
        <div className="inline-block bg-[#a1cc59] text-white rounded-xl px-8 py-5 shadow-lg w-1/2">
          <h3 className="text-2xl font-bold mb-2">
            Ready to experience better oral health?
          </h3>
          <p className="mb-4">
            Explore our expertly crafted oral care products for a beautiful
            smile.
          </p>
          <a
            href="/products"
            className="inline-block bg-white text-[#325946] font-semibold px-6 py-2 rounded-full shadow hover:bg-[#325946]/50 hover:text-white transition"
          >
            Our Products
          </a>
        </div>
        <div className="inline-block bg-[#a1cc59] text-white rounded-xl px-8 py-5 shadow-lg w-1/2">
          <h3 className="text-2xl font-bold mb-2">
            Offer Your Brand, Our Manufacturing
          </h3>
          <p className="mb-4">
            Partner with us for contract manufacturing of medical products—your
            label, our quality.
          </p>
          <a
            href="/contact"
            className="inline-block bg-white text-[#325946] font-semibold px-6 py-2 rounded-full shadow hover:bg-[#325946]/50 hover:text-white transition"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
