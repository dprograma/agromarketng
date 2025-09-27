"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function Legal() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        <div className="bg-green-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Legal Information</h1>
            <p className="text-xl text-green-100">Legal documents and compliance information</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Legal Documents</h2>
              <p className="text-gray-700 mb-6">
                This page provides access to all legal documents and compliance information related to AgroMarket services.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link
                  href="/terms"
                  className="block p-6 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Terms of Service</h3>
                  <p className="text-gray-600">View our complete terms and conditions for using AgroMarket platform.</p>
                </Link>

                <Link
                  href="/privacy"
                  className="block p-6 border border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Policy</h3>
                  <p className="text-gray-600">Learn how we collect, use, and protect your personal information.</p>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Company Information</h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">AgroMarket Nigeria Limited</h3>
                <div className="space-y-2 text-gray-700">
                  <p><strong>Registration Number:</strong> RC-123456789</p>
                  <p><strong>Registered Address:</strong> Victoria Island, Lagos State, Nigeria</p>
                  <p><strong>Business Registration:</strong> Corporate Affairs Commission (CAC)</p>
                  <p><strong>Tax Identification Number:</strong> 12345678-0001</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Regulatory Compliance</h2>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Data Protection</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                <li>Nigeria Data Protection Regulation (NDPR) 2019</li>
                <li>General Data Protection Regulation (GDPR) compliance for EU users</li>
                <li>California Consumer Privacy Act (CCPA) compliance for US users</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Agricultural Regulations</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                <li>Federal Ministry of Agriculture and Rural Development compliance</li>
                <li>Standards Organisation of Nigeria (SON) product standards</li>
                <li>National Agency for Food and Drug Administration and Control (NAFDAC) for food products</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Financial Services</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Central Bank of Nigeria (CBN) payment services compliance</li>
                <li>Anti-Money Laundering (AML) and Counter-Terrorism Financing (CTF) regulations</li>
                <li>Know Your Customer (KYC) requirements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                AgroMarket and its associated logos, trademarks, and service marks are the property of AgroMarket Nigeria Limited. All content on this platform is protected by copyright and other intellectual property laws.
              </p>
              <p className="text-gray-700">
                Users retain ownership of content they create and post, but grant AgroMarket necessary licenses to operate the platform as outlined in our Terms of Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Internal Resolution</h3>
              <p className="text-gray-700 mb-4">
                We encourage users to first attempt to resolve disputes through direct communication. Our platform provides messaging tools to facilitate such discussions.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Mediation Services</h3>
              <p className="text-gray-700 mb-4">
                For unresolved disputes, we offer mediation services through qualified third-party mediators specializing in agricultural and commercial disputes.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-3">Legal Jurisdiction</h3>
              <p className="text-gray-700">
                All disputes arising from the use of AgroMarket services shall be subject to the jurisdiction of Nigerian courts, specifically the Federal High Court of Nigeria.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Accessibility</h2>
              <p className="text-gray-700 mb-4">
                AgroMarket is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards.
              </p>
              <p className="text-gray-700">
                If you encounter any accessibility barriers, please contact our support team at accessibility@agromarketng.com.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Cookie Policy</h2>
              <p className="text-gray-700 mb-4">
                Our website uses cookies and similar tracking technologies to enhance user experience, analyze site usage, and assist in marketing efforts. Users can manage cookie preferences through their browser settings.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800"><strong>Cookie Consent:</strong> By using our website, you consent to the use of cookies as described in our Privacy Policy.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Third-Party Services</h2>
              <p className="text-gray-700 mb-4">
                AgroMarket integrates with various third-party services to provide enhanced functionality:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Payment processors (Paystack, Flutterwave)</li>
                <li>SMS and email service providers</li>
                <li>Cloud storage and hosting services</li>
                <li>Analytics and marketing tools</li>
                <li>Map and location services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Legal Department</h2>
              <p className="text-gray-700 mb-4">
                For legal inquiries, compliance questions, or to report legal concerns:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Legal Department Email:</strong> legal@agromarketng.com</p>
                <p className="text-gray-700"><strong>Compliance Officer:</strong> compliance@agromarketng.com</p>
                <p className="text-gray-700"><strong>Address:</strong> Legal Department, AgroMarket Nigeria Limited</p>
                <p className="text-gray-700">Victoria Island, Lagos State, Nigeria</p>
                <p className="text-gray-700"><strong>Phone:</strong> +234 (0) 123 456 7890</p>
              </div>
            </section>

            <section className="border-t border-gray-200 pt-6">
              <p className="text-sm text-gray-500">
                <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This legal information page is regularly updated to reflect changes in laws, regulations, and company policies. Users are encouraged to review these documents periodically.
              </p>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}