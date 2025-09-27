"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        <div className="bg-green-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-green-100">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                Welcome to AgroMarket. These Terms of Service ("Terms") govern your use of our website, mobile application, and services (collectively, the "Service") operated by AgroMarket ("us", "we", or "our").
              </p>
              <p className="text-gray-700">
                By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Use of the Service</h2>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Permitted Use</h3>
              <p className="text-gray-700 mb-4">
                You may use our Service for lawful purposes only. You agree to use the Service in accordance with all applicable laws, regulations, and these Terms.
              </p>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 Prohibited Activities</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Posting false, misleading, or fraudulent product listings</li>
                <li>Engaging in any form of harassment or abusive behavior</li>
                <li>Violating intellectual property rights</li>
                <li>Attempting to gain unauthorized access to our systems</li>
                <li>Distributing malware or harmful software</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
              <p className="text-gray-700 mb-4">
                When you create an account with us, you must provide information that is accurate, complete, and current at all times. You are responsible for safeguarding the password and for all activities that occur under your account.
              </p>
              <p className="text-gray-700">
                You agree to immediately notify us of any unauthorized uses of your account or any other breaches of security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Product Listings and Transactions</h2>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1 Seller Responsibilities</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                <li>Provide accurate product descriptions and images</li>
                <li>Honor listed prices and availability</li>
                <li>Comply with all applicable food safety and agricultural regulations</li>
                <li>Deliver products as agreed with buyers</li>
              </ul>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">4.2 Buyer Responsibilities</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Make payments as agreed with sellers</li>
                <li>Communicate clearly about requirements and delivery</li>
                <li>Inspect products upon delivery and report issues promptly</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Payment Terms</h2>
              <p className="text-gray-700 mb-4">
                AgroMarket facilitates transactions between buyers and sellers but is not directly involved in payment processing unless otherwise specified. Payment methods, terms, and dispute resolution are primarily handled between transacting parties.
              </p>
              <p className="text-gray-700">
                For our premium services, subscription fees are billed in advance and are non-refundable except as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Content and Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                Our Service and its original content, features, and functionality are and will remain the exclusive property of AgroMarket and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>
              <p className="text-gray-700">
                You retain rights to any content you submit, post, or display on or through the Service. By posting content, you grant us a non-exclusive, royalty-free license to use, distribute, and display such content on our Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Privacy Policy</h2>
              <p className="text-gray-700">
                Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                In no event shall AgroMarket, its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the Service.
              </p>
              <p className="text-gray-700">
                Our total liability to you for any damages shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                We encourage users to resolve disputes directly with each other. However, if you have a dispute with AgroMarket, you agree to first contact us to attempt to resolve the dispute informally.
              </p>
              <p className="text-gray-700">
                Any legal disputes arising out of or related to these Terms or the Service shall be subject to the exclusive jurisdiction of the courts of Nigeria.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Termination</h2>
              <p className="text-gray-700 mb-4">
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
              </p>
              <p className="text-gray-700">
                If you wish to terminate your account, you may simply discontinue using the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect.
              </p>
              <p className="text-gray-700">
                What constitutes a material change will be determined at our sole discretion. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> legal@agromarketng.com</p>
                <p className="text-gray-700"><strong>Address:</strong> Lagos, Nigeria</p>
                <p className="text-gray-700"><strong>Phone:</strong> +234 (0) 123 456 7890</p>
              </div>
            </section>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}