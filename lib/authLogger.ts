interface AuthEvent {
  event: string;
  userId?: string;
  email?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  error?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

class AuthLogger {
  private static instance: AuthLogger;

  private constructor() {}

  static getInstance(): AuthLogger {
    if (!this.instance) {
      this.instance = new AuthLogger();
    }
    return this.instance;
  }

  log(event: Omit<AuthEvent, 'timestamp'>) {
    const authEvent: AuthEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    // In production, send to logging service (e.g., Winston, Datadog, etc.)
    console.log('[AUTH EVENT]', JSON.stringify(authEvent));

    // For critical security events, also log to stderr
    if (this.isCriticalEvent(event.event) && !event.success) {
      console.error('[CRITICAL AUTH EVENT]', JSON.stringify(authEvent));
    }

    // Store in database for audit trail (implement based on requirements)
    this.storeInDatabase(authEvent);
  }

  private isCriticalEvent(eventType: string): boolean {
    const criticalEvents = [
      'LOGIN_ATTEMPT',
      'PASSWORD_RESET_REQUEST',
      'ACCOUNT_LOCKED',
      'SUSPICIOUS_ACTIVITY'
    ];
    return criticalEvents.includes(eventType);
  }

  private async storeInDatabase(event: AuthEvent) {
    // In production, implement database storage for audit trail
    // For now, we'll just add it to the console log
    if (process.env.NODE_ENV === 'production') {
      // TODO: Implement database storage
      // await prisma.authLog.create({ data: event });
    }
  }
}

export const authLogger = AuthLogger.getInstance();

// Helper functions for common auth events
export const logAuthEvent = {
  loginAttempt: (email: string, success: boolean, ip?: string, error?: string, metadata?: Record<string, any>) => {
    authLogger.log({
      event: 'LOGIN_ATTEMPT',
      email,
      success,
      ip,
      error,
      metadata: {
        ...metadata,
        userType: success ? 'authenticated' : 'anonymous'
      }
    });
  },

  signupAttempt: (email: string, success: boolean, ip?: string, error?: string) => {
    authLogger.log({
      event: 'SIGNUP_ATTEMPT',
      email,
      success,
      ip,
      error
    });
  },

  passwordResetRequest: (email: string, success: boolean, ip?: string, error?: string) => {
    authLogger.log({
      event: 'PASSWORD_RESET_REQUEST',
      email,
      success,
      ip,
      error
    });
  },

  passwordResetComplete: (userId: string, success: boolean, ip?: string, error?: string) => {
    authLogger.log({
      event: 'PASSWORD_RESET_COMPLETE',
      userId,
      success,
      ip,
      error
    });
  },

  emailVerification: (userId: string, email: string, success: boolean, error?: string) => {
    authLogger.log({
      event: 'EMAIL_VERIFICATION',
      userId,
      email,
      success,
      error
    });
  },

  rateLimitExceeded: (ip: string, endpoint: string) => {
    authLogger.log({
      event: 'RATE_LIMIT_EXCEEDED',
      success: false,
      ip,
      error: `Rate limit exceeded for ${endpoint}`,
      metadata: { endpoint }
    });
  }
};