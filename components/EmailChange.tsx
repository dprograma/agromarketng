"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Mail,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface EmailChangeProps {
  currentEmail: string;
  onEmailChanged: (newEmail: string) => void;
}

export default function EmailChange({ currentEmail, onEmailChanged }: EmailChangeProps) {
  const [showChangeForm, setShowChangeForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ newEmail?: string; password?: string }>({});

  const validateForm = () => {
    const newErrors: { newEmail?: string; password?: string } = {};

    if (!newEmail.trim()) {
      newErrors.newEmail = 'New email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      newErrors.newEmail = 'Please enter a valid email address';
    } else if (newEmail.toLowerCase() === currentEmail.toLowerCase()) {
      newErrors.newEmail = 'New email must be different from current email';
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required to verify email change';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/profile/email/change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newEmail: newEmail.trim(),
          password
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to request email change');
      }

      const data = await response.json();

      // Reset form
      setNewEmail('');
      setPassword('');
      setShowChangeForm(false);

      toast.success('Email change verification sent! Please check your new email address.');

      // In a real app, you might want to show the verification URL for testing
      if (data.verificationUrl) {
        console.log('Verification URL (for testing):', data.verificationUrl);
      }

    } catch (error) {
      console.error('Error requesting email change:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to request email change');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'newEmail') {
      setNewEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }

    // Clear error when user types
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  if (!showChangeForm) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-blue-800">Email Address</h4>
              <p className="text-sm text-blue-600">{currentEmail}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowChangeForm(true)}
            variant="outline"
            size="sm"
          >
            Change Email
          </Button>
        </div>

        <p className="text-sm text-gray-600">
          To change your email address, you'll need to verify the new email address and confirm with your password.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">Change Email Address</h4>
            <p className="text-sm text-yellow-700 mt-1">
              You'll receive a verification email at the new address. Your current email will remain active until you verify the new one.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleEmailChange} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="current-email" className="text-sm font-medium text-gray-700">
            Current Email
          </label>
          <input
            id="current-email"
            type="email"
            value={currentEmail}
            disabled
            className="w-full p-3 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="new-email" className="text-sm font-medium text-gray-700">
            New Email Address
          </label>
          <input
            id="new-email"
            type="email"
            value={newEmail}
            onChange={(e) => handleInputChange('newEmail', e.target.value)}
            className={cn(
              "w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all",
              errors.newEmail ? "border-red-500" : "border-gray-300"
            )}
            placeholder="Enter your new email address"
            disabled={isLoading}
          />
          {errors.newEmail && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" /> {errors.newEmail}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="verify-password" className="text-sm font-medium text-gray-700">
            Current Password
          </label>
          <div className="relative">
            <input
              id="verify-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className={cn(
                "w-full p-3 pr-10 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all",
                errors.password ? "border-red-500" : "border-gray-300"
              )}
              placeholder="Enter your current password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" /> {errors.password}
            </p>
          )}
        </div>

        <div className="flex space-x-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setShowChangeForm(false);
              setNewEmail('');
              setPassword('');
              setErrors({});
            }}
            disabled={isLoading}
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isLoading || !newEmail.trim() || !password.trim()}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending Verification...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Send Verification
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}