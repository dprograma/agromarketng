"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DisableableDropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Star, TrendingUp, MoreVertical, CheckCircle, Clock, XCircle } from "lucide-react";
import { Ad, SubscriptionPlan, MyAdsResponse } from '@/types';
import Alert from '@/components/Alerts';
import BoostAdModal from '@/components/BoostAdModal';
import { formatCurrency } from '@/lib/utils';


export default function MyAdsManagement() {
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 5;
  const [alerts, setAlerts] = useState<boolean>(false);
  const [alertMessages, setAlertMessages] = useState<string | undefined>();
  const [alertTypes, setAlertTypes] = useState<string | undefined>();
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionPlan | null>(null);
  const [maxFreeAds, setMaxFreeAds] = useState<number>(5);

  // Fetch ads from the database
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await fetch('/api/ads/my-ads');
        if (!response.ok) {
          setAlerts(true)
          setAlertTypes('error');
          setAlertMessages('Failed to fetch ads');
          return;
        }
        const data: MyAdsResponse = await response.json();
        setAds(data.ads);
        setSubscription(data.subscription);
        setMaxFreeAds(data.maxFreeAds);
      } catch (error) {
        setAlerts(true)
        setAlertTypes('error');
        setAlertMessages('Failed to fetch ads');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAds();
  }, []);


  // Fetch ads from the database
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/ads/my-ads');
        
        if (!response.ok) {
          setAlerts(true)
          setAlertTypes('error');
          setAlertMessages('Failed to fetch ads');
          return;
        }
        
        const data: MyAdsResponse = await response.json();
        console.log("my ads response: ", data);
        // Check if data contains ads array
        if (data && Array.isArray(data.ads)) {
          setAds(data.ads);
          setSubscription(data.subscription);
          setMaxFreeAds(data.maxFreeAds);
          setAlerts(false); 
        } else {
          setAlerts(true)
          setAlertTypes('error');
          setAlertMessages('Invalid data format received');
          return;
        }
      } catch (error) {
        setAlerts(true);
        setAlertTypes('error');
        setAlertMessages('Failed to fetch ads');
        setAds([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchAds();
  }, []);



  // Add subscription check for new ad button
  const canAddNewAd = subscription || ads.length < maxFreeAds;

  // Handle search functionality
  const filteredAds = ads.filter(
    (ad) =>
      ad.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ad.price.toString().includes(searchTerm.toLowerCase())
  );

  // Handle pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAds = filteredAds.slice(startIndex, startIndex + itemsPerPage);

  // Update ad status
  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/ads/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlerts(true)
        setAlertTypes('error');
        setAlertMessages('Failed to update status');
      }

      if (data.ad) {
        setAds(ads.map((ad) =>
          ad.id === id ? { ...ad, status: data.ad.status } : ad
        ));

        // Show success message
        setAlerts(true);
        setAlertTypes('success');
        setAlertMessages(data.message || 'Status updated successfully');
      }
    } catch (error) {
      setAlerts(true);
      setAlertTypes('error');
      setAlertMessages(error instanceof Error ? error.message : 'Error updating status');
    }
  };

  const handleBoostAd = async (adId: string, boostType: number, duration: number) => {
    try {
      const response = await fetch(`/api/ads/${adId}/boost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boostType, duration }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle subscription required case
        if (response.status === 403 && data.status === 'SUBSCRIPTION_REQUIRED') {
          setAlerts(true);
          setAlertTypes('warning');
          setAlertMessages('Subscription required to boost ads');

          // Close boost modal
          setIsBoostModalOpen(false);
          setSelectedAd(null);

          // Store ad info in sessionStorage for after subscription
          sessionStorage.setItem('pendingBoost', JSON.stringify({
            adId,
            boostType,
            duration
          }));

          // Redirect to promotions page
          router.push(data.redirectUrl);
          return;
        }

        throw new Error(data.error || 'Failed to boost ad');
      }

      // Update local state if successful
      setAds(ads.map((ad) =>
        ad.id === adId ? { ...ad, featured: true, status: 'Active' } : ad
      ));

      setAlerts(true);
      setAlertTypes('success');
      setAlertMessages('Ad boosted successfully!');
    } catch (error) {
      setAlerts(true);
      setAlertTypes('error');
      setAlertMessages(error instanceof Error ? error.message : 'Error boosting ad');
    }
  };

  //   try {
  //     const response = await fetch(`/api/ads/${id}/feature`, {
  //       method: 'PATCH',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       setAlerts(true)
  //       setAlertTypes('error');
  //       setAlertMessages('Failed to feature ad: ' + data.error);
  //     }

  //     if (data.ad) {
  //       setAds(ads.map((currentAd) =>
  //         currentAd.id === id ? {
  //           ...currentAd,
  //           featured: data.ad.featured,
  //           status: data.ad.status
  //         } : currentAd
  //       ));

  //       // Show success message
  //       setAlerts(true);
  //       setAlertTypes('success');
  //       setAlertMessages(data.message || 'Ad has been featured successfully!');
  //     }
  //   } catch (error) {
  //     setAlerts(true)
  //     setAlertTypes('error');
  //     setAlertMessages('Error featuring ad: ' + error);
  //   }
  // };

  // Update the DropdownMenuContent section in the return statement:

  const handleFeature = async (ad: Ad) => {
    if (!ad.featured) {
      setSelectedAd(ad);
      setIsBoostModalOpen(true);
    }
  };

  const updateAnalytics = async (id: string, type: 'views' | 'clicks' | 'shares') => {
    try {
      const response = await fetch(`/api/ads/${id}/analytics`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {

        setAlerts(true)
        setAlertTypes('error');
        setAlertMessages('Failed to update analytics');
      }

      const { ad } = await response.json();

      // Update the local state with new analytics
      setAds(ads.map((currentAd) =>
        currentAd.id === id ? { ...currentAd, [type]: ad[type] } : currentAd
      ));
    } catch (error) {
      setAlerts(true)
      setAlertTypes('error');
      setAlertMessages(`Error updating ${type}: ` + error);
    }
  };

  const handleView = (id: string) => {
    updateAnalytics(id, 'views');
  };

  const handleClick = (id: string) => {
    updateAnalytics(id, 'clicks');
  };

  const handleShare = async (id: string) => {
    const ad = ads.find(ad => ad.id === id);
    if (!ad) return;

    try {
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: ad.title,
          text: `Check out this ad: ${ad.title}`,
          url: `${window.location.origin}/ads/${ad.id}`,
        });
        updateAnalytics(id, 'shares');
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/ads/${ad.id}`);
        setAlerts(true)
        setAlertTypes('success');
        setAlertMessages('Ad link copied to clipboard!');
        updateAnalytics(id, 'shares');
      }
    } catch (error) {
      setAlerts(true)
      setAlertTypes('success');
      setAlertMessages('Error sharing: ' + error);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < Math.ceil(filteredAds.length / itemsPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Ads Management</h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading ads...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {alerts && <Alert message={alertMessages || ''} type={alertTypes || ''} />}
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Ads Management</h1>

      <div className="mb-4 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search Ads"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 px-4 py-2 rounded-md w-1/3"
        />
        <Button variant="outline" className="px-6 py-2">Search</Button>
      </div>

      <Card className="shadow-lg border border-gray-200">
        <CardHeader className="bg-gray-100 p-4 rounded-t-lg">
          <h2 className="text-lg font-semibold text-gray-700">Your Ads</h2>
        </CardHeader>

        <CardContent className="p-6">
          {ads.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No ads found. Create your first ad!</p>
            </div>
          ) : (
            <Table className="w-full border border-gray-200 rounded-md">
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="px-4 py-3 text-left">Title</TableHead>
                  <TableHead className="px-4 py-3 text-center">Status</TableHead>
                  <TableHead className="px-4 py-3 text-center">Analytics</TableHead>
                  <TableHead className="px-4 py-3 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAds.map((ad) => (
                  <TableRow key={ad.id} className="hover:bg-gray-50 transition">
                    <TableCell className="px-4 py-4">
                      <p className="font-semibold text-gray-900">{ad.title}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(Number(ad.price))}</p>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-center">
                      <Badge
                        className={`px-3 py-1 text-sm font-medium rounded-full ${ad.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : ad.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-200 text-gray-700"
                          }`}
                      >
                        {ad.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-center">
                      <div className="text-sm space-y-2">
                        <button
                          onClick={() => handleView(ad.id)}
                          className="flex items-center justify-center space-x-2 w-full hover:bg-gray-50 p-1 rounded"
                        >
                          <Eye className="w-4 h-4 text-blue-500" />
                          <span>{ad.views || 0} Views</span>
                        </button>
                        <button
                          onClick={() => handleClick(ad.id)}
                          className="flex items-center justify-center space-x-2 w-full hover:bg-gray-50 p-1 rounded"
                        >
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          <span>{ad.clicks || 0} Clicks</span>
                        </button>
                        <button
                          onClick={() => handleShare(ad.id)}
                          className="flex items-center justify-center space-x-2 w-full hover:bg-gray-50 p-1 rounded"
                        >
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span>{ad.shares || 0} Shares</span>
                        </button>
                      </div>
                    </TableCell>

                    <TableCell className="px-4 py-4 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="hover:bg-gray-200 p-2 rounded-lg">
                            <MoreVertical className="w-5 h-5 text-gray-600" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="right" className="bg-white shadow-lg rounded-lg border border-gray-200">
                          <DisableableDropdownMenuItem
                            onClick={() => updateStatus(ad.id, "Sold")}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50"
                            disabled={ad.status === "Sold"}
                          >
                            <CheckCircle className={`w-4 h-4 ${ad.status === "Sold" ? "text-gray-400" : "text-green-500"}`} />
                            <span>Mark as Sold</span>
                          </DisableableDropdownMenuItem>

                          <DisableableDropdownMenuItem
                            onClick={() => updateStatus(ad.id, "Active")}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50"
                            disabled={ad.status === "Active"}
                          >
                            <Clock className={`w-4 h-4 ${ad.status === "Active" ? "text-gray-400" : "text-yellow-500"}`} />
                            <span>Set as Active</span>
                          </DisableableDropdownMenuItem>

                          <DisableableDropdownMenuItem
                            onClick={() => updateStatus(ad.id, "Inactive")}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50"
                            disabled={ad.status === "Inactive"}
                          >
                            <XCircle className={`w-4 h-4 ${ad.status === "Inactive" ? "text-gray-400" : "text-gray-500"}`} />
                            <span>Mark as Inactive</span>
                          </DisableableDropdownMenuItem>

                          <DisableableDropdownMenuItem
                            onClick={() => handleFeature(ad)}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50"
                            disabled={ad.featured}
                          >
                            <Star className={`w-4 h-4 ${ad.featured ? "text-gray-400" : "text-purple-500"}`} />
                            <span>{ad.featured ? "Featured" : "Upgrade to Featured"}</span>
                          </DisableableDropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>

        {!subscription && ads.length >= maxFreeAds && (
        <Alert 
          type="warning" 
          message={`You've reached your free ad limit (${maxFreeAds}). Subscribe to post more ads!`}
        />
      )}

        <CardFooter className="flex flex-wrap justify-between items-center p-4 bg-gray-50 rounded-b-lg gap-2">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <p>Page {currentPage} of {Math.ceil(filteredAds.length / itemsPerPage)}</p>
            <Button
              variant="outline"
              onClick={handleNextPage}
              disabled={currentPage === Math.ceil(filteredAds.length / itemsPerPage)}
            >
              Next
            </Button>
          </div>
          <Button
            onClick={() => router.push("/dashboard/new-ad")}
            variant="outline"
            className="w-full sm:w-auto"
            disabled={!canAddNewAd}
            title={!canAddNewAd ? "Subscribe to post more ads" : ""}
          >
            Add New Ad
          </Button>
        </CardFooter>
      </Card>
      {selectedAd && (
        <BoostAdModal
          isOpen={isBoostModalOpen}
          onClose={() => {
            setIsBoostModalOpen(false);
            setSelectedAd(null);
          }}
          ad={selectedAd}
          onBoost={handleBoostAd}
        />
      )}
    </div>
  );
}