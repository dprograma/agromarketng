import React from 'react';
import { AdMessage } from "@/types";
import {
  Home, PlusCircle, BarChart, DollarSign, User, LogOut, Settings, CreditCard, Megaphone, FileText, Receipt, Wallet, AlertCircle, Image, Bell, Shield, Inbox, ShieldAlert, HelpCircle, Ticket, MessageCircle, BookmarkCheckIcon, UserPlus, Headset, LayoutDashboard,
  Users,
  MessageSquare,
  Menu,
  X,
  Wheat,
  Tractor,
  Beef,
  Sprout,
  Wrench,
} from "lucide-react";


export const navigation = {
  categories: [
    {
      id: 'farm-animals',
      name: 'Farm Animals',
      items: [
        { name: 'Cattle', href: '#' },
        { name: 'Goats', href: '#' },
        { name: 'Sheep', href: '#' },
        { name: 'Pigs', href: '#' },
        { name: 'Horses', href: '#' },
        { name: 'Rabbits', href: '#' },
        { name: 'Browse All', href: '#' },
      ],
    },
    {
      id: 'poultry',
      name: 'Poultry',
      items: [
        { name: 'Chickens', href: '#' },
        { name: 'Ducks', href: '#' },
        { name: 'Turkeys', href: '#' },
        { name: 'Geese', href: '#' },
        { name: 'Quails', href: '#' },
        { name: 'Pigeons', href: '#' },
        { name: 'Browse All', href: '#' },
      ],
    },
    {
      id: 'plants',
      name: 'Plants',
      items: [
        { name: 'Vegetables', href: '#' },
        { name: 'Fruits', href: '#' },
        { name: 'Herbs', href: '#' },
        { name: 'Legumes', href: '#' },
        { name: 'Tubers', href: '#' },
        { name: 'Spices', href: '#' },
        { name: 'Browse All', href: '#' },
      ],
    },
    {
      id: 'cereals',
      name: 'Cereals & Grains',
      items: [
        { name: 'Maize', href: '#' },
        { name: 'Rice', href: '#' },
        { name: 'Wheat', href: '#' },
        { name: 'Millet', href: '#' },
        { name: 'Sorghum', href: '#' },
        { name: 'Oats', href: '#' },
        { name: 'Browse All', href: '#' },
      ],
    },
    {
      id: 'machinery',
      name: 'Farm Machinery',
      items: [
        { name: 'Tractors', href: '#' },
        { name: 'Ploughs', href: '#' },
        { name: 'Harrows', href: '#' },
        { name: 'Seeders', href: '#' },
        { name: 'Harvesters', href: '#' },
        { name: 'Cultivators', href: '#' },
        { name: 'Browse All', href: '#' },
      ],
    },
    {
      id: 'tools',
      name: 'Tools',
      items: [
        { name: 'Hoes', href: '#' },
        { name: 'Spades', href: '#' },
        { name: 'Rakes', href: '#' },
        { name: 'Watering Cans', href: '#' },
        { name: 'Sickles', href: '#' },
        { name: 'Browse All', href: '#' },
      ],
    },
    {
      id: 'accessories',
      name: 'Farm Accessories',
      items: [
        { name: 'Fencing', href: '#' },
        { name: 'Feeders & Drinkers', href: '#' },
        { name: 'Storage Bins', href: '#' },
        { name: 'Greenhouses', href: '#' },
        { name: 'Irrigation Systems', href: '#' },
        { name: 'Fertilizer Dispensers', href: '#' },
        { name: 'Browse All', href: '#' },
      ],
    },
  ],
  pages: [
    // { name: 'About Us', href: '/about' },
    { name: 'Services', href: '/services' },
    { name: 'Products', href: '/products' },
    // { name: 'Success Stories', href: '/testimonials' },
    { name: 'News', href: '/news' },
    // { name: 'Contact Us', href: '/contact' },
  ],
};


export const activities = [
  { id: 1, description: "You posted a new ad: 'Fresh Organic Apples'", time: "2 hours ago" },
  { id: 2, description: "Started a promotion for 'Premium Cattle Feed'", time: "1 day ago" },
  { id: 3, description: "Boosted ad: 'Quality Farming Tools'", time: "3 days ago" },
];

export const NAV_ITEMS = [
  { name: "Dashboard", icon: Home, route: "/dashboard" },
  { name: "My Ads", icon: Megaphone, route: "/dashboard/my-ads" },
  { name: "Post New Ad", icon: PlusCircle, route: "/dashboard/new-ad" },
  { name: "Ad Promotions", icon: DollarSign, route: "/dashboard/promotions" },
  { name: "Analytics", icon: BarChart, route: "/dashboard/analytics" },
  { name: "Messages", icon: Inbox, route: "/dashboard/messages" },
  { name: "Saved Searches", icon: BookmarkCheckIcon, route: "/dashboard/saved-searches" },
  { name: "Notifications", icon: Bell, route: "/dashboard/notifications" },
  { name: "Agent Management", icon: UserPlus, route: "/admin/agents", adminOnly: true, },
];

export const SETTINGS = [
  { name: "Profile Settings", icon: User, route: "/dashboard/profile" },
  { name: "Payments & Billing", icon: CreditCard, route: "/dashboard/billing" },
  { name: "Support Center", icon: HelpCircle, route: "/dashboard/support" },
  { name: "Sign Out", icon: LogOut, action: "logout" },
];

export const adsData = [
  {
    id: 1,
    title: "Fresh Organic Tomatoes",
    price: "$15 per kg",
    status: "Active",
    views: 120,
    clicks: 30,
    shares: 5,
    engagement: 10,
  },
  {
    id: 2,
    title: "Premium Olive Oil",
    price: "$40 per bottle",
    status: "Pending",
    views: 85,
    clicks: 20,
    shares: 3,
    engagement: 8,
  },
  {
    id: 3,
    title: "Natural Honey 500ml",
    price: "$25 per jar",
    status: "Sold",
    views: 200,
    clicks: 50,
    shares: 12,
    engagement: 15,
  },
];

export const boostOptions = [
  {
    id: 1,
    name: "Homepage Feature",
    duration: [7, 14],
    price: {
      7: 1000,
      14: 2000
    },
    features: ["Featured on homepage", "Priority in search results"]
  },
  {
    id: 2,
    name: "Top of Category",
    duration: [7, 14],
    price: {
      7: 1000,
      14: 2000
    },
    features: ["Top position in category", "Category highlight"]
  },
  {
    id: 3,
    name: "Highlighted Listing",
    duration: [7, 14],
    price: {
      7: 1000,
      14: 2000
    },
    features: ["Visual highlight", "Search result priority"]
  }
];

export const FREE_USER_LIMITS = {
  maxFreeAds: 5,
  features: {
    listingPriority: 0,
    featuredOnHome: false,
    adBoostDiscount: 0,
    analyticsAccess: false,
    maxActiveBoosts: 0
  }
};

export const subscriptionPlans = [
  {
    id: 'silver',
    name: "Silver",
    price: 3000,
    duration: 30,
    benefits: [
      "Unlimited ad posts",
      "Featured on homepage",
      "Priority listing",
      "Analytics reports"
    ],
    features: {
      listingPriority: 1,
      featuredOnHome: true,
      adBoostDiscount: 0,
      analyticsAccess: true,
      maxActiveBoosts: -1
    }
  },
  {
    id: 'gold',
    name: "Gold",
    price: 4000,
    duration: 30,
    benefits: [
      "All Silver benefits",
      "Top of category",
      "Ad banners",
      "10% boost discount"
    ],
    features: {
      listingPriority: 2,
      featuredOnHome: true,
      topOfCategory: true,
      adBoostDiscount: 10,
      analyticsAccess: true,
      maxActiveBoosts: -1
    }
  },
  {
    id: 'platinum',
    name: "Platinum",
    price: 5000,
    duration: 30,
    benefits: [
      "All Gold benefits",
      "Exclusive placement",
      "Priority customer support",
      "20% boost discount"
    ],
    features: {
      listingPriority: 3,
      featuredOnHome: true,
      topOfCategory: true,
      exclusivePlacement: true,
      adBoostDiscount: 20,
      analyticsAccess: true,
      maxActiveBoosts: -1
    }
  }
];

// Dummy data
export const adPerformance = {
  impressions: 4500,
  clicks: 850,
  engagementRate: "18.9%",
};

export const demographics = {
  topLocations: [
    { country: "Nigeria", percentage: 40 },
    { country: "Kenya", percentage: 25 },
    { country: "Ghana", percentage: 20 },
    { country: "South Africa", percentage: 15 },
  ],
  ageGroups: [
    { group: "18-24", percentage: 35 },
    { group: "25-34", percentage: 40 },
    { group: "35-44", percentage: 15 },
    { group: "45+", percentage: 10 },
  ],
};

export const financialData = {
  totalSpent: 250,
  earnings: 750,
  profit: 500,
};

export const transactions = [
  { id: "#12345", date: "2024-01-20", amount: "$49.99", status: "Completed" },
  { id: "#12346", date: "2024-01-25", amount: "$19.99", status: "Pending" },
];

export const invoices = [
  { id: "#INV-001", date: "2024-01-15", amount: "$99.99", link: "#" },
  { id: "#INV-002", date: "2024-01-22", amount: "$49.99", link: "#" },
];

export const paymentMethods = [
  { type: "Visa", last4: "4242", expiry: "12/26" },
  { type: "PayPal", email: "user@example.com" },
];

export const billingTabs = [
  { key: "transactions", label: "Transactions", icon: Wallet },
  { key: "invoices", label: "Invoices", icon: FileText },
  { key: "methods", label: "Payment Methods", icon: CreditCard },
  { key: "disputes", label: "Disputes", icon: AlertCircle },
];

export const userprofile = [
  { key: "personal", label: "Personal Info", icon: User },
  { key: "avatar", label: "Profile Picture", icon: Image },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: Shield },
  { key: "logout", label: "Logout", icon: LogOut },
];


export const sampleMessages: AdMessage[] = [
  {
    id: 1,
    sender: "John Doe",
    senderAvatar: "https://randomuser.me/api/portraits/men/1.jpg",
    adTitle: "Fresh Organic Tomatoes",
    lastMessage: "Hi, is this still available?",
    timestamp: "2h ago",
    isSpam: false,
  },
  {
    id: 2,
    sender: "Alice Smith",
    senderAvatar: "https://randomuser.me/api/portraits/women/2.jpg",
    adTitle: "Premium Organic Fertilizer",
    lastMessage: "Can you offer bulk pricing?",
    timestamp: "5h ago",
    isSpam: false,
  },
  {
    id: 3,
    sender: "Spam User",
    senderAvatar: "https://randomuser.me/api/portraits/men/3.jpg",
    adTitle: "Cheap Loans Available",
    lastMessage: "Click here for fast loans!",
    timestamp: "1d ago",
    isSpam: true,
  },
];

export const MessagesTabs = [
  { key: "inbox", label: "Inbox", icon: Inbox },
  { key: "spam", label: "Spam/Blocked", icon: ShieldAlert },
]

export const faqData = [
  {
    question: "How do I post an ad?",
    answer: "Go to the 'Post Ad' section, fill in the details, and submit.",
  },
  {
    question: "How do I make payments for promotions?",
    answer: "Navigate to 'Payments & Billing' and add a payment method.",
  },
  {
    question: "How can I delete my account?",
    answer: "Contact support through the 'Support Tickets' section.",
  },
];

export const helpTabs = [
  { key: "faq", label: "FAQ", icon: HelpCircle },
  { key: "tickets", label: "Support Tickets", icon: Ticket },
  // { key: "live-chat", label: "Live Chat", icon: MessageCircle },
];


export const initialNotifications = [
  { id: 1, type: "ad", message: "🎉 Your ad 'Organic Tomatoes' has been approved!", time: "2h ago" },
  { id: 2, type: "promotion", message: "⏳ Your featured ad boost expires in 3 days!", time: "1d ago" },
  { id: 3, type: "payment", message: "✅ Payment for ad promotion was successful.", time: "2d ago" },
  { id: 4, type: "payment-failed", message: "⚠️ Your payment for 'Premium Listing' failed.", time: "3d ago" },
];

export const ADMIN_NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Manage Agents",
    href: "/admin/agents",
    icon: Users,
  },
  {
    title: "Chats",
    href: "/admin/chats",
    icon: MessageSquare,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];