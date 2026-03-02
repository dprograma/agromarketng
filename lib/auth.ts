import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { getToken } from 'next-auth/jwt';

interface AuthResult {
  userId: string;
  email?: string;
  name?: string;
  role?: string;
}

interface AuthError {
  error: string;
  code: string;
  status: number;
}

/**
 * Unified authentication utility for API routes.
 * Handles both custom JWT tokens (from /api/signin) and NextAuth session tokens.
 *
 * @param req - The NextRequest object
 * @returns AuthResult with user info, or AuthError if authentication fails
 */
export async function getAuthUserId(req: NextRequest): Promise<AuthResult | AuthError> {
  // Check both possible cookie names (production HTTPS may use __Secure- prefix)
  const sessionToken = req.cookies.get('next-auth.session-token')?.value ||
                       req.cookies.get('__Secure-next-auth.session-token')?.value;

  if (!sessionToken) {
    return {
      error: 'Authentication required. No session token found.',
      code: 'NO_TOKEN',
      status: 401
    };
  }

  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    console.error('CRITICAL: NEXTAUTH_SECRET environment variable is not set');
    return {
      error: 'Server configuration error',
      code: 'MISSING_SECRET',
      status: 500
    };
  }

  // Approach 1: Try verifying as a custom JWT (from /api/signin)
  try {
    const decoded = jwt.verify(sessionToken, secret) as {
      id: string;
      email?: string;
      name?: string;
      role?: string;
    };

    if (decoded.id) {
      return {
        userId: decoded.id,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
      };
    }
  } catch (jwtError) {
    // Custom JWT verification failed, try NextAuth approach
    // This is expected for NextAuth-generated tokens (JWE format)
  }

  // Approach 2: Try NextAuth's getToken (handles encrypted JWE tokens from social/NextAuth login)
  try {
    const nextAuthToken = await getToken({ req, secret });
    if (nextAuthToken?.id || nextAuthToken?.sub) {
      return {
        userId: (nextAuthToken.id as string) || (nextAuthToken.sub as string),
        email: nextAuthToken.email || undefined,
        name: nextAuthToken.name || undefined,
        role: (nextAuthToken.role as string) || undefined,
      };
    }
  } catch (nextAuthError) {
    // NextAuth token verification also failed
    console.error('NextAuth getToken failed:', nextAuthError);
  }

  return {
    error: 'Invalid or expired authentication token',
    code: 'INVALID_TOKEN',
    status: 401
  };
}

/**
 * Type guard to check if the result is an AuthError
 */
export function isAuthError(result: AuthResult | AuthError): result is AuthError {
  return 'error' in result && 'code' in result && 'status' in result;
}
