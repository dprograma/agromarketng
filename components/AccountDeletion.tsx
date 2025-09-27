"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSession } from '@/components/SessionWrapper';

interface AccountDeletionProps {
  userName: string;
  userEmail: string;
}

export default function AccountDeletion({ userName, userEmail }: AccountDeletionProps) {
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ password?: string; confirmationText?: string }>({});

  const router = useRouter();
  const { setSession } = useSession();

  const validateForm = () => {
    const newErrors: { password?: string; confirmationText?: string } = {};

    if (!password.trim()) {
      newErrors.password = 'Password is required to delete your account';
    }

    if (!confirmationText.trim()) {
      newErrors.confirmationText = 'Confirmation text is required';
    } else if (confirmationText.toLowerCase().trim() !== 'delete my account') {
      newErrors.confirmationText = 'Please type "DELETE MY ACCOUNT" exactly as shown';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsDeleting(true);

      const response = await fetch('/api/user/profile/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: password.trim(),
          confirmationText: confirmationText.trim()
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete account');
      }

      // Clear session
      setSession(null);

      // Clear local storage and cookies
      localStorage.clear();
      sessionStorage.clear();

      toast.success('Your account has been permanently deleted');

      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push('/');
      }, 2000);

    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'password') {
      setPassword(value);
    } else if (field === 'confirmationText') {
      setConfirmationText(value);
    }

    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  if (!showDeleteForm) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-medium text-red-800 mb-2">Danger Zone</h4>
              <p className="text-sm text-red-700 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <Button
                onClick={() => setShowDeleteForm(true)}
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </Button>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>What will be deleted:</strong></p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>Your profile information and account settings</li>
            <li>All your advertisements and listings</li>
            <li>Transaction history and invoices</li>
            <li>Messages and conversations</li>
            <li>Support tickets and communications</li>
            <li>Saved searches and preferences</li>
            <li>All other data associated with your account</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-800 mb-2">⚠️ Permanently Delete Account</h4>
            <div className="text-sm text-red-700 space-y-2">
              <p>You are about to permanently delete your account: <strong>{userName}</strong> ({userEmail})</p>
              <p>This will immediately remove all your data and cannot be reversed. Please ensure you have:</p>
              <ul className="list-disc list-inside pl-4 space-y-1">
                <li>Downloaded any important data you want to keep</li>
                <li>Completed or cancelled any pending transactions</li>
                <li>Informed contacts of your account closure</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleDeleteAccount} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="delete-confirmation" className="text-sm font-medium text-gray-700">
            Type "DELETE MY ACCOUNT" to confirm:
          </label>
          <input
            id="delete-confirmation"
            type="text"
            value={confirmationText}
            onChange={(e) => handleInputChange('confirmationText', e.target.value)}
            className={cn(
              "w-full p-3 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all",
              errors.confirmationText ? "border-red-500" : "border-gray-300"
            )}
            placeholder="DELETE MY ACCOUNT"
            disabled={isDeleting}
          />
          {errors.confirmationText && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" /> {errors.confirmationText}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="delete-password" className="text-sm font-medium text-gray-700">
            Enter your password to confirm:
          </label>
          <div className="relative">
            <input
              id="delete-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={cn(
                "w-full p-3 pr-10 border rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all",
                errors.password ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Enter your current password"
              disabled={isDeleting}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              disabled={isDeleting}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" /> {errors.password}
            </p>
          )}
        </div>

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowDeleteForm(false);
              setPassword('');
              setConfirmationText('');
              setErrors({});
            }}
            disabled={isDeleting}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isDeleting || !password.trim() || confirmationText.toLowerCase().trim() !== 'delete my account'}
            variant="destructive"
            className="flex-1 bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting Account...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete My Account
              </>
            )}
          </Button>
        </div>

        <div className="text-xs text-red-600 bg-red-50 p-3 rounded border border-red-200">
          <strong>Final Warning:</strong> This action is permanent and irreversible. All your data will be immediately and permanently deleted from our systems.
        </div>
      </form>
    </div>
  );
}