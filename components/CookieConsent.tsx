"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem("cookieConsent");
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem("cookieConsent", "all");
    setShowBanner(false);
  };

  const acceptEssential = () => {
    localStorage.setItem("cookieConsent", "essential");
    setShowBanner(false);
  };

  const closeBanner = () => {
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Cookie Consent</h3>
            <p className="text-gray-600 text-sm md:text-base">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies. 
              <Link href="/privacy-policy" className="text-green-600 hover:underline ml-1">
                Read our Cookie Policy
              </Link>
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
            <Button 
              variant="outline" 
              size="sm"
              onClick={acceptEssential}
              className="text-xs md:text-sm"
            >
              Essential Only
            </Button>
            <Button 
              onClick={acceptAll}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-xs md:text-sm"
            >
              Accept All
            </Button>
            <button 
              onClick={closeBanner}
              className="p-1 rounded-full hover:bg-gray-100"
              aria-label="Close cookie banner"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
