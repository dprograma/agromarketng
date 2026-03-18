"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Search,
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

interface User {
  id: string;
  name: string | null;
  email: string;
  verified: boolean;
  role: string;
  createdAt: string;
  image: string | null;
  _count: { ads: number };
}

interface UsersResponse {
  users: User[];
  total: number;
  unverifiedCount: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}

export default function UserManagement() {
  const [data, setData] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unverified" | "verified">("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingIndividual, setSendingIndividual] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        filter,
        search,
        page: page.toString(),
        limit: "20",
      });
      const res = await fetch(`/api/admin/users?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      const result = await res.json();
      setData(result);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [filter, search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleResendOne = async (userId: string, email: string) => {
    setSendingIndividual(userId);
    try {
      const res = await fetch("/api/admin/users/resend-verification", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: [userId] }),
      });
      const result = await res.json();
      if (res.ok && result.sent > 0) {
        toast.success(`Verification email sent to ${email}`);
      } else {
        toast.error(result.details?.[0]?.error || "Failed to send email");
      }
    } catch {
      toast.error("Failed to send verification email");
    } finally {
      setSendingIndividual(null);
    }
  };

  const handleResendAll = async () => {
    if (!data || data.unverifiedCount === 0) return;

    const confirmed = window.confirm(
      `Send verification emails to all ${data.unverifiedCount} unverified user(s)?`
    );
    if (!confirmed) return;

    setSendingAll(true);
    try {
      const res = await fetch("/api/admin/users/resend-verification", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
      } else {
        toast.error("Failed to send verification emails");
      }
    } catch {
      toast.error("Failed to send verification emails");
    } finally {
      setSendingAll(false);
    }
  };

  const handleResendSelected = async () => {
    if (selectedUsers.size === 0) return;

    setSendingAll(true);
    try {
      const res = await fetch("/api/admin/users/resend-verification", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: Array.from(selectedUsers) }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message);
        setSelectedUsers(new Set());
      } else {
        toast.error("Failed to send verification emails");
      }
    } catch {
      toast.error("Failed to send verification emails");
    } finally {
      setSendingAll(false);
    }
  };

  const toggleSelect = (userId: string) => {
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (!data) return;
    const unverified = data.users.filter((u) => !u.verified);
    if (selectedUsers.size === unverified.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(unverified.map((u) => u.id)));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            {data ? `${data.total} total users, ${data.unverifiedCount} unverified` : "Loading..."}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchUsers}
            className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          {data && data.unverifiedCount > 0 && (
            <button
              onClick={handleResendAll}
              disabled={sendingAll}
              className="flex items-center gap-1 px-3 py-2 text-sm bg-green-600 text-white hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {sendingAll ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mail className="w-4 h-4" />
              )}
              Resend All ({data.unverifiedCount})
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(["all", "unverified", "verified"] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-3 py-1.5 text-sm rounded-md capitalize transition-colors ${
                filter === f
                  ? "bg-white text-gray-900 shadow-sm font-medium"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {f === "unverified" && <Filter className="w-3 h-3 inline mr-1" />}
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Selected actions bar */}
      {selectedUsers.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-700 font-medium">
            {selectedUsers.size} user(s) selected
          </span>
          <button
            onClick={handleResendSelected}
            disabled={sendingAll}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md disabled:opacity-50"
          >
            {sendingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
            Resend to Selected
          </button>
          <button
            onClick={() => setSelectedUsers(new Set())}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear
          </button>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-green-600" />
            <span className="ml-2 text-gray-500">Loading users...</span>
          </div>
        ) : !data || data.users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-gray-500">
            <Users className="w-10 h-10 mb-2" />
            <p>No users found</p>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden sm:grid sm:grid-cols-[auto_1fr_1fr_100px_80px_120px] gap-4 px-4 py-3 bg-gray-50 border-b text-xs font-medium text-gray-500 uppercase">
              <div className="w-8">
                <input
                  type="checkbox"
                  onChange={toggleSelectAll}
                  checked={
                    data.users.filter((u) => !u.verified).length > 0 &&
                    selectedUsers.size === data.users.filter((u) => !u.verified).length
                  }
                  className="rounded border-gray-300"
                />
              </div>
              <div>Name</div>
              <div>Email</div>
              <div>Status</div>
              <div>Ads</div>
              <div>Action</div>
            </div>

            {/* User rows */}
            {data.users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-1 sm:grid-cols-[auto_1fr_1fr_100px_80px_120px] gap-2 sm:gap-4 px-4 py-3 border-b hover:bg-gray-50 items-center"
              >
                <div className="hidden sm:block w-8">
                  {!user.verified && (
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleSelect(user.id)}
                      className="rounded border-gray-300"
                    />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-green-700">
                      {(user.name || "?")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name || "—"}</p>
                    <p className="text-xs text-gray-500 sm:hidden">{user.email}</p>
                  </div>
                </div>
                <div className="hidden sm:block text-sm text-gray-600 truncate">{user.email}</div>
                <div>
                  {user.verified ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
                      <XCircle className="w-3 h-3" />
                      Unverified
                    </span>
                  )}
                </div>
                <div className="hidden sm:block text-sm text-gray-600">{user._count.ads}</div>
                <div>
                  {!user.verified && (
                    <button
                      onClick={() => handleResendOne(user.id, user.email)}
                      disabled={sendingIndividual === user.id}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-green-50 text-green-700 hover:bg-green-100 rounded-md transition-colors disabled:opacity-50"
                    >
                      {sendingIndividual === user.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Mail className="w-3 h-3" />
                      )}
                      Resend
                    </button>
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
