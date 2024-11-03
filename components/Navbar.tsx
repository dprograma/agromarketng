"use client"

import { Fragment, useState } from 'react'
import { navigation } from '@/constants'
import Image from 'next/image';
import Link from 'next/link';
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
} from '@headlessui/react'
import logoImg from '../public/assets/img/agromarket-logo.png';
import { Bars3Icon, MagnifyingGlassIcon, ShoppingBagIcon, XMarkIcon } from '@heroicons/react/24/outline'

const Navbar = () => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <header className="relative bg-white">
        <nav aria-label="Top" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="h-6 w-6" />
              </button>

              {/* Logo */}
              <div className="ml-4 flex lg:ml-0">
                <Link href="/">
                  <span className="sr-only">Your Company</span>
                  <Image
                    alt="agromarket logo"
                    src={logoImg}
                    className="h-8 w-auto"
                  />
                </Link>
              </div>

              {/* Flyout menus */}
              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {/* Products Popover (Contains all categories and subcategories) */}
                  <Popover className="flex">
                    <div className="relative flex">
                      <PopoverButton className="relative z-10 -mb-px flex items-center border-b-2 border-transparent pt-px text-sm font-medium text-gray-700 hover:text-gray-800 focus:outline-none">
                        Products
                      </PopoverButton>
                    </div>

                    <PopoverPanel className="absolute inset-x-0 top-full text-sm text-gray-500">
                      <div className="relative bg-white z-50">
                        <div className="mx-auto max-w-7xl px-8">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-10 py-16">
                            {/* Loop through categories */}
                            {navigation.categories.map((category) => (
                              <div key={category.id} className="col-span-1">
                                <p className="font-medium text-gray-900">
                                  {category.name}
                                </p>
                                {category.sections.map((section) => (
                                  <div key={section.id} className="mt-4">
                                    <p className="font-medium text-gray-700">{section.name}</p>
                                    <ul className="mt-2 space-y-2">
                                      {section.items.map((item) => (
                                        <li key={item.name} className="text-gray-500 hover:text-gray-800">
                                          <a href={item.href}>{item.name}</a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </PopoverPanel>
                  </Popover>

                  {/* Other Navigation Pages */}
                  {navigation.pages.map((page) => (
                    <Link
                      key={page.name}
                      href={page.href}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      {page.name}
                    </Link>
                  ))}
                </div>
              </PopoverGroup>

              <div className="ml-auto flex items-center">
                <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                  <Link href="signin" className="text-sm font-medium text-gray-700 hover:text-gray-800">
                    Sign in
                  </Link>
                  <span aria-hidden="true" className="h-6 w-px bg-gray-200" />
                  <Link href="signup" className="text-sm font-medium text-gray-700 hover:text-gray-800">
                    Create account
                  </Link>
                </div>

                {/* Search */}
                <div className="flex lg:ml-6">
                  <Link href="#" className="p-2 text-gray-400 hover:text-gray-500">
                    <span className="sr-only">Search</span>
                    <MagnifyingGlassIcon aria-hidden="true" className="h-6 w-6" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}

export default Navbar;
