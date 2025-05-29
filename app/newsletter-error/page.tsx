"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AlertTriangle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function NewsletterError() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get('message');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    switch (errorType) {
      case 'missing_token':
        setErrorMessage('The confirmation link is missing a required token.');
        break;
      case 'invalid_token':
        setErrorMessage('The confirmation link is invalid or has expired.');
        break;
      case 'server_error':
        setErrorMessage('There was a server error processing your request.');
        break;
      default:
        setErrorMessage('An unknown error occurred.');
    }
  }, [errorType]);

  return (
    <>
      <Navbar />
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4">
              <AlertTriangle className="h-16 w-16 text-yellow-500" />
            </div>
            <h2 className="mt-2 text-3xl font-extrabold text-gray-900">
              Subscription Error
            </h2>
            <p className="mt-2 text-gray-600">
              {errorMessage}
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
                Please try subscribing again from our homepage or contact support if the issue persists.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Return to Homepage
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
