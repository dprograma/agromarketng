"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Shield,
  Loader2,
  Check,
  X,
  Copy,
  Eye,
  EyeOff,
  AlertCircle,
  Smartphone,
  Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface TwoFactorAuthProps {
  isEnabled: boolean;
  onStatusChange: (enabled: boolean) => void;
}

interface SetupData {
  secret: string;
  qrCode: string;
  manualEntryKey: string;
}

export default function TwoFactorAuth({ isEnabled, onStatusChange }: TwoFactorAuthProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState<SetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);

  const handleEnable2FA = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/user/profile/2fa/setup', {
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to setup 2FA');
      }

      const data = await response.json();
      setSetupData(data);
      setShowSetup(true);
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast.error('Failed to setup 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndEnable = async () => {
    if (!setupData || !verificationCode) {
      toast.error('Please enter the verification code');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/profile/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: setupData.secret,
          token: verificationCode
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Invalid verification code');
      }

      const data = await response.json();
      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      setShowSetup(false);
      setVerificationCode('');
      onStatusChange(true);
      toast.success('2FA enabled successfully! Please save your backup codes.');
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to enable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!disablePassword) {
      toast.error('Please enter your password');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/user/profile/2fa/disable', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: disablePassword
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disable 2FA');
      }

      setShowDisableConfirm(false);
      setDisablePassword('');
      onStatusChange(false);
      toast.success('2FA disabled successfully');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to disable 2FA');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const downloadBackupCodes = () => {
    const content = `AgroMarket NG - Two-Factor Authentication Backup Codes\n\nGenerated: ${new Date().toLocaleString()}\n\nBackup Codes (use each only once):\n${backupCodes.map(code => `• ${code}`).join('\n')}\n\nKeep these codes in a safe place. Each code can only be used once.\nIf you lose access to your authenticator app, you can use these codes to sign in.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agromarket-2fa-backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Backup codes downloaded');
  };

  if (!isEnabled && !showSetup && !showBackupCodes) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-yellow-600" />
            <div>
              <h4 className="font-medium text-yellow-800">Two-Factor Authentication</h4>
              <p className="text-sm text-yellow-600">Add an extra layer of security to your account</p>
            </div>
          </div>
          <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
            Disabled
          </span>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Two-factor authentication (2FA) adds an extra layer of security to your account by requiring a verification code from your mobile device in addition to your password.
          </p>

          <div className="bg-blue-50 p-3 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">How it works:</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Install an authenticator app (Google Authenticator, Authy, etc.)</li>
              <li>• Scan the QR code or enter the setup key</li>
              <li>• Enter the verification code to complete setup</li>
              <li>• You'll need this code every time you sign in</li>
            </ul>
          </div>

          <Button
            onClick={handleEnable2FA}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Setting up 2FA...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Enable Two-Factor Authentication
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  if (isEnabled && !showDisableConfirm && !showBackupCodes) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-green-600" />
            <div>
              <h4 className="font-medium text-green-800">Two-Factor Authentication</h4>
              <p className="text-sm text-green-600">Your account is protected with 2FA</p>
            </div>
          </div>
          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">
            Enabled
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-green-700">
            <Check className="w-4 h-4" />
            <span className="text-sm">2FA is active and protecting your account</span>
          </div>

          <Button
            onClick={() => setShowDisableConfirm(true)}
            variant="destructive"
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Disable Two-Factor Authentication
          </Button>
        </div>
      </div>
    );
  }

  if (showSetup && setupData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h4 className="text-lg font-semibold text-gray-800 mb-2">Setup Two-Factor Authentication</h4>
          <p className="text-sm text-gray-600">Scan the QR code with your authenticator app</p>
        </div>

        <div className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center p-4 bg-white border rounded-lg">
            <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
          </div>

          {/* Manual Entry */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Can't scan? Enter this key manually:
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={setupData.manualEntryKey}
                readOnly
                className="flex-1 p-2 text-sm bg-gray-50 border border-gray-300 rounded"
              />
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard(setupData.manualEntryKey, 'Setup key')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Verification */}
          <div className="space-y-2">
            <label htmlFor="verification-code" className="text-sm font-medium text-gray-700">
              Enter verification code from your app:
            </label>
            <input
              id="verification-code"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full p-3 text-center text-lg border border-gray-300 rounded font-mono"
              maxLength={6}
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowSetup(false);
                setSetupData(null);
                setVerificationCode('');
              }}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleVerifyAndEnable}
              disabled={verificationCode.length !== 6 || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Enable 2FA
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showDisableConfirm) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-red-800">Disable Two-Factor Authentication</h4>
              <p className="text-sm text-red-700 mt-1">
                This will remove the extra security layer from your account. Enter your password to confirm.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="space-y-2">
            <label htmlFor="disable-password" className="text-sm font-medium text-gray-700">
              Current Password
            </label>
            <div className="relative">
              <input
                id="disable-password"
                type={showPassword ? "text" : "password"}
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                className="w-full p-3 pr-10 border border-gray-300 rounded"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowDisableConfirm(false);
                setDisablePassword('');
              }}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDisable2FA}
              disabled={!disablePassword || isLoading}
              variant="destructive"
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Disabling...
                </>
              ) : (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Disable 2FA
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showBackupCodes && backupCodes.length > 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Check className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <h4 className="text-lg font-semibold text-gray-800 mb-2">2FA Enabled Successfully!</h4>
          <p className="text-sm text-gray-600">Save these backup codes in a safe place</p>
        </div>

        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-medium text-yellow-800">Important: Save Your Backup Codes</h5>
              <p className="text-sm text-yellow-700 mt-1">
                These codes can be used to access your account if you lose your authenticator device. Each code can only be used once.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="font-medium text-gray-800">Your Backup Codes:</h5>
          <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50 border rounded-lg font-mono text-sm">
            {backupCodes.map((code, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-white border rounded">
                <span>{code}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(code, 'Backup code')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={downloadBackupCodes}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download Codes
          </Button>
          <Button
            onClick={() => setShowBackupCodes(false)}
            className="flex-1"
          >
            <Check className="w-4 h-4 mr-2" />
            I've Saved My Codes
          </Button>
        </div>
      </div>
    );
  }

  return null;
}