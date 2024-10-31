import Link from "next/link";
import Image from "next/image";
import React from "react";
import logoImg from "../public/assets/img/agromarket-logo.png";
import { Container } from "./Container";
import { Twitter, Facebook, Instagram, Linkedin } from "./Icons"; 

const Footer = () => {
  const navigation = ["Product", "Features", "Pricing", "Company", "Blog"];
  const legal = ["Terms", "Privacy", "Legal"];

  return (
    <div className="relative bg-green-800 text-gray-200">
      <Container>
        <div className="grid grid-cols-1 gap-10 pt-10 pb-8 mx-auto border-t border-green-600 lg:grid-cols-5">
          
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
                    href="/"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item}
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
                    href="/"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="mb-3 font-semibold text-gray-300">Follow Us</h3>
            <div className="flex space-x-4 text-gray-300">
              <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer">
                <Twitter size={24} />
              </a>
              <a href="https://facebook.com/" target="_blank" rel="noopener noreferrer">
                <Facebook size={24} />
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer">
                <Instagram size={24} />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer">
                <Linkedin size={24} />
              </a>
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
