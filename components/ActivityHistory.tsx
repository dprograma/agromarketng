"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Activity,
  Loader2,
  RefreshCw,
  Shield,
  User,
  Mail,
  Key,
  Smartphone,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Filter
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface ActivityLog {
  id: string;
  activity: string;
  description: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  deviceInfo: string | null;
  location: string | null;
  success: boolean;
  metadata: any;
  createdAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  limit: number;
}

const ActivityIcons: Record<string, React.ComponentType<any>> = {
  login: User,
  logout: User,
  login_failed: AlertCircle,
  profile_update: User,
  password_change: Key,
  email_change_request: Mail,
  email_change_verified: Mail,
  avatar_update: User,
  '2fa_enabled': Shield,
  '2fa_disabled': Shield,
  '2fa_backup_codes_generated': Shield,
  account_deleted: AlertCircle,
  notification_preferences_update: Settings,
  default: Activity
};

const ActivityLabels: Record<string, string> = {
  login: 'Login',
  logout: 'Logout',
  login_failed: 'Failed Login Attempt',
  profile_update: 'Profile Updated',
  password_change: 'Password Changed',
  email_change_request: 'Email Change Requested',
  email_change_verified: 'Email Change Verified',
  avatar_update: 'Avatar Updated',
  '2fa_enabled': 'Two-Factor Authentication Enabled',
  '2fa_disabled': 'Two-Factor Authentication Disabled',
  '2fa_backup_codes_generated': 'Backup Codes Generated',
  account_deleted: 'Account Deleted',
  notification_preferences_update: 'Notification Preferences Updated'
};

const ActivityColors: Record<string, string> = {
  login: 'text-green-600 bg-green-50 border-green-200',
  logout: 'text-blue-600 bg-blue-50 border-blue-200',
  login_failed: 'text-red-600 bg-red-50 border-red-200',
  profile_update: 'text-blue-600 bg-blue-50 border-blue-200',
  password_change: 'text-orange-600 bg-orange-50 border-orange-200',
  email_change_request: 'text-purple-600 bg-purple-50 border-purple-200',
  email_change_verified: 'text-green-600 bg-green-50 border-green-200',
  avatar_update: 'text-blue-600 bg-blue-50 border-blue-200',
  '2fa_enabled': 'text-green-600 bg-green-50 border-green-200',
  '2fa_disabled': 'text-red-600 bg-red-50 border-red-200',
  '2fa_backup_codes_generated': 'text-green-600 bg-green-50 border-green-200',
  account_deleted: 'text-red-600 bg-red-50 border-red-200',
  notification_preferences_update: 'text-gray-600 bg-gray-50 border-gray-200',
  default: 'text-gray-600 bg-gray-50 border-gray-200'
};

export default function ActivityHistory() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState<string>('');

  const fetchActivities = async (page: number = 1, filter: string = '') => {
    try {
      const isRefresh = page === currentPage && !isLoading;
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10'
      });

      if (filter) {
        params.append('activity', filter);
      }

      const response = await fetch(`/api/user/profile/activity?${params}`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activity history');
      }

      const data = await response.json();
      setActivities(data.activityLogs);
      setPagination(data.pagination);
      setCurrentPage(page);

    } catch (error) {
      console.error('Error fetching activity history:', error);
      toast.error('Failed to load activity history');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities(1, selectedFilter);
  }, [selectedFilter]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && pagination && page <= pagination.totalPages) {
      fetchActivities(page, selectedFilter);
    }
  };

  const handleRefresh = () => {
    fetchActivities(currentPage, selectedFilter);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatDeviceInfo = (deviceInfo: string | null) => {
    if (!deviceInfo) return 'Unknown Device';

    try {
      const info = JSON.parse(deviceInfo);
      const parts = [];
      if (info.device) parts.push(info.device);
      if (info.browser) parts.push(info.browser);
      if (info.os) parts.push(info.os);
      return parts.join(' • ') || 'Unknown Device';
    } catch {
      return 'Unknown Device';
    }
  };

  const getActivityIcon = (activity: string) => {
    const IconComponent = ActivityIcons[activity] || ActivityIcons.default;
    return IconComponent;
  };

  const getActivityLabel = (activity: string) => {
    return ActivityLabels[activity] || activity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getActivityColor = (activity: string, success: boolean) => {
    if (!success && activity !== 'login_failed') {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    return ActivityColors[activity] || ActivityColors.default;
  };

  if (isLoading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Activity className="w-5 h-5 mr-2" /> Account Activity
          </h3>
          <p className="text-sm text-gray-600">
            View your recent account activity and security events
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Activities</option>
            <option value="login">Logins</option>
            <option value="profile_update">Profile Updates</option>
            <option value="password_change">Password Changes</option>
            <option value="2fa_enabled">2FA Events</option>
            <option value="email_change_request">Email Changes</option>
          </select>

          <Button
            onClick={handleRefresh}
            variant="outline"
            size="sm"
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("w-4 h-4 mr-1", isRefreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-600 mb-2">No Activity Found</h4>
          <p className="text-gray-500">
            {selectedFilter ? 'No activities match the selected filter.' : 'No activity history available.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.map((activity) => {
            const IconComponent = getActivityIcon(activity.activity);
            const colorClass = getActivityColor(activity.activity, activity.success);

            return (
              <div
                key={activity.id}
                className={cn(
                  "p-4 border rounded-lg transition-colors",
                  colorClass
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">
                          {getActivityLabel(activity.activity)}
                        </h4>
                        {!activity.success && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                            Failed
                          </span>
                        )}
                      </div>
                      {activity.description && (
                        <p className="text-sm opacity-80 mt-1">
                          {activity.description}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-xs opacity-70 mt-2">
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(activity.createdAt)}
                        </span>
                        {activity.ipAddress && (
                          <span>IP: {activity.ipAddress}</span>
                        )}
                        <span className="flex items-center">
                          <Monitor className="w-3 h-3 mr-1" />
                          {formatDeviceInfo(activity.deviceInfo)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {activity.success ? (
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-1" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-1" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
            {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} of{' '}
            {pagination.totalCount} activities
          </div>

          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
              variant="outline"
              size="sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="px-3 py-2 text-sm">
              Page {pagination.currentPage} of {pagination.totalPages}
            </span>

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!pagination.hasNextPage}
              variant="outline"
              size="sm"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}