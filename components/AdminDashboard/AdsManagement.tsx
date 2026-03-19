"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Loader2,
  RefreshCw,
  Megaphone,
  Eye,
  MousePointerClick,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ban,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";

interface Ad {
  id: string;
  title: string;
  category: string;
  location: string;
  price: number;
  status: string;
  featured: boolean;
  images: string[];
  views: number;
  clicks: number;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
}

interface AdsResponse {
  ads: Ad[];
  total: number;
  statusCounts: {
    all: number;
    active: number;
    suspended: number;
    deactivated: number;
    pending: number;
  };
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

type FilterType = "all" | "active" | "suspended" | "deactivated" | "pending";
type ActionType = "activate" | "deactivate" | "suspend" | "delete";

export default function AdsManagement() {
  const [data, setData] = useState<AdsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedAds, setSelectedAds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [reasonModal, setReasonModal] = useState<{
    action: ActionType;
    adIds: string[];
    adTitles: string[];
  } | null>(null);
  const [reason, setReason] = useState("");

  const fetchAds = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filter,
        search,
        page: page.toString(),
        limit: "20",
      });
      const res = await fetch(`/api/admin/ads?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch ads");
      const result = await res.json();
      setData(result);
    } catch {
      toast.error("Failed to load ads");
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = () => setOpenDropdown(null);
    if (openDropdown) {
      document.addEventListener("click", handler);
      return () => document.removeEventListener("click", handler);
    }
  }, [openDropdown]);

  const performAction = async (action: ActionType, adIds: string[], reasonText?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/ads", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adIds, action, reason: reasonText }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        setSelectedAds(new Set());
        setOpenDropdown(null);
        fetchAds();
      } else {
        toast.error(result.error || "Action failed");
      }
    } catch {
      toast.error("Failed to perform action");
    } finally {
      setActionLoading(false);
      setReasonModal(null);
      setReason("");
    }
  };

  const handleAction = (action: ActionType, adIds: string[], adTitles: string[]) => {
    if (action === "delete") {
      const confirmed = window.confirm(
        `Permanently delete ${adIds.length} ad(s)? This cannot be undone.\n\n${adTitles.join("\n")}`
      );
      if (!confirmed) return;
    }

    // Show reason modal for deactivate, suspend, and delete
    if (["deactivate", "suspend", "delete"].includes(action)) {
      setReasonModal({ action, adIds, adTitles });
      return;
    }

    // Activate doesn't need a reason
    performAction(action, adIds);
  };

  const handleBulkAction = (action: ActionType) => {
    if (selectedAds.size === 0) return;
    const adIds = Array.from(selectedAds);
    const adTitles = data?.ads
      .filter((a) => selectedAds.has(a.id))
      .map((a) => a.title) || [];
    handleAction(action, adIds, adTitles);
  };

  const toggleSelect = (adId: string) => {
    setSelectedAds((prev) => {
      const next = new Set(prev);
      if (next.has(adId)) next.delete(adId);
      else next.add(adId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!data) return;
    if (selectedAds.size === data.ads.length) {
      setSelectedAds(new Set());
    } else {
      setSelectedAds(new Set(data.ads.map((a) => a.id)));
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
            <CheckCircle className="w-3 h-3" /> Active
          </span>
        );
      case "Suspended":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
            <AlertTriangle className="w-3 h-3" /> Suspended
          </span>
        );
      case "Deactivated":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            <Ban className="w-3 h-3" /> Deactivated
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
            <XCircle className="w-3 h-3" /> Pending
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
            {status}
          </span>
        );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Reason Modal */}
      {reasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {reasonModal.action === "delete" ? "Delete" : reasonModal.action === "suspend" ? "Suspend" : "Deactivate"} Ad{reasonModal.adIds.length > 1 ? "s" : ""}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Provide a reason (this will be emailed to the user):
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Violates community guidelines..."
              className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => { setReasonModal(null); setReason(""); }}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => performAction(reasonModal.action, reasonModal.adIds, reason)}
                disabled={actionLoading}
                className={`flex items-center gap-1 px-4 py-2 text-sm text-white rounded-lg disabled:opacity-50 ${
                  reasonModal.action === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : reasonModal.action === "suspend"
                    ? "bg-yellow-600 hover:bg-yellow-700"
                    : "bg-gray-600 hover:bg-gray-700"
                }`}
              >
                {actionLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Ads Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            {data
              ? `${data.statusCounts.all} total ads \u2014 ${data.statusCounts.active} active, ${data.statusCounts.suspended} suspended, ${data.statusCounts.deactivated} deactivated`
              : "Loading..."}
          </p>
        </div>
        <button
          onClick={fetchAds}
          className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search ads by title, user name, or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 overflow-x-auto">
          {(["all", "active", "suspended", "deactivated", "pending"] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-md capitalize transition-colors whitespace-nowrap ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {f}
              {data && f !== "all" && (
                <span className="ml-1 text-xs text-gray-400">
                  ({data.statusCounts[f]})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedAds.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-700 font-medium">
            {selectedAds.size} ad(s) selected
          </span>
          <button
            onClick={() => handleBulkAction("activate")}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white hover:bg-green-700 rounded-md"
          >
            <CheckCircle className="w-3 h-3" /> Activate
          </button>
          <button
            onClick={() => handleBulkAction("suspend")}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-yellow-600 text-white hover:bg-yellow-700 rounded-md"
          >
            <AlertTriangle className="w-3 h-3" /> Suspend
          </button>
          <button
            onClick={() => handleBulkAction("deactivate")}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-gray-600 text-white hover:bg-gray-700 rounded-md"
          >
            <Ban className="w-3 h-3" /> Deactivate
          </button>
          <button
            onClick={() => handleBulkAction("delete")}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-red-600 text-white hover:bg-red-700 rounded-md"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
          <button
            onClick={() => setSelectedAds(new Set())}
            className="text-sm text-blue-600 hover:text-blue-800 ml-auto"
          >
            Clear
          </button>
        </div>
      )}

      {/* Ads table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            <span className="ml-2 text-gray-500">Loading ads...</span>
          </div>
        ) : !data || data.ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <Megaphone className="w-10 h-10 mb-2" />
            <p>No ads found</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden lg:grid lg:grid-cols-[auto_80px_1fr_120px_120px_100px_80px_60px] gap-3 px-4 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase">
              <div className="w-8">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={data.ads.length > 0 && selectedAds.size === data.ads.length}
                  className="rounded border-gray-300"
                />
              </div>
              <div>Image</div>
              <div>Ad Details</div>
              <div>Price</div>
              <div>Status</div>
              <div>Stats</div>
              <div>Date</div>
              <div>Action</div>
            </div>

            {/* Ad rows */}
            {data.ads.map((ad) => (
              <div
                key={ad.id}
                className="grid grid-cols-1 lg:grid-cols-[auto_80px_1fr_120px_120px_100px_80px_60px] gap-2 lg:gap-3 px-4 py-3 border-b hover:bg-gray-50 items-center"
              >
                {/* Checkbox */}
                <div className="hidden lg:block w-8">
                  <input
                    type="checkbox"
                    checked={selectedAds.has(ad.id)}
                    onChange={() => toggleSelect(ad.id)}
                    className="rounded border-gray-300"
                  />
                </div>

                {/* Image */}
                <div className="hidden lg:block">
                  <div className="w-16 h-12 relative rounded overflow-hidden bg-gray-100">
                    {ad.images[0] ? (
                      <Image
                        src={ad.images[0]}
                        alt={ad.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <Megaphone className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Ad details */}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ad.title}</p>
                  <p className="text-xs text-gray-500">
                    {ad.category} &middot; {ad.location}
                  </p>
                  <p className="text-xs text-gray-400">
                    by {ad.user.name || ad.user.email}
                  </p>
                  {/* Mobile-only fields */}
                  <div className="flex flex-wrap gap-2 mt-1 lg:hidden">
                    <span className="text-xs font-medium text-gray-700">{formatPrice(ad.price)}</span>
                    {statusBadge(ad.status)}
                  </div>
                </div>

                {/* Price */}
                <div className="hidden lg:block text-sm text-gray-700 font-medium">
                  {formatPrice(ad.price)}
                </div>

                {/* Status */}
                <div className="hidden lg:block">{statusBadge(ad.status)}</div>

                {/* Stats */}
                <div className="hidden lg:flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-0.5" title="Views">
                    <Eye className="w-3 h-3" /> {ad.views}
                  </span>
                  <span className="flex items-center gap-0.5" title="Clicks">
                    <MousePointerClick className="w-3 h-3" /> {ad.clicks}
                  </span>
                </div>

                {/* Date */}
                <div className="hidden lg:block text-xs text-gray-500">
                  {new Date(ad.createdAt).toLocaleDateString()}
                </div>

                {/* Action dropdown */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === ad.id ? null : ad.id);
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-500" />
                  </button>

                  {openDropdown === ad.id && (
                    <div className="absolute right-0 top-8 z-20 bg-white border rounded-lg shadow-lg py-1 w-40">
                      {ad.status !== "Active" && (
                        <button
                          onClick={() => handleAction("activate", [ad.id], [ad.title])}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4" /> Activate
                        </button>
                      )}
                      {ad.status !== "Suspended" && (
                        <button
                          onClick={() => handleAction("suspend", [ad.id], [ad.title])}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-yellow-700 hover:bg-yellow-50"
                        >
                          <AlertTriangle className="w-4 h-4" /> Suspend
                        </button>
                      )}
                      {ad.status !== "Deactivated" && (
                        <button
                          onClick={() => handleAction("deactivate", [ad.id], [ad.title])}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Ban className="w-4 h-4" /> Deactivate
                        </button>
                      )}
                      <button
                        onClick={() => handleAction("delete", [ad.id], [ad.title])}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {data.pagination.page} of {data.pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
              disabled={page === data.pagination.totalPages}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
