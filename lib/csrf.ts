import { NextRequest } from 'next/server';
import { randomBytes, createHash } from 'crypto';

// CSRF token storage (use Redis in production)
const csrfTokens = new Map<string, { token: string; expires: number }>();

export class CSRFProtection {
  private static readonly TOKEN_LENGTH = 32;
  private static readonly TOKEN_EXPIRY = 60 * 60 * 1000; // 1 hour

  static generateToken(sessionId: string): string {
    const token = randomBytes(this.TOKEN_LENGTH).toString('hex');
    const expires = Date.now() + this.TOKEN_EXPIRY;

    csrfTokens.set(sessionId, { token, expires });

    // Clean up expired tokens
    this.cleanupExpiredTokens();

    return token;
  }

  static verifyToken(sessionId: string, token: string): boolean {
    const record = csrfTokens.get(sessionId);

    if (!record) return false;
    if (Date.now() > record.expires) {
      csrfTokens.delete(sessionId);
      return false;
    }

    return record.token === token;
  }

  static getSessionId(req: NextRequest): string {
    // Use session token from cookie or create a temporary identifier
    const sessionToken = req.cookies.get('next-auth.session-token')?.value;
    if (sessionToken) return sessionToken;

    // Fallback to IP + User-Agent hash for sessions without auth
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    return createHash('sha256').update(ip + userAgent).digest('hex');
  }

  private static cleanupExpiredTokens(): void {
    const now = Date.now();
    for (const [key, value] of csrfTokens.entries()) {
      if (now > value.expires) {
        csrfTokens.delete(key);
      }
    }
  }
}