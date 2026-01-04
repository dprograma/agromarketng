import { NextRequest } from 'next/server';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum number of requests per window
}

// In-memory store for rate limiting (use Redis in production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(options: RateLimitOptions) {
  return (req: NextRequest): { success: boolean; remaining: number; resetTime: number } => {
    const clientId = getClientId(req);
    const now = Date.now();

    // Clean up expired entries
    cleanupExpiredEntries(now);

    const record = requestCounts.get(clientId);

    if (!record || now > record.resetTime) {
      // First request in window or window expired
      const resetTime = now + options.windowMs;
      requestCounts.set(clientId, { count: 1, resetTime });
      return { success: true, remaining: options.maxRequests - 1, resetTime };
    }

    if (record.count >= options.maxRequests) {
      // Rate limit exceeded
      return { success: false, remaining: 0, resetTime: record.resetTime };
    }

    // Increment count
    record.count++;
    requestCounts.set(clientId, record);

    return { success: true, remaining: options.maxRequests - record.count, resetTime: record.resetTime };
  };
}

function getClientId(req: NextRequest): string {
  // Use multiple identifiers for better accuracy
  const forwarded = req.headers.get('x-forwarded-for');
  const realIp = req.headers.get('x-real-ip');
  const cfConnectingIp = req.headers.get('cf-connecting-ip'); // Cloudflare
  const userAgent = req.headers.get('user-agent') || '';

  // Get the most reliable IP address
  const ip = cfConnectingIp || realIp || (forwarded ? forwarded.split(',')[0].trim() : 'unknown');

  // Create a composite identifier (IP + partial user agent hash for better uniqueness)
  // This helps prevent bypassing rate limits by changing user agents while keeping same IP
  const userAgentHash = userAgent.substring(0, 50); // First 50 chars to avoid too much specificity

  return `${ip}:${hashString(userAgentHash)}`;
}

// Simple hash function for user agent
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

function cleanupExpiredEntries(now: number) {
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}

// Predefined rate limiters for different auth endpoints
export const authRateLimiters = {
  // More restrictive for login attempts (Ahmed's security concern)
  signin: rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 5 }), // 5 attempts per 15 minutes

  // Less restrictive for signup (Sarah's ease of use)
  signup: rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 3 }), // 3 attempts per hour

  // Very restrictive for password reset (prevent abuse)
  forgotPassword: rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 3 }), // 3 attempts per hour

  // Restrictive for password reset completion
  resetPassword: rateLimit({ windowMs: 15 * 60 * 1000, maxRequests: 3 }), // 3 attempts per 15 minutes
};

// Rate limiters for promotion endpoints
export const promotionRateLimiters = {
  // Moderate limit for boost attempts (prevent spam while allowing legitimate use)
  boost: rateLimit({ windowMs: 5 * 60 * 1000, maxRequests: 10 }), // 10 boosts per 5 minutes

  // More restrictive for subscription purchases (high-value operations)
  subscription: rateLimit({ windowMs: 60 * 60 * 1000, maxRequests: 5 }), // 5 subscription attempts per hour

  // General promotion API access
  promotions: rateLimit({ windowMs: 60 * 1000, maxRequests: 30 }), // 30 requests per minute
};