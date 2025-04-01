"use client";

import React, { useEffect, useState } from "react";
import { navigation } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/components/SessionWrapper";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
} from "@headlessui/react";
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  XMarkIcon,
  UserCircleIcon,
  Squares2X2Icon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { ChevronRight } from "lucide-react";
import { Disclosure } from "@headlessui/react";
import Spinner from "@/components/Spinner";
import logoImg from "../public/assets/img/agromarket-logo.png";
import fallbackImg from "../public/assets/img/fallback.jpg";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { session, setSession } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const CategoryPanel = ({
    category,
    isActive,
    onSelect
  }: {
    category: any;
    isActive: boolean;
    onSelect: () => void;
  }) => (
    <div className="p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
      <button
        onClick={onSelect}
        className="w-full flex items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-gray-900">{category.name}</span>
        <ChevronRight className={cn(
          "w-4 h-4 text-gray-500 transition-transform",
          isActive && "rotate-90"
        )} />
      </button>
      {isActive && (
        <div className="mt-2 pl-4">
          {category.sections.map((section: any) => (
            <div key={section.id} className="mb-3">
              <p className="text-sm font-medium text-gray-700 mb-1">
                {section.name}
              </p>
              <ul className="space-y-1">
                {section.items.map((item: any) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-gray-900 block py-1"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      // Clear session
      setSession(null);
      // Remove cookie
      document.cookie = 'next-auth.session-token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };


  return (
    <>
      <header className="relative bg-white shadow">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center justify-between">
              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden rounded-md bg-white p-2 text-gray-400"
              >
                <span className="sr-only">Open menu</span>
                <Bars3Icon className="h-6 w-6" />
              </button>

              {/* Logo */}
              <div className="flex-shrink-0">
                <Link href="/">
                  <Image alt="Agromarket Logo" src={logoImg} className="h-8 w-auto" />
                </Link>
              </div>

              {/* Desktop Navigation */}
              <PopoverGroup className="hidden lg:flex lg:space-x-8">
                {/* Modern Products Dropdown */}
                <Popover className="relative">
                  <PopoverButton className="text-sm font-medium text-gray-700 hover:text-gray-800">
                    Products
                  </PopoverButton>
                  <PopoverPanel className="absolute left-0 z-50 mt-2 w-screen max-w-xs transform px-2 sm:px-0 lg:max-w-lg">
                    <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                      <div className="relative bg-white">
                        {/* Desktop View */}
                        <div className="hidden lg:block max-h-[80vh] overflow-y-auto">
                          <div className="p-4">
                            {navigation.categories.map((category) => (
                              <CategoryPanel
                                key={category.id}
                                category={category}
                                isActive={activeCategory === category.id}
                                onSelect={() => setActiveCategory(
                                  activeCategory === category.id ? null : category.id
                                )}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Mobile View */}
                        <div className="lg:hidden">
                          {navigation.categories.map((category) => (
                            <Disclosure key={category.id}>
                              {({ open }) => (
                                <div className="py-2">
                                  <Disclosure.Button className="flex w-full items-center justify-between text-gray-900 py-2">
                                    <span className="text-sm font-medium">{category.name}</span>
                                    <ChevronRight
                                      className={cn(
                                        "w-4 h-4 text-gray-500 transition-transform",
                                        open && "rotate-90"
                                      )}
                                    />
                                  </Disclosure.Button>

                                  <Disclosure.Panel className="mt-2 pl-4 space-y-2">
                                    {category.sections.map((section) => (
                                      <div key={section.id}>
                                        <p className="text-sm font-medium text-gray-700">
                                          {section.name}
                                        </p>
                                        <ul className="mt-1 space-y-1">
                                          {section.items.map((item) => (
                                            <li key={item.name}>
                                              <Link
                                                href={item.href}
                                                className="text-sm text-gray-600 hover:text-gray-900 block py-1"
                                              >
                                                {item.name}
                                              </Link>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    ))}
                                  </Disclosure.Panel>
                                </div>
                              )}
                            </Disclosure>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PopoverPanel>
                </Popover>

                {/* Other Pages */}
                {navigation.pages.map((page) => (
                  <Link key={page.name} href={page.href} className="text-sm font-medium text-gray-700 hover:text-gray-800">
                    {page.name}
                  </Link>
                ))}
              </PopoverGroup>

              {/* Search Icon */}
              <div className="hidden lg:flex lg:items-center lg:space-x-4">
                <Link href="/search" className="p-2 text-gray-400 hover:text-gray-500 group">
                  <div className="flex items-center space-x-2">
                    <MagnifyingGlassIcon className="h-6 w-6" />
                    <span className="text-sm text-gray-500 group-hover:text-gray-700">Search</span>
                  </div>
                </Link>

                {/* Authentication UI */}
                {session ? (
                  <Menu as="div" className="relative z-50">
                    <MenuButton className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-800 z-50">
                      <Image src={fallbackImg} alt="User Avatar" width={32} height={32} className="rounded-full" />
                    </MenuButton>
                    <MenuItems className="absolute right-0 mt-2 w-48 bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                      <MenuItem>
                        {({ active }) => (
                          <Link href="/dashboard" className={`flex px-4 py-2 text-sm text-gray-500 ${active ? "bg-gray-100" : ""}`}>
                            <Squares2X2Icon className="h-5 w-5 mr-2" />
                            Dashboard
                          </Link>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <Link
                            href="/dashboard/profile"
                            className={`flex px-4 py-2 text-sm text-gray-500 ${active ? "bg-gray-100" : ""
                              }`}
                          >
                            <UserCircleIcon className="h-5 w-5 mr-2" />
                            Profile
                          </Link>
                        )}
                      </MenuItem>
                      <MenuItem>
                        {({ active }) => (
                          <button onClick={handleLogout} className={`flex w-full px-4 py-2 text-sm text-gray-500 ${active ? "bg-gray-100" : ""}`}>
                            <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                            {isLoggingOut ? (<Spinner />) : "Logout"}
                          </button>
                        )}
                      </MenuItem>
                    </MenuItems>
                  </Menu>
                ) : (
                  <div className="flex space-x-4">
                    <Link href="/signin" className="text-sm font-medium text-gray-700 hover:text-gray-800">
                      Sign in
                    </Link>
                    <Link href="/signup" className="text-sm font-medium text-gray-700 hover:text-gray-800">
                      Create account
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </div>
        </nav>
        {/* Mobile Menu */}
        <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen}>
          <DialogPanel className="fixed inset-0 z-50 bg-white flex flex-col">
            {/* Header - Fixed at top */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <Image src={logoImg} alt="Logo" className="h-8 w-auto" />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <XMarkIcon className="h-6 w-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Mobile Products Dropdown */}
                <div>
                  <button className="text-sm font-medium text-gray-700 hover:text-gray-800 w-full text-left flex items-center justify-between">
                    Products
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                  </button>
                  <div className="mt-2 pl-4">
                    {navigation.categories.map((category) => (
                      <Disclosure key={category.id}>
                        {({ open }) => (
                          <div className="py-2">
                            <Disclosure.Button className="flex w-full items-center justify-between text-gray-900 py-2">
                              <span className="text-sm font-medium">{category.name}</span>
                              <ChevronRight
                                className={cn(
                                  "w-4 h-4 text-gray-500 transition-transform",
                                  open && "rotate-90"
                                )}
                              />
                            </Disclosure.Button>

                            <Disclosure.Panel className="ml-4">
                              {category.sections.map((section) => (
                                <div key={section.id} className="py-2">
                                  <p className="text-sm font-medium text-gray-700 mb-1">
                                    {section.name}
                                  </p>
                                  <ul className="space-y-1 ml-4">
                                    {section.items.map((item) => (
                                      <li key={`${section.id}-${item.name}`}>
                                        <Link
                                          href={item.href}
                                          className="text-sm text-gray-600 hover:text-gray-900 block py-1"
                                          onClick={() => setMobileMenuOpen(false)}
                                        >
                                          {item.name}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </Disclosure.Panel>
                          </div>
                        )}
                      </Disclosure>
                    ))}
                  </div>
                </div>

                {/* Other Navigation Items */}
                <div className="border-t border-gray-200 pt-4">
                  {navigation.pages.map((page) => (
                    <Link
                      key={page.name}
                      href={page.href}
                      className="block py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200">
              {session ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Image src={fallbackImg} alt="User Avatar" width={32} height={32} className="rounded-full" />
                    <span className="text-sm font-medium text-gray-900">
                      {session.email}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    {isLoggingOut ? <Spinner /> : "Logout"}
                  </button>
                </div>
              ) : (
                <div className="flex justify-between">
                  <Link
                    href="/signin"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </DialogPanel>
        </Dialog>
      </header>
    </>
  );
};

export default Navbar;

