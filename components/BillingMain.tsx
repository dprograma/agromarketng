"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { billingTabs } from "@/constants";
import React from "react";
import {
  Wallet,
  FileText,
  CreditCard,
  AlertCircle,
  Plus,
  Trash2,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  ChevronDown,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function BillingMain() {
  const [activeTab, setActiveTab] = useState("transactions");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState("30days");
  const [invoiceStatus, setInvoiceStatus] = useState("all");

  // State for transactions
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transactionSummary, setTransactionSummary] = useState({
    totalSpent: 0,
    subscriptionPayments: 0,
    boostPayments: 0,
    refunds: 0
  });

  // State for invoices
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoiceSummary, setInvoiceSummary] = useState({
    totalPaid: 0,
    totalUnpaid: 0,
    totalOverdue: 0,
    count: 0
  });

  // State for payment methods
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<any>(null);
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false);
  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "card",
    provider: "",
    last4: "",
    expiryMonth: "",
    expiryYear: "",
    email: "",
    accountName: "",
    accountNumber: "",
    bankName: ""
  });

  // State for disputes
  const [disputeForm, setDisputeForm] = useState({
    transactionId: "",
    description: ""
  });
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // State for billing summary
  const [billingSummary, setBillingSummary] = useState<any>(null);

  // Fetch billing summary on component mount
  useEffect(() => {
    const fetchBillingSummary = async () => {
      try {
        const response = await fetch("/api/user/billing/summary");
        if (response.ok) {
          const data = await response.json();
          setBillingSummary(data);
        } else {
          console.error("Failed to fetch billing summary");
        }
      } catch (error) {
        console.error("Error fetching billing summary:", error);
      }
    };

    fetchBillingSummary();
  }, []);

  // Fetch data based on active tab
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        if (activeTab === "transactions") {
          await fetchTransactions();
        } else if (activeTab === "invoices") {
          await fetchInvoices();
        } else if (activeTab === "methods") {
          await fetchPaymentMethods();
        }
      } catch (err) {
        setError("Failed to load data. Please try again.");
        console.error("Error fetching data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [activeTab, timeRange, invoiceStatus]);

  // Fetch transactions
  const fetchTransactions = async () => {
    const response = await fetch(`/api/user/billing/transactions?timeRange=${timeRange}`);

    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }

    const data = await response.json();
    setTransactions(data.transactions);
    setTransactionSummary(data.summary);
  };

  // Fetch invoices
  const fetchInvoices = async () => {
    const response = await fetch(`/api/user/billing/invoices?status=${invoiceStatus}`);

    if (!response.ok) {
      throw new Error("Failed to fetch invoices");
    }

    const data = await response.json();
    setInvoices(data.invoices);
    setInvoiceSummary(data.summary);
  };

  // Fetch payment methods
  const fetchPaymentMethods = async () => {
    const response = await fetch("/api/user/billing/payment-methods");

    if (!response.ok) {
      throw new Error("Failed to fetch payment methods");
    }

    const data = await response.json();
    setPaymentMethods(data.paymentMethods);
    setDefaultPaymentMethod(data.defaultMethod);
  };

  // Handle adding a new payment method
  const handleAddPaymentMethod = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload: any = {
        type: newPaymentMethod.type,
        provider: newPaymentMethod.provider,
        isDefault: paymentMethods.length === 0 ? true : false
      };

      // Add type-specific fields
      if (newPaymentMethod.type === "card") {
        if (!newPaymentMethod.provider || !newPaymentMethod.last4 || !newPaymentMethod.expiryMonth || !newPaymentMethod.expiryYear) {
          toast.error("Please fill in all card details");
          return;
        }

        payload.last4 = newPaymentMethod.last4;
        payload.expiryMonth = parseInt(newPaymentMethod.expiryMonth);
        payload.expiryYear = parseInt(newPaymentMethod.expiryYear);
      } else if (newPaymentMethod.type === "paypal") {
        if (!newPaymentMethod.email) {
          toast.error("Please enter your PayPal email");
          return;
        }

        payload.email = newPaymentMethod.email;
      } else if (newPaymentMethod.type === "bank_account") {
        if (!newPaymentMethod.accountName || !newPaymentMethod.accountNumber || !newPaymentMethod.bankName) {
          toast.error("Please fill in all bank account details");
          return;
        }

        payload.accountName = newPaymentMethod.accountName;
        payload.accountNumber = newPaymentMethod.accountNumber;
        payload.bankName = newPaymentMethod.bankName;
        payload.last4 = newPaymentMethod.accountNumber.slice(-4);
      }

      const response = await fetch("/api/user/billing/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Failed to add payment method");
      }

      // Reset form and fetch updated payment methods
      setNewPaymentMethod({
        type: "card",
        provider: "",
        last4: "",
        expiryMonth: "",
        expiryYear: "",
        email: "",
        accountName: "",
        accountNumber: "",
        bankName: ""
      });
      setIsAddingPaymentMethod(false);
      await fetchPaymentMethods();
      toast.success("Payment method added successfully");
    } catch (error) {
      console.error("Error adding payment method:", error);
      toast.error("Failed to add payment method");
    }
  };

  // Handle removing a payment method
  const handleRemovePaymentMethod = async (id: string) => {
    try {
      const response = await fetch(`/api/user/billing/payment-methods/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        throw new Error("Failed to remove payment method");
      }

      await fetchPaymentMethods();
      toast.success("Payment method removed successfully");
    } catch (error) {
      console.error("Error removing payment method:", error);
      toast.error("Failed to remove payment method");
    }
  };

  // Handle setting a payment method as default
  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      const response = await fetch(`/api/user/billing/payment-methods/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ isDefault: true })
      });

      if (!response.ok) {
        throw new Error("Failed to set default payment method");
      }

      await fetchPaymentMethods();
      toast.success("Default payment method updated");
    } catch (error) {
      console.error("Error setting default payment method:", error);
      toast.error("Failed to update default payment method");
    }
  };

  // Handle submitting a dispute
  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!disputeForm.transactionId || !disputeForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmittingDispute(true);

    try {
      const response = await fetch("/api/user/billing/disputes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(disputeForm)
      });

      if (!response.ok) {
        throw new Error("Failed to submit dispute");
      }

      setDisputeForm({
        transactionId: "",
        description: ""
      });
      toast.success("Dispute submitted successfully");
    } catch (error) {
      console.error("Error submitting dispute:", error);
      toast.error("Failed to submit dispute");
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">💳 Payments & Billing</h2>
          <p className="text-gray-600 mt-1">Manage your transactions, invoices, and payment methods.</p>
        </div>

        {billingSummary && (
          <Card className="w-full md:w-auto mt-4 md:mt-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm text-gray-500">Current Plan</p>
                  <p className="font-medium">
                    {billingSummary.subscription ? billingSummary.subscription.name : "No active subscription"}
                  </p>
                </div>

                {billingSummary.subscription && (
                  <Badge variant={billingSummary.subscription.isActive ? "success" : "destructive"}>
                    {billingSummary.subscription.isActive ? "Active" : "Expired"}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Tabs */}
      <div className="flex overflow-x-auto pb-2 mb-6 border-b">
        {billingTabs.map(({ key, label, icon }) => (
          <button
            key={key}
            className={cn(
              "px-4 md:px-6 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap",
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
        <div>
          {/* Time Range Filter and Summary Cards */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Transaction History</h3>

              <div className="mt-2 md:mt-0">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">Last 7 Days</SelectItem>
                    <SelectItem value="30days">Last 30 Days</SelectItem>
                    <SelectItem value="90days">Last 90 Days</SelectItem>
                    <SelectItem value="all">All Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Spent</p>
                      <p className="text-xl font-semibold">₦{transactionSummary.totalSpent.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Subscriptions</p>
                      <p className="text-xl font-semibold">₦{transactionSummary.subscriptionPayments.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <RefreshCw className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Ad Boosts</p>
                      <p className="text-xl font-semibold">₦{transactionSummary.boostPayments.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-full">
                      <ArrowUpRight className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Refunds</p>
                      <p className="text-xl font-semibold">₦{transactionSummary.refunds.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-full">
                      <ArrowDownRight className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Transactions Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Transaction Details</CardTitle>
              <CardDescription>View all your payment transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => fetchTransactions()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Wallet className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-lg font-medium">No transactions found</p>
                  <p className="text-sm">You haven't made any payments yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{transaction.reference}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{transaction.description}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{transaction.timeAgo}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.currency} {Number(transaction.amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              variant={
                                transaction.status === "successful" ? "success" :
                                  transaction.status === "pending" ? "outline" :
                                    "destructive"
                              }
                            >
                              {transaction.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoices */}
      {activeTab === "invoices" && (
        <div>
          {/* Status Filter and Summary Cards */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Invoices</h3>

              <div className="mt-2 md:mt-0">
                <Select value={invoiceStatus} onValueChange={setInvoiceStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Invoices</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Invoices</p>
                      <p className="text-xl font-semibold">{invoiceSummary.count}</p>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Paid</p>
                      <p className="text-xl font-semibold">₦{invoiceSummary.totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Unpaid</p>
                      <p className="text-xl font-semibold">₦{invoiceSummary.totalUnpaid.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-full">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Overdue</p>
                      <p className="text-xl font-semibold">₦{invoiceSummary.totalOverdue.toLocaleString()}</p>
                    </div>
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Invoice Details</CardTitle>
              <CardDescription>View and download your invoices</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => fetchInvoices()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : invoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-lg font-medium">No invoices found</p>
                  <p className="text-sm">You don't have any invoices yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{invoice.invoiceNumber}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{invoice.formattedCreatedAt}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{invoice.formattedDueDate}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {invoice.currency} {Number(invoice.amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <Badge
                              variant={
                                invoice.status === "paid" ? "success" :
                                  invoice.status === "unpaid" ? (
                                    new Date(invoice.dueDate) < new Date() ? "destructive" : "outline"
                                  ) :
                                    "secondary"
                              }
                            >
                              {invoice.status === "unpaid" && new Date(invoice.dueDate) < new Date()
                                ? "Overdue"
                                : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)
                              }
                            </Badge>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <a
                              href={invoice.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                            >
                              <Download className="h-4 w-4 mr-1" /> Download
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Methods */}
      {activeTab === "methods" && (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-700">Payment Methods</h3>

            <Button
              onClick={() => setIsAddingPaymentMethod(!isAddingPaymentMethod)}
              className="mt-2 md:mt-0"
            >
              {isAddingPaymentMethod ? (
                <>Cancel</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" /> Add Payment Method</>
              )}
            </Button>
          </div>

          {/* Add Payment Method Form */}
          {isAddingPaymentMethod && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Add Payment Method</CardTitle>
                <CardDescription>Enter your payment details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddPaymentMethod}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                    <Select
                      value={newPaymentMethod.type}
                      onValueChange={(value) => setNewPaymentMethod({ ...newPaymentMethod, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                        <SelectItem value="bank_account">Bank Account</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newPaymentMethod.type === "card" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Card Provider</label>
                        <Select
                          value={newPaymentMethod.provider}
                          onValueChange={(value) => setNewPaymentMethod({ ...newPaymentMethod, provider: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select card provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="visa">Visa</SelectItem>
                            <SelectItem value="mastercard">Mastercard</SelectItem>
                            <SelectItem value="amex">American Express</SelectItem>
                            <SelectItem value="discover">Discover</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last 4 Digits</label>
                        <Input
                          type="text"
                          placeholder="Last 4 digits of your card"
                          value={newPaymentMethod.last4}
                          onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, last4: e.target.value })}
                          maxLength={4}
                          pattern="[0-9]{4}"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Month</label>
                          <Input
                            type="text"
                            placeholder="MM"
                            value={newPaymentMethod.expiryMonth}
                            onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, expiryMonth: e.target.value })}
                            maxLength={2}
                            pattern="[0-9]{1,2}"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Year</label>
                          <Input
                            type="text"
                            placeholder="YYYY"
                            value={newPaymentMethod.expiryYear}
                            onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, expiryYear: e.target.value })}
                            maxLength={4}
                            pattern="[0-9]{4}"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {newPaymentMethod.type === "paypal" && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">PayPal Email</label>
                      <Input
                        type="email"
                        placeholder="Your PayPal email address"
                        value={newPaymentMethod.email}
                        onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, email: e.target.value })}
                      />
                    </div>
                  )}

                  {newPaymentMethod.type === "bank_account" && (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                        <Input
                          type="text"
                          placeholder="Your bank name"
                          value={newPaymentMethod.bankName}
                          onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, bankName: e.target.value })}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Name</label>
                        <Input
                          type="text"
                          placeholder="Name on account"
                          value={newPaymentMethod.accountName}
                          onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, accountName: e.target.value })}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                        <Input
                          type="text"
                          placeholder="Your account number"
                          value={newPaymentMethod.accountNumber}
                          onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, accountNumber: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <Button type="submit" className="w-full">Add Payment Method</Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Payment Methods List */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Saved Payment Methods</CardTitle>
              <CardDescription>Manage your payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-red-500">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>{error}</p>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => fetchPaymentMethods()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : paymentMethods.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p className="text-lg font-medium">No payment methods found</p>
                  <p className="text-sm mb-4">Add a payment method to get started.</p>
                  {!isAddingPaymentMethod && (
                    <Button
                      onClick={() => setIsAddingPaymentMethod(true)}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" /> Add Payment Method
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        {method.type === "card" && (
                          <div className="p-2 bg-blue-100 rounded-full mr-4">
                            <CreditCard className="h-5 w-5 text-blue-600" />
                          </div>
                        )}
                        {method.type === "paypal" && (
                          <div className="p-2 bg-indigo-100 rounded-full mr-4">
                            <Wallet className="h-5 w-5 text-indigo-600" />
                          </div>
                        )}
                        {method.type === "bank_account" && (
                          <div className="p-2 bg-green-100 rounded-full mr-4">
                            <Wallet className="h-5 w-5 text-green-600" />
                          </div>
                        )}

                        <div>
                          <p className="font-medium text-gray-900">
                            {method.displayName}
                            {method.isDefault && (
                              <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                Default
                              </Badge>
                            )}
                          </p>
                          <p className="text-sm text-gray-500">
                            {method.type === "card" && method.expiryDisplay && `Expires ${method.expiryDisplay}`}
                            {method.type === "paypal" && "PayPal"}
                            {method.type === "bank_account" && "Bank Account"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {!method.isDefault && (
                          <Button
                            variant="outline"
                            className="mt-4 h-8 px-3"
                            onClick={() => handleSetDefaultPaymentMethod(method.id)}
                          >
                            Set Default
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          onClick={() => handleRemovePaymentMethod(method.id)}
                          className="mt-4 h-8 px-3 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Disputes */}
      {activeTab === "disputes" && (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-700">Report a Payment Issue</h3>
              <p className="text-gray-500 mt-1">If you have an issue with a payment, please fill out the form below.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dispute Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Submit a Dispute</CardTitle>
                <CardDescription>We'll review your issue and get back to you</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitDispute}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                    <Input
                      type="text"
                      placeholder="Enter the transaction reference"
                      value={disputeForm.transactionId}
                      onChange={(e) => setDisputeForm({ ...disputeForm, transactionId: e.target.value })}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      You can find this in your transaction history
                    </p>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                    <Textarea
                      placeholder="Please describe your issue in detail"
                      value={disputeForm.description}
                      onChange={(e) => setDisputeForm({ ...disputeForm, description: e.target.value })}
                      rows={5}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmittingDispute}
                  >
                    {isSubmittingDispute ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Dispute"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Dispute Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Dispute Information</CardTitle>
                <CardDescription>What happens after you submit a dispute</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="p-2 bg-blue-100 rounded-full mr-3 mt-1">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Submission</h4>
                      <p className="text-sm text-gray-500">
                        Your dispute will be submitted to our customer support team for review.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="p-2 bg-purple-100 rounded-full mr-3 mt-1">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Review Process</h4>
                      <p className="text-sm text-gray-500">
                        Our team will review your dispute within 1-2 business days and may contact you for additional information.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="p-2 bg-green-100 rounded-full mr-3 mt-1">
                      <RefreshCw className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Resolution</h4>
                      <p className="text-sm text-gray-500">
                        Once resolved, you'll receive a notification with the outcome of your dispute.
                      </p>
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm text-gray-500">
                      For urgent issues, please contact our support team directly at <span className="text-blue-600">support@agromarket.com</span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
