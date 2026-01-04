"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Twitter, Facebook, Instagram, Linkedin } from "./Icons";

const Footer = () => {
  const navigation = [
    { name: "Product", href: "/products" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Company", href: "/company" },
    { name: "Blog", href: "/blog" }
  ];
  const legal = ["Terms", "Privacy", "Legal"];

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Thank you for subscribing!' });
        setEmail('');
        setName('');
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to subscribe. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative bg-green-800 text-gray-200">
      <Container>
        <div className="grid grid-cols-1 gap-10 pt-10 pb-8 mx-auto border-t border-green-600 lg:grid-cols-6">

          {/* Logo and Description */}
          <div className="lg:col-span-2 ms-3">
            <Link href="/" className="flex items-center text-white text-2xl font-semibold">
              AgroMarket
            </Link>
            <p className="mt-4 text-sm text-gray-300">
              AgroMarket connects farmers, suppliers, and consumers, fostering sustainable farming and agricultural trade. Join us for fresh produce, tools, and resources tailored for growth.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-300">Explore</h3>
            <ul>
              {navigation.map((item, index) => (
                <li key={index} className="mb-1">
                  <Link
                    href={item.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-300">Legal</h3>
            <ul>
              {legal.map((item, index) => (
                <li key={index} className="mb-1">
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Subscription */}
          <div className="lg:col-span-2">
            <h3 className="mb-3 font-semibold text-gray-300">Stay Updated</h3>
            <p className="text-sm text-gray-300 mb-4">
              Subscribe to our newsletter for the latest agricultural insights and updates.
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-green-700 text-white placeholder-gray-300 border border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm bg-green-700 text-white placeholder-gray-300 border border-green-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-4 py-2 text-sm font-semibold text-green-900 bg-white rounded hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>

            {message && (
              <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-200' : 'text-red-300'}`}>
                {message.text}
              </p>
            )}

            {/* Social Media Links */}
            <div className="mt-6">
              <h4 className="mb-3 font-semibold text-gray-300">Follow Us</h4>
              <div className="flex space-x-4 text-gray-300">
                <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Twitter size={20} />
                </a>
                <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Facebook size={20} />
                </a>
                <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Instagram size={20} />
                </a>
                <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  <Linkedin size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="py-6 mt-4 text-center text-sm text-gray-400 border-t border-green-600">
          © {new Date().getFullYear()} AgroMarket. All Rights Reserved{" "}
          <a
            href="https://agromarketng.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white"
          >
            Agromarket Nigeria
          </a>.
        </div>
      </Container>
    </div>
  );
}

export default Footer;
