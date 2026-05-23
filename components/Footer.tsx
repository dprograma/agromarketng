"use client";

import React from "react";
import Link from "next/link";
import { Container } from "./Container";
import { Facebook, Instagram, Linkedin } from "./Icons";

const Footer = () => {
  const navigation = [
    { name: "Product", href: "/products" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Company", href: "/company" },
    { name: "Blog", href: "/blog" }
  ];
  const legal = ["Terms", "Privacy", "Legal"];

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

          {/* Get in Touch */}
          <div className="lg:col-span-2">
            <h3 className="mb-3 font-semibold text-gray-300">Get in Touch</h3>

            <div className="space-y-3">
              {/* Email */}
              <a
                href="mailto:info@agromarketng.com"
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Email us</span>
                  info@agromarketng.com
                </div>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/2348160093332"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs text-gray-400">WhatsApp</span>
                  +234 816 009 3332
                </div>
              </a>

              {/* Phone */}
              <a
                href="tel:+2348160093332"
                className="flex items-center gap-3 text-sm text-gray-300 hover:text-white transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center group-hover:bg-green-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <span className="block text-xs text-gray-400">Call us</span>
                  +234 816 009 3332
                </div>
              </a>
            </div>

            {/* Social Media Links */}
            <div className="mt-6">
              <h4 className="mb-3 font-semibold text-gray-300">Follow Us</h4>
              <div className="flex space-x-3 text-gray-300">
                <a href="https://facebook.com/AgromarketNigeria" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors">
                  <Facebook size={18} />
                </a>
                <a href="https://instagram.com/agromarketngr" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors">
                  <Instagram size={18} />
                </a>
                <a href="https://linkedin.com/company/Agromarketngr" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-green-700 flex items-center justify-center hover:bg-green-600 hover:text-white transition-colors">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="py-6 mt-4 text-center text-sm text-gray-400 border-t border-green-600">
          &copy; {new Date().getFullYear()} AgroMarket. All Rights Reserved{" "}
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
