import type { Metadata } from "next";
import SessionWrapper from '@/components/SessionWrapper';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
// import { SessionProvider } from "next-auth/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgroMarket Nigeria | Buy and Sell Agricultural Products",
  description: "AgroMarket Nigeria offers a trusted classified ads platform for buying and selling agricultural products from farmers, dealers, and agro-companies.",
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
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const sessionCookie = (await cookies()).get('next-auth.session-token')?.value;
  let session = null;

  if (sessionCookie) {
    try {
      session = jwt.verify(sessionCookie, process.env.NEXTAUTH_SECRET!); // Decode the token
    } catch (err) {
      console.error('Invalid session token:', err);
    }
  }

  return (
    <html lang="en">
      <body className="relative">
        <SessionWrapper session={session}>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}
