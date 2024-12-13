"use client";

import Image from "next/image";
import { Container } from "@/components/Container";
import { Menu, MenuButton } from "@headlessui/react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import heroImg from "../public/assets/img/agromarket-hero1.png";

export const Hero = () => {
  return (
    <div className="relative bg-green-900">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src={heroImg}
          alt="Agro-market hero background"
          layout="fill"
          objectFit="cover"
          className="opacity-70"
        />
        <div className="absolute inset-0 bg-green-900/50"></div> {/* Overlay */}
      </div>

      {/* Main Content */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56 text-center">
          <Menu as="div" className="hidden sm:mb-8 sm:flex sm:justify-center">
            <MenuButton className="relative rounded-full px-3 py-1 text-sm leading-6 text-white ring-1 ring-white/50 hover:ring-white/70">
              Join our farmers’ community. <a href="signup" className="font-semibold text-yellow-400 ml-1">Sign up now<span className="ml-1" aria-hidden="true"><ChevronRightIcon className="h-4 w-4 inline" /></span></a>
            </MenuButton>
          </Menu>

          {/* Hero Heading */}
          <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Connecting Farmers to Markets
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-300">
            Discover fresh produce, trade directly with local farmers, and promote sustainable agriculture. Join the largest online agro-market today.
          </p>

          {/* Hero Buttons */}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Menu>
              <MenuButton className="rounded-md bg-yellow-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-500">
                Explore Products
              </MenuButton>
            </Menu>

            <a href="#" className="text-sm font-semibold leading-6 text-white">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero;
