"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow">
        <div className="bg-green-900 text-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
            <p className="text-xl text-green-100">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                AgroMarket ("we", "us", or "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our agricultural marketplace platform.
              </p>
              <p className="text-gray-700">
                Please read this Privacy Policy carefully. By using our Service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">2.1 Personal Information</h3>
              <p className="text-gray-700 mb-4">We collect information you provide directly to us:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                <li>Name and contact information (email, phone number, address)</li>
                <li>Account credentials (username, password)</li>
                <li>Profile information (farm details, business information)</li>
                <li>Payment information (processed securely by third-party providers)</li>
                <li>Product listings and descriptions</li>
                <li>Communication and transaction history</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage information (pages visited, time spent, click patterns)</li>
                <li>Location information (with your consent)</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">2.3 Information from Third Parties</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Social media platforms (when you connect your accounts)</li>
                <li>Payment processors and financial institutions</li>
                <li>Agricultural data providers and market information services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Provide, operate, and maintain our marketplace platform</li>
                <li>Process transactions and manage user accounts</li>
                <li>Facilitate communication between buyers and sellers</li>
                <li>Send notifications about your account and transactions</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our services and develop new features</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Analyze usage patterns and market trends</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">4.1 With Other Users</h3>
              <p className="text-gray-700 mb-4">
                Your profile information and product listings are visible to other users to facilitate transactions. We encourage users to share only necessary information for business purposes.
              </p>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">4.2 With Service Providers</h3>
              <p className="text-gray-700 mb-4">We may share your information with trusted third parties who help us operate our platform:</p>
              <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-1">
                <li>Payment processors and financial service providers</li>
                <li>Cloud storage and hosting providers</li>
                <li>Analytics and marketing service providers</li>
                <li>Customer support and communication tools</li>
              </ul>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">4.3 Legal Requirements</h3>
              <p className="text-gray-700 mb-4">We may disclose your information when required by law or to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Comply with legal processes or government requests</li>
                <li>Protect our rights, property, or safety</li>
                <li>Investigate and prevent fraud or security issues</li>
                <li>Enforce our terms of service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-1">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication procedures</li>
                <li>Employee training on data protection</li>
                <li>Incident response and breach notification procedures</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights and Choices</h2>
              <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">6.1 Access and Portability</h3>
              <p className="text-gray-700 mb-2">You can access and download your personal data from your account settings.</p>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">6.2 Correction and Updates</h3>
              <p className="text-gray-700 mb-2">You can update your information directly through your account or by contacting us.</p>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">6.3 Deletion</h3>
              <p className="text-gray-700 mb-2">You can request deletion of your account and associated data, subject to legal retention requirements.</p>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">6.4 Marketing Communications</h3>
              <p className="text-gray-700">You can opt out of marketing emails by clicking the unsubscribe link or updating your preferences.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Cookies and Tracking Technologies</h2>
              <p className="text-gray-700 mb-4">
                We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can control cookie preferences through your browser settings.
              </p>
              <p className="text-gray-700">
                Essential cookies are necessary for platform functionality, while optional cookies help us improve our services and provide relevant content.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your information during such transfers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Data Retention</h2>
              <p className="text-gray-700 mb-4">
                We retain your personal information for as long as necessary to provide our services, comply with legal obligations, resolve disputes, and enforce our agreements. Specific retention periods depend on the type of information and applicable legal requirements.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
              <p className="text-gray-700 mb-4">
                Our Service is not intended for children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will take steps to delete the information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Updates to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of significant changes through our platform or via email.
              </p>
              <p className="text-gray-700">
                Your continued use of our Service after any changes indicates your acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> privacy@agromarketng.com</p>
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