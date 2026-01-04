import { NextRequest } from 'next/server';

interface LoginAttempt {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

// In-memory store for login rate limiting per IP
const loginAttempts = new Map<string, LoginAttempt>();

// Configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const BLOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export function checkLoginRateLimit(identifier: string): { allowed: boolean; remainingAttempts: number; message?: string } {
  const now = Date.now();

  // Clean up expired entries
  cleanupExpiredEntries(now);

  const attempt = loginAttempts.get(identifier);

  // Check if currently blocked
  if (attempt?.blockedUntil && now < attempt.blockedUntil) {
    const minutesRemaining = Math.ceil((attempt.blockedUntil - now) / 60000);
    return {
      allowed: false,
      remainingAttempts: 0,
      message: `Too many login attempts. Please try again in ${minutesRemaining} minutes.`
    };
  }

  // Reset if window expired or block period ended
  if (!attempt || now > attempt.resetTime || (attempt.blockedUntil && now >= attempt.blockedUntil)) {
    loginAttempts.set(identifier, {
      count: 0,
      resetTime: now + WINDOW_MS
    });
    return { allowed: true, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if limit exceeded
  if (attempt.count >= MAX_ATTEMPTS) {
    attempt.blockedUntil = now + BLOCK_DURATION_MS;
    loginAttempts.set(identifier, attempt);
    return {
      allowed: false,
      remainingAttempts: 0,
      message: `Too many login attempts. Account temporarily blocked for 30 minutes.`
    };
  }

  return { allowed: true, remainingAttempts: MAX_ATTEMPTS - attempt.count };
}

export function recordLoginAttempt(identifier: string, success: boolean): void {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (success) {
    // Clear on successful login
    loginAttempts.delete(identifier);
    return;
  }

  // Increment failed attempts
  if (!attempt || now > attempt.resetTime) {
    loginAttempts.set(identifier, {
      count: 1,
      resetTime: now + WINDOW_MS
    });
  } else {
    attempt.count++;
    loginAttempts.set(identifier, attempt);
  }
}

export function getClientIdentifier(req: NextRequest | Request): string {
  let headers: Headers;

  if (req instanceof NextRequest) {
    headers = req.headers;
  } else {
    headers = req.headers;
  }

  // Get IP address from various headers
  const forwarded = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const ip = forwarded ? forwarded.split(',')[0].trim() : realIp || 'unknown';

  return ip;
}

function cleanupExpiredEntries(now: number): void {
  for (const [key, value] of loginAttempts.entries()) {
    if (now > value.resetTime && (!value.blockedUntil || now > value.blockedUntil)) {
      loginAttempts.delete(key);
    }
  }
}
