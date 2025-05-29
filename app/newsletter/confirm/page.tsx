"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function NewsletterConfirmPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const confirmSubscription = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Invalid confirmation link. No token provided.");
        return;
      }

      try {
        const response = await fetch("/api/newsletter/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus("success");
          setMessage(data.message || "Your subscription has been confirmed!");
        } else {
          setStatus("error");
          setMessage(data.error || "Failed to confirm subscription. Please try again.");
        }
      } catch (error) {
        console.error("Error confirming subscription:", error);
        setStatus("error");
        setMessage("An error occurred. Please try again later.");
      }
    };

    confirmSubscription();
  }, [token]);

  return (
    <>
      <Navbar />
      
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
          {status === "loading" && (
            <div className="flex flex-col items-center">
              <Loader2 className="h-16 w-16 text-green-600 animate-spin mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirming Subscription</h2>
              <p className="text-gray-600">Please wait while we confirm your subscription...</p>
            </div>
          )}
          
          {status === "success" && (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Confirmed!</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-gray-600 mb-6">
                Thank you for subscribing to our newsletter. You'll now receive updates on our latest products, 
                agricultural tips, and exclusive offers.
              </p>
              <Link 
                href="/" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Return to Home
              </Link>
            </div>
          )}
          
          {status === "error" && (
            <div className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Confirmation Failed</h2>
              <p className="text-gray-600 mb-6">{message}</p>
              <p className="text-gray-600 mb-6">
                There was a problem confirming your subscription. The link may have expired or is invalid.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/" 
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
                >
                  Return to Home
                </Link>
                <Link 
                  href="/#cta" 
                  className="inline-flex items-center px-4 py-2 border border-green-600 text-base font-medium rounded-md shadow-sm text-green-600 bg-white hover:bg-gray-50"
                >
                  Try Again
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </>
  );
}
