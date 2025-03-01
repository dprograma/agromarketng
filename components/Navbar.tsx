"use client";

import React, { useState } from "react";
import { navigation } from "@/constants";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "@/components/SessionWrapper";
import { Session } from "@/types";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
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
import logoImg from "../public/assets/img/agromarket-logo.png";
import fallbackImg from "../public/assets/img/fallback.jpg";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const session = useSession() as Session | null;
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
    router.refresh();
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
                  <PopoverPanel className="absolute left-0 z-50 mt-2 w-[500px] bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-4">
                    <div className="grid grid-cols-2 gap-4">
                      {navigation.categories.map((category) => (
                        <div key={category.id}>
                          <p className="font-medium text-gray-900 border-b pb-1">{category.name}</p>
                          <ul className="mt-2 space-y-2">
                            {category.sections.map((section) => (
                              <li key={section.id}>
                                <p className="text-gray-700 font-medium">{section.name}</p>
                                <ul className="ml-4 mt-1 space-y-1">
                                  {section.items.map((item) => (
                                    <li key={item.name}>
                                      <Link href={item.href} className="text-gray-500 hover:text-gray-800">
                                        {item.name}
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
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
                <Link href="#" className="p-2 text-gray-400 hover:text-gray-500">
                  <MagnifyingGlassIcon className="h-6 w-6" />
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
                            Logout
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
          <DialogPanel className="fixed inset-0 z-50 bg-white p-4">
            <div className="flex justify-between items-center">
              <Image src={logoImg} alt="Logo" className="h-8 w-auto" />
              <button onClick={() => setMobileMenuOpen(false)}>
                <XMarkIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {/* Mobile Products Dropdown */}
              <div>
                <button className="text-sm font-medium text-gray-700 hover:text-gray-800 w-full text-left">
                  Products
                </button>
                <div className="mt-2 pl-4">
                  {navigation.categories.map((category) => (
                    <div key={category.id} className="mb-2">
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <ul className="ml-4 space-y-1">
                        {category.sections.flatMap((section) =>
                          section.items.map((item) => (
                            <li key={item.name}>
                              <Link href={item.href} className="text-gray-500 hover:text-gray-800">
                                {item.name}
                              </Link>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogPanel>
        </Dialog>
      </header>
    </>
  );
};

export default Navbar;

