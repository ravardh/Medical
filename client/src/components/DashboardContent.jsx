import React from "react";

const statCards = [
  {
    key: "totalProducts",
    label: "Total Products",
    icon: "🛍️",
    color: "bg-indigo-100 text-indigo-600",
  },
  {
    key: "totalFeatured",
    label: "Featured Products",
    icon: "🔥",
    color: "bg-blue-100 text-blue-600",
  },
  {
    key: "totalSlider",
    label: "Total Sliders",
    icon: "🖼️",
    color: "bg-purple-100 text-purple-600",
  },
  {
    key: "totalContacts",
    label: "Total Contacts",
    icon: "📩",
    color: "bg-pink-100 text-pink-600",
  },
  {
    key: "totalUsers",
    label: "Total Employees",
    icon: "👥",
    color: "bg-cyan-100 text-cyan-600",
  },
  {
    key: "totalUnApprovedReviews",
    label: "Pending Reviews",
    icon: "📝",
    color: "bg-red-100 text-red-600",
  },
  {
    key: "totalReviews",
    label: "Total Reviews",
    icon: "⭐",
    color: "bg-green-100 text-green-600",
  },
];

const DashboardContent = ({ stats }) => {
  window.scrollTo(0, 0);
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div
            key={card.key}
            className={`${card.color} rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-opacity-80">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold">
                  {stats[card.key] ?? 0}
                </p>
              </div>
              <span className="text-3xl">{card.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Rest of the component remains the same */}
      {/* ... */}
    </div>
  );
};

export default DashboardContent;
