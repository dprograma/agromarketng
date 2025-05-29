"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DisableableDropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Eye, Star, TrendingUp, MoreVertical, CheckCircle, Clock, XCircle,
  Search, PlusCircle, Filter, ChevronLeft, ChevronRight, AlertCircle,
  Share2, Edit, Trash2, BarChart2
} from "lucide-react";
import { Ad, SubscriptionPlan, MyAdsResponse } from '@/types';
import { showToast } from "@/lib/toast-utils";
import BoostAdModal from '@/components/BoostAdModal';
import { formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Alert from '@/components/Alerts';
import { debugRSC } from '@/lib/rsc-debug';

type AlertType = 'success' | 'error' | 'warning' | 'info';

export default function MyAdsManagement() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [ads, setAds] = useState<Ad[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 6;
  const [alerts, setAlerts] = useState<boolean>(false);
  const [alertMessages, setAlertMessages] = useState<string | undefined>();
  const [alertTypes, setAlertTypes] = useState<string | undefined>();
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [maxFreeAds, setMaxFreeAds] = useState<number>(5);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch ads with React Query
  const { data: adsData, isLoading: isAdsLoading, error } = useQuery({
    queryKey: ['myAds'],
    queryFn: async (): Promise<MyAdsResponse> => {
      try {
        const response = await fetch('/api/ads/my-ads', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Authentication required');
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
      } catch (error) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          throw new Error('Network connection failed. Please check your internet connection.');
        }
        throw error;
      }
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (error instanceof Error &&
        (error.message.includes('Network connection failed') ||
          error.message.includes('Authentication required'))) {
        return false;
      }
      return failureCount < 2;
    },
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // Handle query errors
  useEffect(() => {
    if (error) {
      setAlerts(true);
      setAlertTypes('error');

      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          setAlertMessages('Please log in to view your ads');
          router.push('/signin');
        } else if (error.message.includes('Network connection failed')) {
          setAlertMessages('Network connection failed. Please check your internet connection and try again.');
        } else {
          setAlertMessages(error.message || 'Failed to fetch ads');
        }
      }
    }
  }, [error, router]);

  // Update local state when data changes
  useEffect(() => {
    if (adsData?.ads) {
      setAds(adsData.ads);
      setSubscription(adsData.subscription);
      setMaxFreeAds(adsData.maxFreeAds);
      setIsLoading(false);
    }
  }, [adsData]);

  // Memoize filtered ads
  const filteredAds = useMemo(() => {
    if (!adsData?.ads) return [];
    return adsData.ads.filter((ad) => {
      const matchesSearch = ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ad.price.toString().includes(searchTerm.toLowerCase()) ||
        ad.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [adsData?.ads, searchTerm, statusFilter]);

  // Memoize current page ads
  const currentAds = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAds.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAds, currentPage, itemsPerPage]);

  // Add subscription check for new ad button
  const canAddNewAd = subscription || ads.length < maxFreeAds;

  // Optimistic updates for status changes
  const updateStatus = useCallback(async (id: string, newStatus: string) => {
    queryClient.setQueryData(['myAds'], (oldData: MyAdsResponse | undefined) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        ads: oldData.ads.map(ad =>
          ad.id === id ? { ...ad, status: newStatus } : ad
        )
      };
    });

    try {
      const { data } = await debugRSC.safeApiCall(`/api/ads/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      }, `Update Ad Status - ${id}`);

      showToast({ type: 'success', message: data.message || 'Status updated successfully' });
    } catch (error) {
      queryClient.invalidateQueries({ queryKey: ['myAds'] });
      showToast({ type: 'error', message: error instanceof Error ? error.message : 'Error updating status' });
    }
  }, [queryClient]);

  // Handle boost ad
  const handleBoostAd = useCallback(async (adId: string, boostType: number, duration: number) => {
    try {
      const { data } = await debugRSC.safeApiCall(`/api/ads/${adId}/boost`, {
        method: 'POST',
        body: JSON.stringify({ boostType, duration }),
      }, `Boost Ad - ${adId}`);

      queryClient.invalidateQueries({ queryKey: ['myAds'] });
      showToast({ type: 'success', message: 'Ad boosted successfully!' });
      setIsBoostModalOpen(false);
      setSelectedAd(null);
    } catch (error) {
      // Handle subscription required error
      if (error instanceof Error && error.message.includes('subscription')) {
        showToast({ type: 'warning', message: 'Subscription required to boost ads' });
        setIsBoostModalOpen(false);
        setSelectedAd(null);
        debugRSC.safeNavigate(router, '/dashboard/billing');
        return;
      }

      showToast({ type: 'error', message: error instanceof Error ? error.message : 'Error boosting ad' });
    }
  }, [queryClient, router]);

  // Handle feature
  const handleFeature = useCallback((ad: Ad) => {
    if (!ad.featured) {
      if (ad.status !== "Active") {
        showToast({ type: 'warning', message: 'Ad must be active before it can be featured' });
        return;
      }
      setSelectedAd(ad);
      setIsBoostModalOpen(true);
    } else {
      showToast({ type: 'info', message: 'This ad is already featured' });
    }
  }, []);

  const updateAnalytics = async (id: string, type: 'views' | 'clicks' | 'shares') => {
    try {
      const { data } = await debugRSC.safeApiCall(`/api/ads/${id}/analytics`, {
        method: 'PATCH',
        body: JSON.stringify({ type }),
      }, `Update Analytics - ${type}`);

      setAds(ads.map((currentAd) =>
        currentAd.id === id ? { ...currentAd, [type]: data.ad[type] } : currentAd
      ));
    } catch (error) {
      setAlerts(true)
      setAlertTypes('error');
      setAlertMessages(`Error updating ${type}: ` + (error instanceof Error ? error.message : error));
    }
  };

  const handleView = (id: string) => {
    updateAnalytics(id, 'views');
  };

  const handleClick = (id: string) => {
    updateAnalytics(id, 'clicks');
  };

  // Handle share
  const handleShare = useCallback(async (id: string) => {
    const ad = adsData?.ads.find(ad => ad.id === id);
    if (!ad) {
      return;
    }

    try {
      const shareUrl = `${window.location.origin}/ads/${ad.id}`;

      if (navigator.share) {
        await navigator.share({
          title: ad.title,
          text: `Check out this ad: ${ad.title}`,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast({ type: 'success', message: 'Ad link copied to clipboard!' });
      }

      updateAnalytics(id, 'shares');
    } catch (error) {
      showToast({ type: 'error', message: 'Error sharing: ' + (error instanceof Error ? error.message : error) });
    }
  }, [adsData?.ads]);

  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < Math.ceil(filteredAds.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, filteredAds.length, itemsPerPage]);

  if (isAdsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Ads</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Alert message="Failed to load ads. Please try again later." type="error" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto p-6 space-y-6"
    >
      {alerts && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert message={alertMessages || ''} type={alertTypes || ''} />
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Ads</h1>
        <Button
          onClick={() => router.push('/dashboard/new-ad')}
          className={`mt-4 md:mt-0 ${canAddNewAd ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'} text-white flex items-center gap-2`}
          disabled={!canAddNewAd}
        >
          <PlusCircle className="h-4 w-4" />
          Post New Ad
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 relative overflow-visible">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by title, price, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                className="px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
                <option value="Sold">Sold</option>
              </select>
            </div>
          </div>
        </div>

        <div className="relative overflow-visible">
          {ads.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">No ads found</h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                You haven't posted any ads yet. Create your first ad to start selling your products or services.
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => router.push('/dashboard/new-ad')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Post Your First Ad
                </Button>
              </div>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="mx-auto h-16 w-16 text-gray-400 mb-4">
                <Search className="h-16 w-16" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No matching ads found</h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                Try adjusting your search or filter criteria to find what you're looking for.
              </p>
              <div className="mt-6">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 relative overflow-visible">
              <AnimatePresence>
                {currentAds.map((ad, index) => (
                  <motion.div
                    key={ad.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className="bg-white rounded-lg overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative"
                    style={{ zIndex: currentAds.length - index }}
                  >
                    <div className="relative aspect-video bg-gray-100">
                      {ad.images && ad.images.length > 0 ? (
                        <Image
                          src={ad.images[0]}
                          alt={ad.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}

                      <div className="absolute top-2 right-2">
                        <Badge
                          className={`px-2 py-1 text-xs font-medium ${ad.status === "Active" ? "bg-green-100 text-green-800 border border-green-200" :
                            ad.status === "Pending" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" :
                              ad.status === "Sold" ? "bg-blue-100 text-blue-800 border border-blue-200" :
                                "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                        >
                          {ad.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{ad.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{ad.category}</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(Number(ad.price))}</p>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            className="flex items-center h-8 px-2"
                            onClick={() => handleView(ad.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            {ad.views || 0}
                          </Button>
                          <Button
                            variant="outline"
                            className="flex items-center h-8 px-2"
                            onClick={() => handleClick(ad.id)}
                          >
                            <BarChart2 className="h-4 w-4 mr-1" />
                            {ad.clicks || 0}
                          </Button>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="right"
                            sideOffset={8}
                            avoidCollisions={true}
                            collisionPadding={20}
                            className="z-50 min-w-[160px] bg-white shadow-lg rounded-md border border-gray-200"
                          >
                            <DropdownMenuItem onClick={() => router.push(`/dashboard/edit-ad/${ad.id}`)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleShare(ad.id)}>
                              <Share2 className="h-4 w-4 mr-2" />
                              Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {ad.status === "Active" && (
                              <DropdownMenuItem onClick={() => updateStatus(ad.id, "Inactive")}>
                                <XCircle className="h-4 w-4 mr-2" />
                                Mark as Inactive
                              </DropdownMenuItem>
                            )}
                            {ad.status === "Inactive" && (
                              <DropdownMenuItem onClick={() => updateStatus(ad.id, "Active")}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Set as Active
                              </DropdownMenuItem>
                            )}
                            {ad.status === "Active" && (
                              <DropdownMenuItem onClick={() => updateStatus(ad.id, "Sold")}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark as Sold
                              </DropdownMenuItem>
                            )}
                            {ad.status === "Active" && !ad.featured && (
                              <DropdownMenuItem onClick={() => handleFeature(ad)}>
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Boost Ad
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this ad?')) {
                                  updateStatus(ad.id, "Deleted");
                                }
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-center">
        <Button
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className="mr-2"
        >
          Previous
        </Button>
        <Button
          onClick={handleNextPage}
          disabled={currentPage === Math.ceil(filteredAds.length / itemsPerPage)}
        >
          Next
        </Button>
      </div>

      {selectedAd && (
        <BoostAdModal
          isOpen={isBoostModalOpen}
          onClose={() => {
            setIsBoostModalOpen(false);
            setSelectedAd(null);
          }}
          onBoost={handleBoostAd}
          ad={selectedAd}
        />
      )}
    </motion.div>
  );
}