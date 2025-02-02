"use client";

import { useState } from "react";
import { cn } from "@/lib/utils"; 
import { transactions, invoices, paymentMethods, billingTabs } from "@/constants";
import React from "react";


export default function Payments() {
  const [activeTab, setActiveTab] = useState("transactions");

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">💳 Payments & Billing</h2>
      <p className="text-gray-600 text-center mt-2">Manage your transactions, invoices, and payment methods.</p>

      {/* Tabs */}
      <div className="flex justify-center mt-6 border-b">
        {billingTabs.map(({ key, label, icon }) => (
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

      {/* Transactions */}
      {activeTab === "transactions" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">📜 Transaction History</h3>
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            {transactions.map((txn) => (
              <div key={txn.id} className="flex justify-between border-b py-2 text-gray-400 font-thin">
                <span>{txn.id} - {txn.date}</span>
                <span className="font-semibold text-emerald-700">{txn.amount}</span>
                <span className={txn.status === "Completed" ? "text-green-600" : "text-orange-500"}>{txn.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoices */}
      {activeTab === "invoices" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">📄 Downloadable Invoices</h3>
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            {invoices.map((inv) => (
              <div key={inv.id} className="flex justify-between border-b py-2 text-gray-400 font-thin">
                <span>{inv.id} - {inv.date}</span>
                <span className="font-semibold text-emerald-700">{inv.amount}</span>
                <a href={inv.link} className="text-blue-500 hover:underline">Download</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Methods */}
      {activeTab === "methods" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">💳 Saved Payment Methods</h3>
          <div className="mt-4 bg-gray-50 p-4 rounded-lg">
            {paymentMethods.map((pm, index) => (
              <div key={index} className="flex justify-between border-b py-2 text-gray-400 font-thin">
                <span>{pm.type} {pm.last4 ? `•••• ${pm.last4}` : pm.email}</span>
                <span className="text-gray-500 ">{pm.expiry || ""}</span>
                <button className="text-red-500 hover:underline">Remove</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment Disputes */}
      {activeTab === "disputes" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700">⚠️ Report a Payment Issue</h3>
          <form className="mt-4 bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600">Transaction ID</label>
            <input type="text" className="w-full mt-1 p-2 border rounded-md focus:ring-green-500 focus:border-green-500" placeholder="Enter transaction ID" />

            <label className="block text-sm font-medium text-gray-600 mt-4">Issue Description</label>
            <textarea className="w-full mt-1 p-2 border rounded-md focus:ring-green-500 focus:border-green-500" rows={4} placeholder="Describe your issue"></textarea>

            <button type="submit" className="mt-4 w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition">
              Submit Dispute
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
