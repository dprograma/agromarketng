"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Image,
  LogOut,
  Loader2,
  User,
  Check,
  X,
  Eye,
  EyeOff,
  Upload,
  Camera,
  AlertCircle,
  Phone
} from "lucide-react";
import ImageCropper from "./ImageCropper";
import TwoFactorAuth from "./TwoFactorAuth";
import EmailChange from "./EmailChange";
import AccountDeletion from "./AccountDeletion";
import ActivityHistory from "./ActivityHistory";
import { cn } from "@/lib/utils";
import { userprofile } from "@/constants";
import React from "react";
import { useSession } from "@/components/SessionWrapper";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  image?: string | null;
  role: string;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt?: string;
}

interface FormErrors {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  image?: string;
}

export default function ProfileSettings() {
  const [activeTab, setActiveTab] = useState("personal");
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailForAdActivity: true,
    emailForPromotions: true,
    smsForPromotions: false,
    emailForMessages: true,
    emailForPayments: true,
  });
  const [isSavingPreferences, setIsSavingPreferences] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { session, setSession } = useSession();

  // Fetch user profile and notification preferences on component mount
  useEffect(() => {
    fetchUserProfile();
    fetchNotificationPreferences();
  }, []);

  // Update form data when profile is loaded
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: "", // Add phone field if available in your User model
      });
    }
  }, [profile]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/profile', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();
      setProfile(data.user);
      setTwoFactorEnabled(data.user.twoFactorEnabled || false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile information');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const response = await fetch('/api/user/profile/notification-preferences', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notification preferences');
      }

      const data = await response.json();
      setNotificationPreferences(data.preferences);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
      // Don't show toast error here as it's not critical
    }
  };

  const handleNotificationPreferenceChange = (key: string, value: boolean) => {
    setNotificationPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handle2FAStatusChange = (enabled: boolean) => {
    setTwoFactorEnabled(enabled);
    if (profile) {
      setProfile({ ...profile, twoFactorEnabled: enabled });
    }
  };

  const handleEmailChanged = (newEmail: string) => {
    if (profile) {
      setProfile({ ...profile, email: newEmail });
    }
    fetchUserProfile(); // Refresh profile to get updated data
  };

  const handleSaveNotificationPreferences = async () => {
    try {
      setIsSavingPreferences(true);

      const response = await fetch('/api/user/profile/notification-preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notificationPreferences),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update notification preferences');
      }

      const data = await response.json();
      setNotificationPreferences(data.preferences);
      toast.success('Notification preferences updated successfully');
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setIsSavingPreferences(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      setErrors(prev => ({
        ...prev,
        image: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
      }));
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        image: 'File size exceeds the 5MB limit'
      }));
      return;
    }

    // Clear previous error
    setErrors(prev => ({
      ...prev,
      image: undefined
    }));

    // Store file and show cropper instead of direct preview
    setSelectedImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
      setShowImageCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageFile: File) => {
    setSelectedImageFile(croppedImageFile);
    setShowImageCropper(false);

    // Create preview of cropped image
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewImage(e.target?.result as string);
    };
    reader.readAsDataURL(croppedImageFile);
  };

  const handleCropCancel = () => {
    setShowImageCropper(false);
    setSelectedImageFile(null);
    setPreviewImage(null);

    // Reset file input
    const fileInput = fileInputRef.current;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateProfileForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors: FormErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters long';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileForm()) return;

    try {
      setIsSaving(true);

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      setProfile(data.user);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswordForm()) return;

    try {
      setIsChangingPassword(true);

      const response = await fetch('/api/user/profile/password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update password');
      }

      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Error updating password:', error);

      if (error.message.includes('Current password is incorrect')) {
        setErrors(prev => ({
          ...prev,
          currentPassword: 'Current password is incorrect'
        }));
      } else {
        toast.error(error.message || 'Failed to update password');
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleImageUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedImageFile) {
      setErrors(prev => ({
        ...prev,
        image: 'Please select and crop an image to upload'
      }));
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append('image', selectedImageFile);

      const response = await fetch('/api/user/profile/image', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload image');
      }

      const data = await response.json();
      setProfile(data.user);
      setPreviewImage(null);
      setSelectedImageFile(null);

      // Reset file input
      const fileInput = fileInputRef.current;
      if (fileInput) {
        fileInput.value = '';
      }

      // Update session with new image
      if (session && data.user.image) {
        setSession({
          ...session,
          image: data.user.image
        });
      }

      toast.success('Profile picture updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      // Clear session from context
      setSession(null);

      // Clear all auth-related cookies
      const cookies = document.cookie.split(";");

      for (let cookie of cookies) {
        const cookieName = cookie.split("=")[0].trim();
        if (cookieName.includes("next-auth")) {
          document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${window.location.hostname}`;
          // Also try without domain for local development
          document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
        }
      }

      // Call the API to clear server-side session
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });

      toast.success("Logged out successfully");
      router.push('/signin');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-800 text-center">👤 Profile & Account Settings</h2>
      <p className="text-gray-600 text-center mt-2">Manage your personal information, security, and preferences.</p>

      {/* Tabs */}
      <div className="flex justify-center mt-6 border-b">
        {userprofile.map(({ key, label, icon }) => (
          <button
            key={key}
            className={cn(
              "px-6 py-2 text-sm font-medium border-b-2 transition flex items-center gap-2",
              activeTab === key
                ? "border-green-500 text-green-600"
                : "border-transparent text-gray-500 hover:text-green-500"
            )}
            onClick={() => setActiveTab(key)}
          >
            {React.createElement(icon, { className: "w-4 h-4" })} {label}
          </button>
        ))}
      </div>

      {/* Personal Information */}
      {activeTab === "personal" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <User className="w-5 h-5 mr-2" /> Personal Information
          </h3>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                <div className="relative">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 pl-10 transition-all",
                      errors.name ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Enter your full name"
                  />
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                </div>
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.name}
                  </p>
                )}
              </div>

              {/* Email Change Section */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <EmailChange
                  currentEmail={profile?.email || ""}
                  onEmailChanged={handleEmailChanged}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
                <div className="relative">
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 pl-10"
                    placeholder="Enter your phone number"
                  />
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className={cn(
                    "w-full py-3 rounded-md text-white font-medium transition-all flex items-center justify-center",
                    isSaving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>

              <div className="text-xs text-gray-500 mt-2">
                <p>Last updated: {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleString() : 'Never'}</p>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Profile Picture */}
      {activeTab === "avatar" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <Camera className="w-5 h-5 mr-2" /> Profile Picture
          </h3>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <form onSubmit={handleImageUpload} className="mt-4">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <div className="relative">
                    {previewImage || profile?.image ? (
                      <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-green-100">
                        <img
                          src={previewImage || profile?.image || ''}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-40 h-40 bg-gray-100 rounded-full flex items-center justify-center border-4 border-gray-50">
                        <User size={60} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="profile-image" className="block text-sm font-medium text-gray-700">
                      Upload New Image
                    </label>
                    <div className="relative">
                      <input
                        id="profile-image"
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
                      />
                    </div>
                    {errors.image && (
                      <p className="text-red-500 text-xs mt-1 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> {errors.image}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Accepted formats: JPEG, PNG, WebP, GIF. Maximum size: 5MB.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isUploading}
                    className={cn(
                      "w-full py-3 rounded-md text-white font-medium transition-all flex items-center justify-center",
                      isUploading
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Profile Picture
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Notification Preferences */}
      {activeTab === "notifications" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" /> Notification Preferences
          </h3>
          <p className="text-gray-600 mt-2 mb-4">Choose how you want to receive notifications about your account activity.</p>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email notifications for ad activity</label>
                    <p className="text-xs text-gray-500">Get notified when your ads are approved, viewed, or expire</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPreferences.emailForAdActivity}
                    onChange={(e) => handleNotificationPreferenceChange('emailForAdActivity', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email notifications for promotions</label>
                    <p className="text-xs text-gray-500">Receive promotional offers and marketing emails</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPreferences.emailForPromotions}
                    onChange={(e) => handleNotificationPreferenceChange('emailForPromotions', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">SMS notifications for promotions</label>
                    <p className="text-xs text-gray-500">Get promotional offers via text messages</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPreferences.smsForPromotions}
                    onChange={(e) => handleNotificationPreferenceChange('smsForPromotions', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email notifications for messages</label>
                    <p className="text-xs text-gray-500">Get notified when you receive new messages from buyers/sellers</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPreferences.emailForMessages}
                    onChange={(e) => handleNotificationPreferenceChange('emailForMessages', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Email notifications for payments</label>
                    <p className="text-xs text-gray-500">Get notified about payment confirmations, failures, and refunds</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPreferences.emailForPayments}
                    onChange={(e) => handleNotificationPreferenceChange('emailForPayments', e.target.checked)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </div>
              </div>

              <button
                onClick={handleSaveNotificationPreferences}
                disabled={isSavingPreferences}
                className={cn(
                  "w-full py-3 rounded-md text-white font-medium transition-all flex items-center justify-center",
                  isSavingPreferences
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                )}
              >
                {isSavingPreferences ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving Preferences...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Preferences
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Password & Security */}
      {activeTab === "security" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" /> Password & Security
          </h3>

          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            </div>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">Current Password</label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className={cn(
                      "w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10 transition-all",
                      errors.currentPassword ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Enter your current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.currentPassword}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="relative">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className={cn(
                      "w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10 transition-all",
                      errors.newPassword ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.newPassword}
                  </p>
                )}
                <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className={cn(
                      "w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 pr-10 transition-all",
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    )}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className={cn(
                    "w-full py-3 rounded-md text-white font-medium transition-all flex items-center justify-center",
                    isChangingPassword
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  )}
                >
                  {isChangingPassword ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Update Password
                    </>
                  )}
                </button>
              </div>

              {/* Two-Factor Authentication Section */}
              <div className="pt-6 mt-6 border-t">
                <TwoFactorAuth
                  isEnabled={twoFactorEnabled}
                  onStatusChange={handle2FAStatusChange}
                />
              </div>

              {/* Account Deletion Section */}
              <div className="pt-6 mt-6 border-t">
                <AccountDeletion
                  userName={profile?.name || ""}
                  userEmail={profile?.email || ""}
                />
              </div>

              <div className="pt-6 mt-6 border-t">
                <h4 className="text-md font-semibold text-gray-700 mb-3">Session Actions</h4>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="w-full bg-gray-600 text-white py-3 rounded-md hover:bg-gray-700 transition flex items-center justify-center"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Logging out...
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Activity History */}
      {activeTab === "activity" && (
        <div className="mt-6">
          <ActivityHistory />
        </div>
      )}

      {/* Logout Tab */}
      {activeTab === "logout" && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-700 flex items-center">
            <LogOut className="w-5 h-5 mr-2" /> Logout
          </h3>
          <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <LogOut className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-800">Sign Out from Your Account</h4>
                <p className="text-gray-600 mt-1">
                  You will be logged out from all devices and will need to sign in again to access your account.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-md flex items-start">
                <AlertCircle className="w-5 h-5 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  Any unsaved changes in other tabs will be lost when you log out.
                </p>
              </div>

              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition flex items-center justify-center"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Logging out...
                  </>
                ) : (
                  <>
                    <LogOut className="w-5 h-5 mr-2" />
                    Sign Out
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      {showImageCropper && previewImage && (
        <ImageCropper
          src={previewImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          isLoading={isUploading}
        />
      )}
    </div>
  );
}
