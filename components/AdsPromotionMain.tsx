"use client";

import { useState } from "react";
import { CheckCircle, BarChart2, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils"; 
import { boostOptions, subscriptionPlans } from "@/constants";


export default function AdPromotions() {
  const [selectedBoost, setSelectedBoost] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">🚀 Boost & Promote Your Ads</h2>
      <p className="text-gray-600 text-center mt-2">Increase visibility and get more potential buyers.</p>

      {/* Boost Ad Options */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-700">🔹 Boost Ad Options</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {boostOptions.map((option) => (
            <div
              key={option.id}
              className={cn(
                "p-4 border rounded-lg cursor-pointer transition duration-300 ease-in-out",
                selectedBoost === option.id ? "border-green-500 bg-green-100" : "border-gray-300 hover:border-green-500"
              )}
              onClick={() => setSelectedBoost(option.id)}
            >
              <h4 className="text-md text-gray-400 font-medium">{option.name}</h4>
              <p></p>
              <p className="text-sm text-gray-500">Starting at ₦{option.price}</p>
              <div className="mt-2 flex gap-2">
                {option.duration.map((days) => (
                  <button
                    key={days}
                    className={cn(
                      "px-3 py-1 text-gray-400 text-sm rounded-md border",
                      selectedBoost === option.id && selectedDuration === days
                        ? "bg-green-500 text-white"
                        : "border-gray-300 hover:bg-gray-200"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDuration(days);
                    }}
                  >
                    {days} days
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Subscription Plans */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700">🌟 Monthly Subscription Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {subscriptionPlans.map((plan) => (
            <div key={plan.name} className="p-6 border rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-gray-400">{plan.name}</h4>
              <p className="text-green-600 font-bold text-xl">₦{plan.price}/mo</p>
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                {plan.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2" size={16} />
                    {benefit}
                  </li>
                ))}
              </ul>
              <button className="w-full mt-4 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
                Subscribe
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Promotion Tracking */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700">📊 Promotion Tracking</h3>
        <div className="mt-4 border p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-gray-700">
            <div className="flex items-center">
              <TrendingUp className="text-green-500" size={20} />
              <span className="ml-2 font-medium">Active Boosts: 3</span>
            </div>
            <div className="flex items-center">
              <Clock className="text-yellow-500" size={20} />
              <span className="ml-2 font-medium">Expiring Soon: 1</span>
            </div>
            <div className="flex items-center">
              <BarChart2 className="text-blue-500" size={20} />
              <span className="ml-2 font-medium">Total Views Gained: 1,250</span>
            </div>
          </div>

          {/* Promotion History Table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse border">
              <thead>
                <tr className="bg-gray-100 text-gray-500">
                  <th className="p-2 border">Ad</th>
                  <th className="p-2 border">Boost Type</th>
                  <th className="p-2 border">Duration</th>
                  <th className="p-2 border">Views Gained</th>
                  <th className="p-2 border">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50 text-gray-400">
                  <td className="p-2 border">Organic Mangoes</td>
                  <td className="p-2 border">Homepage Feature</td>
                  <td className="p-2 border">14 Days</td>
                  <td className="p-2 border">530</td>
                  <td className="p-2 border text-green-600 font-medium">Active</td>
                </tr>
                <tr className="hover:bg-gray-50 text-gray-400">
                  <td className="p-2 border">Farm Machinery</td>
                  <td className="p-2 border">Top of Category</td>
                  <td className="p-2 border">30 Days</td>
                  <td className="p-2 border">720</td>
                  <td className="p-2 border text-gray-600">Expired</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
