import prisma from '@/lib/prisma';
import { NextRequest } from 'next/server';

interface ActivityData {
  userId: string;
  activity: string;
  description?: string;
  success?: boolean;
  metadata?: Record<string, any>;
}

interface DeviceInfo {
  browser?: string;
  os?: string;
  device?: string;
}

function parseUserAgent(userAgent: string): DeviceInfo {
  const info: DeviceInfo = {};

  // Parse browser
  if (userAgent.includes('Chrome')) {
    info.browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    info.browser = 'Firefox';
  } else if (userAgent.includes('Safari')) {
    info.browser = 'Safari';
  } else if (userAgent.includes('Edge')) {
    info.browser = 'Edge';
  }

  // Parse OS
  if (userAgent.includes('Windows')) {
    info.os = 'Windows';
  } else if (userAgent.includes('Mac')) {
    info.os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    info.os = 'Linux';
  } else if (userAgent.includes('Android')) {
    info.os = 'Android';
  } else if (userAgent.includes('iOS')) {
    info.os = 'iOS';
  }

  // Parse device type
  if (userAgent.includes('Mobile')) {
    info.device = 'Mobile';
  } else if (userAgent.includes('Tablet')) {
    info.device = 'Tablet';
  } else {
    info.device = 'Desktop';
  }

  return info;
}

function getClientIP(request: NextRequest): string | null {
  // Try multiple headers to get the real IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const clientIP = request.headers.get('x-client-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  if (clientIP) {
    return clientIP;
  }

  // Fallback to connection remote address (may not work in all environments)
  return null;
}

export async function logActivity(
  data: ActivityData,
  request?: NextRequest
): Promise<void> {
  try {
    const userAgent = request?.headers.get('user-agent') || '';
    const ipAddress = request ? getClientIP(request) : null;
    const deviceInfo = userAgent ? parseUserAgent(userAgent) : {};

    await prisma.activityLog.create({
      data: {
        userId: data.userId,
        activity: data.activity,
        description: data.description || null,
        ipAddress: ipAddress,
        userAgent: userAgent || null,
        deviceInfo: Object.keys(deviceInfo).length > 0 ? JSON.stringify(deviceInfo) : null,
        location: null, // Could be enhanced with geolocation service
        success: data.success !== undefined ? data.success : true,
        metadata: data.metadata || null
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw error to avoid breaking the main functionality
  }
}

// Predefined activity types
export const ActivityTypes = {
  // Authentication
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',

  // Profile changes
  PROFILE_UPDATE: 'profile_update',
  PASSWORD_CHANGE: 'password_change',
  EMAIL_CHANGE_REQUEST: 'email_change_request',
  EMAIL_CHANGE_VERIFIED: 'email_change_verified',
  AVATAR_UPDATE: 'avatar_update',

  // Security
  TWO_FA_ENABLED: '2fa_enabled',
  TWO_FA_DISABLED: '2fa_disabled',
  TWO_FA_BACKUP_CODES_GENERATED: '2fa_backup_codes_generated',

  // Account
  ACCOUNT_DELETED: 'account_deleted',

  // Settings
  NOTIFICATION_PREFERENCES_UPDATE: 'notification_preferences_update',

  // Other activities can be added here
} as const;

export type ActivityType = typeof ActivityTypes[keyof typeof ActivityTypes];