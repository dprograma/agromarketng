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
  password: string;
  createdAt: Date;
  updatedAt: Date;
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
  name?: string;
  email?: string;
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
  variant?: "default" | "outline" | "ghost"; 
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
}

export interface Message {
  id: number;
  sender: string;
  senderAvatar: string;
  adTitle: string;
  lastMessage: string;
  timestamp: string;
  isSpam: boolean;
}