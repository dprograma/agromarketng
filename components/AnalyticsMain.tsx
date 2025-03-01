"use client";

import React, { useState } from "react";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js";
import { Banknote, Coins, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { adPerformance, demographics, financialData } from "@/constants";

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("performance");

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">📊 Analytics & Reports</h2>
      <p className="text-gray-600 text-center mt-2">Track ad performance, audience insights, and financials.</p>

      {/* Tabs */}
      <div className="flex justify-center mt-6 border-b">
        {["performance", "demographics", "financials"].map((tab) => (
          <button
            key={tab}
            className={cn(
              "px-6 py-2 text-sm font-medium border-b-2 transition",
              activeTab === tab
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-green-500"
            )}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "performance" ? "📈 Ad Performance" : tab === "demographics" ? "🌍 Demographics" : "💰 Financials"}
          </button>
        ))}
      </div>

      {/* Ad Performance */}
      {activeTab === "performance" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">📊 Ad Performance Dashboard</h3>
          <div className="mt-4">
            <Bar
              data={{
                labels: ["Impressions", "Clicks", "Engagement Rate"],
                datasets: [
                  {
                    label: "Performance Metrics",
                    data: [adPerformance.impressions, adPerformance.clicks, adPerformance.engagementRate],
                    backgroundColor: ["#4F46E5", "#22C55E", "#E11D48"],
                  },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>
        </div>
      )}

      {/* Demographics */}
      {activeTab === "demographics" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">🌍 Audience Demographics</h3>

          {/* Pie Chart for Age Distribution */}
          <div className="mt-4">
            <h4 className="text-md font-medium text-gray-600">Age Group Distribution</h4>
            <div className="xs:w-full xs:h-full md:w-96 md:h-96 md:mx-auto">
              <Pie
                data={{
                  labels: demographics.ageGroups.map((age) => age.group),
                  datasets: [
                    {
                      data: demographics.ageGroups.map((age) => age.percentage),
                      backgroundColor: ["#3B82F6", "#F59E0B", "#10B981", "#EF4444"],
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: true }}
              />
            </div>

          </div>

          {/* Top Locations */}
          <div className="mt-6">
            <h4 className="text-md font-medium text-gray-600">Top Locations</h4>
            <ul className="mt-2 space-y-2">
              {demographics.topLocations.map((loc, index) => (
                <li key={index} className="flex justify-between text-gray-700">
                  <span>{loc.country}</span>
                  <span className="font-semibold">{loc.percentage}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Financials */}
      {activeTab === "financials" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">💰 Revenue & Spending Breakdown</h3>

          {/* Doughnut Chart for Financials */}
          <div className="mt-4">
            <Doughnut
              data={{
                labels: ["Total Spent", "Total Earnings"],
                datasets: [
                  {
                    data: [financialData.totalSpent, financialData.earnings],
                    backgroundColor: ["#E11D48", "#10B981"],
                  },
                ],
              }}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </div>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="p-4 border rounded-lg flex items-center space-x-3">
              <Coins className="text-red-500" size={24} />
              <div>
                <p className="text-gray-600 text-sm">Total Spent on Ads</p>
                <p className="text-lg font-semibold text-gray-300">₦{financialData.totalSpent}</p>
              </div>
            </div>
            <div className="p-4 border rounded-lg flex items-center space-x-3">
              <Banknote className="text-green-500" size={24} />
              <div>
                <p className="text-gray-600 text-sm">Total Earnings</p>
                <p className="text-lg font-semibold text-gray-300">₦{financialData.earnings}</p>
              </div>
            </div>
            <div className="p-4 border rounded-lg flex items-center space-x-3">
              <Wallet className="text-blue-500" size={24} />
              <div>
                <p className="text-gray-600 text-sm">Profit</p>
                <p className="text-lg font-semibold text-gray-300">₦{financialData.profit}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
