"use client";

import { useEffect } from 'react';
import { PaymentModalProps } from '@/types';

declare global {
  interface Window {
    PaystackPop: {
      setup(config: any): { openIframe(): void };
    };
  }
}

export default function PaymentModal({ isOpen, onClose, paymentDetails, onSuccess }: PaymentModalProps) {
  useEffect(() => {
    if (isOpen && window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY, 
        email: paymentDetails.email,
        amount: paymentDetails.amount * 100, 
        ref: paymentDetails.reference,
        metadata: {
          adId: paymentDetails.adId,
          boostType: paymentDetails.boostType,
          boostDuration: paymentDetails.boostDuration
        },
        onClose: () => {
          onClose();
        },
        callback: (response: { reference: string }) => {
          if (response.reference) {
            onSuccess(response.reference);
          }
          onClose();
        },
      });

      handler.openIframe();
    }
  }, [isOpen, paymentDetails, onSuccess, onClose]);

  return null;
}