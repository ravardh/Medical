import React, { useState } from "react";
import axios from "../config/api.jsx";
import { FiMail, FiPhone, FiMapPin } from "react-icons/fi";
import { FaWhatsapp } from 'react-icons/fa';
import { FaMapLocationDot } from "react-icons/fa6";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponseMsg({ type: "", text: "" });

    try {
      const { data } = await axios.post("/public/create", formData);
      setResponseMsg({ type: "success", text: data.message });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      setResponseMsg({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12 lg:py-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-cyan-800">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            We'd love to hear from you. Whether you have a question about our
            products, pricing, or anything else, our team is ready to answer all
            your questions.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden lg:grid lg:grid-cols-12">
          <div className="lg:col-span-5 bg-[#325946] text-white p-8 lg:p-12">
            <h3 className="text-3xl font-bold mb-6">Contact Information</h3>
            <p className="text-cyan-100 mb-8">
              Fill up the form and our Team will get back to you within 24
              hours.
            </p>
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <FiPhone className="text-2xl text-[#a1cc59]" />
                <a href="tel:+919425010528" className="text-md md:text-lg lg:text-lg">
                  +91 94250 10528
                </a>

              </div>
              <div className="flex items-center space-x-4">
                <FiMail className="text-2xl text-[#a1cc59]" />
                <a href="mailto:meditechremedies16@gmail.com" className="text-md md:text-lg lg:text-lg">
                  meditechremedies16@gmail.com
                </a>
              </div>
              <div className="flex items-start space-x-4">
                <FaMapLocationDot className="text-2xl text-[#a1cc59] mt-1" />
                <span className="text-md md:text-lg lg:text-lg">
                  Ambernath East, Dist. Thana, Maharashtra.
                </span>
              </div>
              <div className="flex items-start space-x-4">
                <FiMapPin className="text-2xl text-[#a1cc59] mt-1" />
                <span className="text-md md:text-lg lg:text-lg">
                  <b>Correspondence Address: </b> <br /> 8, Chaitanya Market, Bhopal 462001
                </span>

              </div>
              <div className="flex items-center space-x-4">

                <a href="https://wa.me/919425010528?text=Hello%2C%20I%20want%20to%20do%20some%20orders%20to%20your%20Products.%20Please%20reach%20out%20to%20me." target="_blank">
                  <button className="w-full py-4  flex gap-3 px-4 bg-[#a1cc59] text-white font-semibold rounded-lg hover:bg-[#8faa5f] transition-all duration-300 disabled:bg-cyan-400">
                    <FaWhatsapp className="text-2xl" />
                    <span className="text-md md:text-lg lg:text-lg">
                      Order Now via WhatsApp
                    </span>
                  </button>
                </a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 p-8 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="sr-only">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    placeholder="Your Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-4 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="sr-only">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  id="subject"
                  placeholder="Subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label htmlFor="message" className="sr-only">
                  Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  placeholder="Your Message"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full p-4 bg-gray-100 border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 px-6 bg-[#325946] text-white font-semibold rounded-lg hover:bg-cyan-700 transition-all duration-300 disabled:bg-cyan-400"
                >
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
            {responseMsg.text && (
              <div
                className={`mt-6 text-center font-medium p-3 rounded-lg ${responseMsg.type === "success"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-600"
                  }`}
              >
                {responseMsg.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default Contact;
