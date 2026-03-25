import React from "react";
import { Link } from "react-router-dom";

const Offers = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Special Offer */}
          <div className="bg-[#325946]/90 rounded-xl p-8 text-white shadow-lg">
            <span className="inline-block px-4 py-1 bg-[#a1cc59] rounded-full text-sm font-medium mb-4">
              Special Offer
            </span>
            <h3 className="text-2xl font-bold mb-4">
              Special Offers on Bulk Order
            </h3>
            <p className="mb-6 text-gray-200">
              Take advantage of our limited-time offer on premium quality
              Products. Boost your health today!
            </p>
            <Link
              to="/contact"
              className="inline-block bg-white text-[#325946] px-6 py-2 rounded-full font-medium hover:bg-[#a1cc59] hover:text-white transition-colors"
            >
              Contact us to Order
            </Link>
          </div>

          {/* New Arrivals */}
          <div className="bg-[#325946]/90 rounded-xl p-8 text-white shadow-lg">
            <span className="inline-block px-4 py-1 bg-[#a1cc59] rounded-full text-sm font-medium mb-4">
              New Arrival
            </span>
            <h3 className="text-2xl font-bold mb-4">
              Latest Oral Care Products
            </h3>
            <p className="mb-6 text-gray-200">
              Discover our latest range of innovative oral care solutions
              designed to give you a brighter, healthier smile.
            </p>

            <Link
              to="/products"
              className="inline-block bg-white text-[#325946] px-6 py-2 rounded-full font-medium hover:bg-[#a1cc59] hover:text-white transition-colors"
            >
              Explore Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offers;
