import { NextRequest, NextResponse } from 'next/server';
import { CSRFProtection } from '@/lib/csrf';

export async function GET(req: NextRequest) {
  try {
    const sessionId = CSRFProtection.getSessionId(req);
    const csrfToken = CSRFProtection.generateToken(sessionId);

    return NextResponse.json({ csrfToken }, { status: 200 });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}