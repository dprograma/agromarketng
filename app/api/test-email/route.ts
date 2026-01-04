import { NextRequest, NextResponse } from 'next/server';
import { quickSend, emailService } from '@/lib/email';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing email service...');

    // Get test email from query params
    const url = new URL(req.url);
    const testEmail = url.searchParams.get('email') || 'test@example.com';

    // Test 1: Check environment variables
    const envCheck = {
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      EMAIL_FROM: !!process.env.EMAIL_FROM,
      NEXT_PUBLIC_BASE_URL: !!process.env.NEXT_PUBLIC_BASE_URL
    };

    console.log('Environment check:', envCheck);

    // Test 2: Get service stats
    const stats = emailService.getStats();
    console.log('Service stats:', stats);

    // Test 3: Test configuration
    const isHealthy = await emailService.testConfiguration();
    console.log('Configuration test:', isHealthy);

    // Test 4: Send test verification email
    let emailResult = null;
    if (testEmail !== 'test@example.com') {
      try {
        emailResult = await quickSend.verification(
          testEmail,
          'Test User',
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=test123`
        );
        console.log('Test email result:', emailResult);
      } catch (emailError) {
        console.error('Test email error:', emailError);
        emailResult = { success: false, error: emailError.message };
      }
    }

    return NextResponse.json({
      status: 'success',
      environment: envCheck,
      serviceStats: stats,
      configurationHealthy: isHealthy,
      testEmail: emailResult,
      message: 'Email service test completed. Check server logs for details.'
    });

  } catch (error) {
    console.error('Email test endpoint error:', error);

    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      message: 'Email service test failed'
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, name = 'Test User' } = await req.json();

    if (!email) {
      return NextResponse.json({
        status: 'error',
        message: 'Email address is required'
      }, { status: 400 });
    }

    console.log(`Sending test verification email to ${email}...`);

    const result = await quickSend.verification(
      email,
      name,
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify-email?token=test123`
    );

    console.log('Email sending result:', result);

    return NextResponse.json({
      status: result.success ? 'success' : 'error',
      result,
      message: result.success
        ? `Test email sent to ${email}`
        : `Failed to send email: ${result.error}`
    });

  } catch (error) {
    console.error('Test email sending error:', error);

    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : String(error),
      message: 'Failed to send test email'
    }, { status: 500 });
  }
}