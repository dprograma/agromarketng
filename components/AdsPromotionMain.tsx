"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CheckCircle, BarChart2, Clock, TrendingUp, Star } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { boostOptions, subscriptionPlans } from "@/constants";
import { Ad, PaymentDetails, ActivePromotion, PromotionsResponse, Promotion } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSession } from "@/components/SessionWrapper";
import { useRouter } from "next/navigation";
import PaymentModal from "@/components/PaymentModal";
import Alert from '@/components/Alerts';

export default function AdPromotions() {
  const [trackingStats, setTrackingStats] = useState({
    activeBoosts: 0,
    expiringSoon: 0,
    totalViews: 0
  });
  const [promotionHistory, setPromotionHistory] = useState<{
    ad: string;
    boostType: string;
    duration: number;
    views: number;
    status: string;
  }[]>([]);
  const [promotions, setPromotions] = useState<PromotionsResponse>({ boosts: [], subscription: null });
  const { session, setSession } = useSession();
  const router = useRouter();
  const [showPayment, setShowPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activePromotions, setActivePromotions] = useState<ActivePromotion[]>([]);
  const [showAllPromotions, setShowAllPromotions] = useState(false);
  const [alerts, setAlerts] = useState<boolean>(false);
  const [alertMessages, setAlertMessages] = useState<string | undefined>();
  const [alertTypes, setAlertTypes] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  
  // Fetch and transform promotions
  const fetchPromotions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/promotions/active');

      if (!response.ok) {
        throw new Error('Failed to fetch promotions');
      }

      const data = await response.json();
      setPromotions(data);

      // Transform promotions data into activePromotions format
      const transformed: ActivePromotion[] = [
        ...data.boosts.map((boost: Promotion) => ({
          type: 'boost',
          id: boost.id,
          title: boost.title,
          startDate: boost.startDate || new Date().toISOString(),
          endDate: boost.endDate,
          views: boost.metrics?.views || 0,
          clicks: boost.metrics?.clicks || 0,
          boostType: boost.boostType
        })),
        ...(data.subscription ? [{
          type: 'subscription',
          id: data.subscription.id,
          title: data.subscription.title,
          startDate: new Date().toISOString(),
          endDate: data.subscription.endDate,
          plan: data.subscription.title,
        }] : [])
      ];
      setActivePromotions(transformed);
      calculateTrackingStats(transformed);
  
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchPromotions();
  }, []);

  const calculateTrackingStats = (promotions: ActivePromotion[]) => {
    const now = new Date();
    const stats = {
      activeBoosts: promotions.filter(p => p.type === 'boost').length,
      expiringSoon: promotions.filter(p => {
        const daysLeft = getRemainingDays(p.endDate);
        return daysLeft <= 3 && daysLeft > 0;
      }).length,
      totalViews: promotions.reduce((total, p) => total + (p.views || 0), 0)
    };
    setTrackingStats(stats);
  
    // Calculate promotion history
    const history = promotions.map(p => ({
      ad: p.title,
      boostType: p.type === 'boost' ? boostOptions.find(b => b.id === p.boostType)?.name || 'Standard' : 'Subscription',
      duration: getRemainingDays(p.endDate),
      views: p.views || 0,
      status: getRemainingDays(p.endDate) > 0 ? 'Active' : 'Expired'
    }));
    setPromotionHistory(history);
  };

  // Add subscription payment handler
  const handleSubscribe = async (plan: typeof subscriptionPlans[0]) => {
    if (!session?.email) {
      router.push('/auth/signin?callbackUrl=/dashboard/promotions');
      return;
    }

    const reference = `sub_${plan.id}_${Date.now()}`;
    const details: PaymentDetails = {
      email: session.email,
      amount: plan.price,
      reference,
      plan: plan.name,
      planId: plan.id,
      type: 'subscription'
    };

    setPaymentDetails(details);
    setShowPayment(true);
  };

  // Add payment success handler
  const handlePaymentSuccess = async (reference: string) => {
    try {
      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reference,
          planId: paymentDetails?.planId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }

      // Refresh promotions data
      fetchPromotions();
      setShowPayment(false);
      setAlerts(true)
      setAlertTypes('success');
      setAlertMessages('Subscription activated successfully!');
      return;
    } catch (error) {
      setAlerts(true)
      setAlertTypes('error');
      setAlertMessages('Failed to activate subscription');
    }
  };


  // Display only first 4 items in main view
  const displayedPromotions = activePromotions.slice(0, 4);
  const hasMorePromotions = activePromotions.length > 4;

  // Calculate pagination
  const totalPages = Math.ceil(activePromotions.length / itemsPerPage);
  const paginatedPromotions = activePromotions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const PromotionCard = ({ promotion }: { promotion: ActivePromotion }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-gray-500 text-sm font-medium">
              {promotion.title}
            </CardTitle>
            <Badge
              variant={promotion.type === 'subscription' ? 'secondary' : 'default'}
              className="mt-1 text-gray-400"
            >
              {promotion.type === 'subscription' ? '🌟 Subscription' : '🚀 Boost'}
            </Badge>
          </div>
          <Badge
            variant={getRemainingDays(promotion.endDate) < 3 ? "destructive" : "success"}
          >
            {getRemainingDays(promotion.endDate)}d left
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {promotion.type === 'boost' ? (
          <>
            <p className="text-sm text-gray-600">
              {boostOptions.find(opt => opt.id === promotion.boostType)?.name}
            </p>
            <div className="mt-2 flex justify-between text-sm text-gray-500">
              <span>Views: {promotion.views || 0}</span>
              <span>Clicks: {promotion.clicks || 0}</span>
            </div>
          </>
        ) : (
          <div className="text-sm text-gray-600">
            <p>Plan: {promotion.plan}</p>
            <p className="mt-1">Unlimited Ads</p>
          </div>
        )}
        <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5">
          <div
            className={cn(
              "h-1.5 rounded-full transition-all",
              promotion.type === 'subscription' ? 'bg-purple-600' : 'bg-green-600'
            )}
            style={{
              width: `${100 - (getRemainingDays(promotion.endDate) /
                ((new Date(promotion.endDate).getTime() - new Date(promotion.startDate).getTime()) /
                  (1000 * 60 * 60 * 24)) * 100)}%`
            }}
          />
        </div>
      </CardContent>
    </Card>
  );

  // Calculate remaining days
  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {alerts && <Alert message={alertMessages || ''} type={alertTypes || ''} />}
      <h2 className="text-2xl font-semibold text-gray-800 text-center">🚀 Boost & Promote Your Ads</h2>
      <p className="text-gray-600 text-center mt-2">Increase visibility and get more potential buyers.</p>

      {/* Active Promotions Section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-700">
            🎯 Active Boosts & Subscriptions
          </h3>
          {hasMorePromotions && (
            <button
              onClick={() => setShowAllPromotions(true)}
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View All
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-[150px]" />
              </Card>
            ))}
          </div>
        ) : activePromotions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayedPromotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
        ) : (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-gray-500">No active promotions found.</p>
              <p className="text-sm text-gray-400 mt-2">
                Select a monthly subscription below or go to your{" "}
                <Link href="/dashboard/my-ads" className="text-green-600 hover:underline">
                  ads
                </Link>{" "}
                to promote single ads.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* View All Promotions Modal */}
      <Dialog open={showAllPromotions} onOpenChange={setShowAllPromotions}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>All Active Promotions</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {paginatedPromotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={cn(
                    "px-3 py-1 rounded",
                    currentPage === i + 1
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Monthly Subscription Plans */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-700">🌟 Monthly Subscription Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {subscriptionPlans.map((plan) => (
            <div key={plan.name} className="p-6 border rounded-lg shadow-sm">
              <h4 className="text-lg font-semibold text-gray-400">{plan.name}</h4>
              <p className="text-green-600 font-bold text-xl">{formatCurrency(Number(plan.price))}/mo</p>
              <ul className="mt-3 space-y-1 text-sm text-gray-600">
                {plan.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="text-green-500 mr-2" size={16} />
                    {benefit}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={promotions.subscription?.id === plan.id}
                className={cn(
                  "w-full mt-4 py-2 rounded-md transition",
                  promotions.subscription?.id === plan.id
                    ? "bg-gray-300 cursor-not-allowed text-gray-600"
                    : "bg-green-600 text-white hover:bg-green-700"
                )}
              >
                {promotions.subscription?.id === plan.id ? 'Current Plan' : 'Subscribe'}
              </button>
            </div>
          ))}
        </div>
        {/* Payment Modal */}
        {showPayment && paymentDetails && (
          <PaymentModal
            isOpen={showPayment}
            onClose={() => setShowPayment(false)}
            paymentDetails={paymentDetails}
            onSuccess={handlePaymentSuccess}
          />
        )}
      </div>
{/* Promotion Tracking */}
<div className="mt-8">
  <h3 className="text-lg font-semibold text-gray-700">📊 Promotion Tracking</h3>
  <div className="mt-4 border p-4 rounded-lg shadow-sm">
    <div className="flex items-center justify-between text-gray-700">
      <div className="flex items-center">
        <TrendingUp className="text-green-500" size={20} />
        <span className="ml-2 font-medium">
          Active Boosts: {trackingStats.activeBoosts}
        </span>
      </div>
      <div className="flex items-center">
        <Clock className="text-yellow-500" size={20} />
        <span className="ml-2 font-medium">
          Expiring Soon: {trackingStats.expiringSoon}
        </span>
      </div>
      <div className="flex items-center">
        <BarChart2 className="text-blue-500" size={20} />
        <span className="ml-2 font-medium">
          Total Views Gained: {trackingStats.totalViews.toLocaleString()}
        </span>
      </div>
    </div>

    {/* Promotion History Table */}
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-sm text-left border-collapse border">
        <thead>
          <tr className="bg-gray-100 text-gray-500">
            <th className="p-2 border">Ad</th>
            <th className="p-2 border">Boost Type</th>
            <th className="p-2 border">Days Left</th>
            <th className="p-2 border">Views Gained</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {promotionHistory.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50 text-gray-600">
              <td className="p-2 border">{item.ad}</td>
              <td className="p-2 border">{item.boostType}</td>
              <td className="p-2 border">{item.duration} days</td>
              <td className="p-2 border">{item.views.toLocaleString()}</td>
              <td className={cn(
                "p-2 border font-medium",
                item.status === 'Active' ? "text-green-600" : "text-gray-600"
              )}>
                {item.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
</div>
    </div>
  );
}
