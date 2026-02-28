import type { Metadata } from "next";
import SessionWrapper from '@/components/SessionWrapper';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { Session } from '@/types';
import "./globals.css";
import { initCronJobs } from '@/services/cron';
import { Toaster } from 'react-hot-toast';
import CookieConsent from "@/components/CookieConsent";
import Providers from './providers'
import { Inter } from 'next/font/google';

if (process.env.NODE_ENV === 'development') {
  initCronJobs();
}

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "AgroMarket Nigeria | Buy and Sell Agricultural Products",
  description: "AgroMarket Nigeria offers a trusted classified ads platform for buying and selling agricultural products from farmers, dealers, and agro-companies.",
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: "AgroMarket Nigeria | Agricultural Classifieds",
    description: "Explore AgroMarket Nigeria for the best deals on agricultural products. Connecting farmers with buyers in Nigeria.",
    url: "https://www.agromarketng.com",
    type: "website",
    images: [
      {
        url: "https://www.agromarketng.com/assets/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "AgroMarket Nigeria",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgroMarket Nigeria",
    description: "Best classified ads platform for agricultural products.",
    site: "@AgroMarketNG",
    creator: "@AgroMarketNG",
    images: [
      {
        url: "https://www.agromarketng.com/assets/images/twitter-image.jpg",
        alt: "AgroMarket Nigeria",
      },
    ],
  },
  alternates: {
    canonical: "https://www.agromarketng.com",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('Rendering RootLayout');
  const sessionCookie = (await cookies()).get('next-auth.session-token')?.value;
  let initialSession = null;

  if (sessionCookie) {
    try {
      const decoded = jwt.verify(sessionCookie, process.env.NEXTAUTH_SECRET!) as Session;
      initialSession = {
        token: sessionCookie,
        ...decoded
      };
    } catch (err) {
      console.error('Invalid session token:', err);
    }
  }

  return (
    <html lang="en">
      <head>
        <script src="https://js.paystack.co/v2/inline.js"></script>
      </head>
      <body className={inter.className}>
        <Providers>
          <SessionWrapper session={initialSession}>
            {children}
            <Toaster position="top-right" />
            <CookieConsent />
          </SessionWrapper>
        </Providers>
      </body>
    </html>
  );
}