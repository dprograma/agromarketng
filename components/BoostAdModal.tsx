import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { boostOptions } from "@/constants";
import Alert from '@/components/Alerts';
import { AlertsMsg } from '@/components/AlertsMsg';
import { useSession } from "@/components/SessionWrapper";
import { BoostAdModalProps, PaymentDetails } from "@/types";
import PaymentModal from "@/components/PaymentModal";

export default function BoostAdModal({ isOpen, onClose, ad, onBoost }: BoostAdModalProps) {
  const { session } = useSession();
  const [selectedBoost, setSelectedBoost] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [alerts, setAlerts] = useState<boolean>(false);
  const [alertMessages, setAlertMessages] = useState<string | undefined>();
  const [alertTypes, setAlertTypes] = useState<string | undefined>();


  const handlePaymentSuccess = async (reference: string) => {
    setIsLoading(true);
    try {
      // Verify payment server-side
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference })
      });

      const verifyData = await verifyResponse.json();

      if (verifyData.success) {
        // Update local state
        await onBoost(ad.id, selectedBoost!, selectedDuration!);
        // Show success message
        setAlerts(true);
        setAlertTypes('success');
        setAlertMessages('Ad boosted successfully!');

        // Close modal
        onClose();

        // Optionally refresh the page to show updated subscription status
        window.location.href = '/dashboard/promotions';
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setAlerts?.(true);
      setAlertTypes?.('error');
      setAlertMessages?.(error instanceof Error ? error.message : 'Payment verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBoostClick = async () => {
    // Add console.log to debug state values
    console.log({
      selectedBoost,
      selectedDuration,
      sessionEmail: session?.email,
      isLoading
    });

    if (!selectedBoost || !selectedDuration || !session?.email) {
      console.log('Validation failed:', {
        hasBoost: !!selectedBoost,
        hasDuration: !!selectedDuration,
        hasEmail: !!session?.email
      });
      return;
    }

    const option = boostOptions.find(opt => opt.id === selectedBoost);
    if (!option) {
      console.log('No matching boost option found');
      return;
    }

    const price = option.price[selectedDuration as keyof typeof option.price];

    const reference = `boost_${ad.id}_${Date.now()}`;
    const details: PaymentDetails = {
      email: session.email,
      amount: price,
      reference,
      plan: option.name,
      adId: ad.id,
      boostType: selectedBoost,
      boostDuration: selectedDuration
    };

    setPaymentDetails(details);
    setShowPayment(true);
  };

  // Update the duration click handler to prevent event bubbling
  const handleDurationClick = (e: React.MouseEvent, days: number, optionId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedBoost(optionId);
    setSelectedDuration(days);
  };

  const getPriceDisplay = (option: typeof boostOptions[0]) => {
    if (selectedBoost === option.id && selectedDuration && (selectedDuration === 7 || selectedDuration === 14)) {
      return formatCurrency(option.price[selectedDuration as 7 | 14]);
    }
    // Show price range if no duration selected
    return `${formatCurrency(option.price[7])} - ${formatCurrency(option.price[14])}`;
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        {alerts && <Alert message={alertMessages || ''} type={alertTypes || ''} />}
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Boost Ad: {ad.title}</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Select Boost Option</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {boostOptions.map((option) => (
                <div
                  key={option.id}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition duration-300",
                    selectedBoost === option.id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-500"
                  )}
                  onClick={() => setSelectedBoost(option.id)}
                >
                  <h4 className="text-md font-medium">{option.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{getPriceDisplay(option)}</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {option.duration.map((days) => (
                      <button
                        key={days}
                        className={cn(
                          "px-3 py-1 text-sm rounded-md border",
                          selectedBoost === option.id && selectedDuration === days
                            ? "bg-green-500 text-white"
                            : "border-gray-300 hover:bg-gray-100"
                        )}
                        onClick={(e) => handleDurationClick(e, days, option.id)}
                      >
                        {days} days
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleBoostClick}
              disabled={!selectedBoost || !selectedDuration || isLoading}
              className={cn(
                "text-white",
                !selectedBoost || !selectedDuration || isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              )}
            >
              {isLoading ? 'Processing...' : 'Boost Ad'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showPayment && paymentDetails && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          paymentDetails={paymentDetails}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  );
}