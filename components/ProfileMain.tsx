"use client";

import { useState } from "react";
import { User, Bell, Lock, Image, Mail, Shield } from "lucide-react";
import { cn } from "@/lib/utils"; 
import  { userprofile } from "@/constants";
import React from "react";

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">👤 Profile & Account Settings</h2>
      <p className="text-gray-600 text-center mt-2">Manage your personal information, security, and preferences.</p>

      {/* Tabs */}
      <div className="flex justify-center mt-6 border-b">
        {userprofile.map(({ key, label, icon }) => (
          <button
            key={key}
            className={cn(
              "px-6 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2",
              activeTab === key
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-green-500"
            )}
            onClick={() => setActiveTab(key)}
          >
             {React.createElement(icon, { className: "w-4 h-4" })} {label}
          </button>
        ))}
      </div>

      {/* Personal Information */}
      {activeTab === "personal" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">👤 Personal Information</h3>
          <form className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Full Name</label>
              <input type="text" className="w-full mt-1 p-2 border rounded-md focus:ring-green-500 focus:border-green-500" placeholder="Enter your full name" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Email Address</label>
              <input type="email" className="w-full mt-1 p-2 border rounded-md focus:ring-green-500 focus:border-green-500" placeholder="Enter your email" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Phone Number</label>
              <input type="tel" className="w-full mt-1 p-2 border rounded-md focus:ring-green-500 focus:border-green-500" placeholder="Enter your phone number" />
            </div>

            <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">Save Changes</button>
          </form>
        </div>
      )}

      {/* Profile Picture */}
      {activeTab === "avatar" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">📸 Upload Profile Picture</h3>
          <div className="mt-4 flex flex-col items-center">
            <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
              <Image size={50} className="text-gray-400" />
            </div>
            <input type="file" className="mt-4 w-full border p-2 rounded-md" />
            <button className="mt-4 bg-green-600 text-white py-2 px-6 rounded-md hover:bg-green-700 transition">Upload</button>
          </div>
        </div>
      )}

      {/* Notification Preferences */}
      {activeTab === "notifications" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">🔔 Notification Preferences</h3>
          <div className="mt-4 space-y-4">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox text-green-600" />
              <span>Email notifications for ad activity</span>
            </label>

            <label className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox text-green-600" />
              <span>SMS notifications for promotions</span>
            </label>

            <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">Save Preferences</button>
          </div>
        </div>
      )}

      {/* Password & Security */}
      {activeTab === "security" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">🔐 Password & Security</h3>
          <form className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600">Current Password</label>
              <input type="password" className="w-full mt-1 p-2 border rounded-md focus:ring-green-500 focus:border-green-500" placeholder="Enter current password" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">New Password</label>
              <input type="password" className="w-full mt-1 p-2 border rounded-md focus:ring-green-500 focus:border-green-500" placeholder="Enter new password" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600">Confirm New Password</label>
              <input type="password" className="w-full mt-1 p-2 border rounded-md focus:ring-green-500 focus:border-green-500" placeholder="Confirm new password" />
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" className="form-checkbox text-green-600" />
              <span>Enable Two-Factor Authentication (2FA)</span>
            </div>

            <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">Update Security Settings</button>
          </form>
        </div>
      )}
    </div>
  );
}
