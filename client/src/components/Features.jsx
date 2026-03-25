import React from 'react'
import { FaPills, FaTruck, FaUserMd, FaShieldAlt } from 'react-icons/fa'

const Features = () => {
  const features = [
    {
      icon: <FaPills className="w-12 h-12 text-[#a1cc59]" />,
      title: "Quality Medicines",
      description: "Premium quality medicines sourced directly from authorized manufacturers."
    },
    {
      icon: <FaTruck className="w-12 h-12 text-[#a1cc59]" />,
      title: "Fast Delivery",
      description: "Quick and reliable delivery service to ensure timely access to your medications."
    },
    {
      icon: <FaUserMd className="w-12 h-12 text-[#a1cc59]" />,
      title: "Expert Consultation",
      description: "Professional guidance from experienced healthcare experts."
    },
    {
      icon: <FaShieldAlt className="w-12 h-12 text-[#a1cc59]" />,
      title: "Authentic Products",
      description: "100% genuine products with proper storage and handling."
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#325946] mb-4">Why Choose Us</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Experience excellence in healthcare with our premium services and products.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-xl hover:bg-gray-100 transition-colors duration-300">
              <div className="flex justify-center mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-[#325946] mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features