import { NextApiRequest } from "next";
import { ButtonHTMLAttributes } from "react";

export interface SignUpRequest {
  name: string;
  email: string;
  password: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  subscriptionPlan?: string;
}

export interface UserToken {
  id: string;
  email: string;
  name?: string;
};

export interface MulterRequest extends NextApiRequest {
  file?: Express.Multer.File;
}

export interface AlertProps {
  message: string;
  type?: string;
  duration?: number;
}

export interface Session {
  token?: string;
  id?: string;
  email?: string;
  name?: string;
  image?: string;
  role: 'user' | 'agent' | 'admin';
  isAgent?: boolean;
  agentId?: string;
  exp?: number;
  iat?: number;
}

export interface CardFooterProps {
  className?: string;
  children: React.ReactNode;
}

export interface DropdownMenuProps {
  children: React.ReactNode;
}

export interface DropdownMenuTriggerProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  asChild?: boolean;
  isOpen?: boolean;
}

export interface DropdownMenuContentProps {
  className?: string;
  children: React.ReactNode;
  isOpen?: boolean;
  align?: "left" | "right" | "center";
}

export interface DropdownMenuItemProps {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface TableProps {
  className?: string;
  children: React.ReactNode;
}

export interface TableRowProps {
  className?: string;
  children: React.ReactNode;
}

export interface TableCellProps {
  className?: string;
  children: React.ReactNode;
  isHeader?: boolean;
}

export interface TableHeadProps {
  className?: string;
  children: React.ReactNode;
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "outline" | "ghost" | "destructive";
}

export interface InputFieldProps {
  label: string;
  type?: "text" | "number";
  name: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
}

export interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}

export interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  maxFiles?: number;
  error?: string;
}

export interface AdMessage {
  id: number;
  sender: string;
  senderAvatar: string;
  adTitle: string;
  lastMessage: string;
  timestamp: string;
  isSpam: boolean;
}

export interface Ad {
  id: string;
  title: string;
  category: string;
  subcategory?: string;  // Added subcategory field
  section?: string;      // Added section field
  location: string;
  price: number;
  description: string;
  contact: string;
  images: string[];
  status: string;
  views: number;
  clicks: number;
  shares: number;
  featured: boolean;
  userId: string;
  user: User;
  boostType: number;
  boostStartDate: string;
  boostEndDate: string;
  boostStatus: string;
  subscriptionPlanId: string;
  subscriptionPlan: SubscriptionPlan;
  createdAt: Date;
  updatedAt: Date;
}

export interface DisableableDropdownMenuItemProps {
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}

export interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface DialogContentProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export type ChildProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

export interface BoostAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  ad: Ad;
  onBoost: (adId: string, boostType: number, duration: number) => Promise<void>;
}

export interface PaymentDetails {
  email: string;
  amount: number;
  reference: string;
  plan: string;
  planId?: string;
  type?: 'boost' | 'subscription';
  adId?: string;
  boostType?: number;
  boostDuration?: number;
}

export interface BoostOption {
  id: number;
  name: string;
  price: number;
  duration: number[];
  features: string[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  expiryDate: Date;
  benefits: string[];
  features: {
    listingPriority: number;
    featuredOnHome: boolean;
    adBoostDiscount: number;
    analyticsAccess: boolean;
    maxActiveBoosts: number;
  };
  listingPriority: number;
}

export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentDetails: PaymentDetails;
  onSuccess: (reference: string) => void;
}

export interface MyAdsResponse {
  ads: Ad[];
  subscription: SubscriptionPlan | null;
  maxFreeAds: number;
}

export interface PromotionsResponse {
  boosts: Promotion[];
  subscription: Promotion | null;
}

export interface Metrics {
  views: number;
  clicks: number;
}

export interface Promotion {
  type: 'boost' | 'subscription';
  id: string;
  title: string;
  startDate?: string;
  endDate: string;
  metrics?: Metrics;
  boostType?: number;
  features?: Record<string, any>;
  benefits?: string[];
}

export interface ActivePromotion {
  type: 'boost' | 'subscription';
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  views?: number;
  clicks?: number;
  boostType?: number;
  plan?: string;
}

export interface RouteContext {
  params: {
    id: string;
  };
}


export interface Suggestion {
  type: 'category' | 'item';
  name: string;
  href: string;
  category?: string;
  section?: string;
}

export interface SearchSuggestionsProps {
  searchTerm: string;
  onSelect: (suggestion: Suggestion) => void;
}

export interface ProductCardProps {
  product: Ad;
}

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  category: string;
  subCategory: string;
  location: string;
  sortBy: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  sender: {
    id: string;
    name: string;
    image: string;
  };
  createdAt: string;
}

export interface Chat {
  id: string;
  ad: {
    title: string;
    images: string[];
  };
  participants: {
    user: {
      id: string;
      name: string;
      image: string;
    };
    unreadCount: number;
  }[];
  messages: Message[];
  updatedAt: string;
}

export interface DialogTitleProps {
  children: React.ReactNode;
  className?: string;
}

export interface DialogTriggerProps {
  children: React.ReactNode;
  asChild?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  time?: string;
  createdAt: Date;
  updatedAt: Date;
}