"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NewsletterSuccess() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'already_confirmed') {
      setMessage('You have already confirmed your subscription to our newsletter.');
    } else {
      setMessage('Thank you for confirming your subscription to our newsletter!');
    }
  }, [status]);

  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
              Subscription Confirmed
            </h2>
            <p className="mt-2 text-gray-600">
              {message}
            </p>
            <div className="mt-8 flex flex-col items-center">
              <Image
                src="/assets/img/agromarket-logo.png"
                alt="AgroMarket Logo"
                width={120}
                height={120}
                className="mb-4"
              />
              <p className="text-sm text-gray-500 mb-6">
                You'll now receive updates on new products, farming tips, and exclusive offers.
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Return to Homepage
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
