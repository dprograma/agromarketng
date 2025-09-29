import { emailService, quickSend, emailHealth } from './index';

/**
 * Email service test utilities
 */

export class EmailTester {
  /**
   * Test basic email service configuration
   */
  static async testConfiguration(): Promise<boolean> {
    try {
      console.log('Testing email service configuration...');

      const isHealthy = await emailService.testConfiguration();

      if (isHealthy) {
        console.log('✅ Email service configuration is valid');
        return true;
      } else {
        console.log('❌ Email service configuration test failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Email service configuration error:', error);
      return false;
    }
  }

  /**
   * Test all email templates
   */
  static async testAllTemplates(testEmail: string): Promise<void> {
    console.log(`Testing all email templates with ${testEmail}...`);

    const tests = [
      {
        name: 'Welcome Email',
        test: () => quickSend.welcome(testEmail, 'Test User', { testMode: true })
      },
      {
        name: 'Verification Email',
        test: () => quickSend.verification(testEmail, 'Test User', 'https://example.com/verify?token=test')
      },
      {
        name: 'Password Reset Email',
        test: () => quickSend.passwordReset(testEmail, 'Test User', 'https://example.com/reset?token=test')
      },
      {
        name: 'Newsletter Confirmation',
        test: () => quickSend.newsletterConfirmation(testEmail, 'Test User', 'https://example.com/confirm?token=test')
      },
      {
        name: 'Support Reply Email',
        test: () => quickSend.supportReply(testEmail, 'Test User', 'Test Ticket', 'This is a test reply', 'TEST123', 'open')
      },
      {
        name: 'Agent Welcome Email',
        test: () => quickSend.agentWelcome(testEmail, 'Test Agent', 'General Support')
      }
    ];

    for (const { name, test } of tests) {
      try {
        console.log(`Testing ${name}...`);
        const result = await test();

        if (result.success) {
          console.log(`✅ ${name} sent successfully (ID: ${result.messageId})`);
        } else {
          console.log(`❌ ${name} failed: ${result.error}`);
        }
      } catch (error) {
        console.log(`❌ ${name} error:`, error);
      }

      // Wait between sends to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  /**
   * Test bulk email functionality
   */
  static async testBulkEmail(testEmails: string[]): Promise<void> {
    console.log('Testing bulk email functionality...');

    try {
      const recipients = testEmails.map(email => ({
        email,
        variables: { name: `Test User ${email.split('@')[0]}` }
      }));

      const results = await emailService.sendBulkEmails(
        'newsletter-confirmation',
        recipients,
        {
          testMode: true,
          year: new Date().getFullYear()
        }
      );

      const successful = results.filter((r: any) => r.success).length;
      const failed = results.filter((r: any) => !r.success).length;

      console.log(`✅ Bulk email test completed: ${successful} successful, ${failed} failed`);

      if (failed > 0) {
        console.log('Failed emails:', results.filter((r: any) => !r.success));
      }
    } catch (error) {
      console.error('❌ Bulk email test failed:', error);
    }
  }

  /**
   * Test error handling and retry logic
   */
  static async testErrorHandling(): Promise<void> {
    console.log('Testing error handling...');

    try {
      // Test with invalid email
      const result = await emailService.sendEmail({
        to: 'invalid-email',
        subject: 'Test Error Handling',
        html: '<p>This should fail</p>'
      });

      if (!result.success) {
        console.log('✅ Error handling working correctly:', result.error);
      } else {
        console.log('⚠️ Expected error but email was sent');
      }
    } catch (error) {
      console.log('✅ Error handling caught exception:', error);
    }
  }

  /**
   * Get service health and statistics
   */
  static getHealthReport(): void {
    console.log('=== Email Service Health Report ===');

    const stats = emailService.getStats();

    console.log(`Total Sent: ${stats.totalSent}`);
    console.log(`Total Failed: ${stats.totalFailed}`);
    console.log(`Total Retries: ${stats.totalRetries}`);
    console.log(`Average Delivery Time: ${stats.averageDeliveryTime.toFixed(2)}ms`);
    console.log(`Last Sent: ${stats.lastSent || 'Never'}`);

    console.log('\n=== By Template ===');
    Object.entries(stats.byTemplate).forEach(([template, data]: [string, any]) => {
      console.log(`${template}: ${data.sent} sent, ${data.failed} failed`);
    });

    console.log('\n=== By Day ===');
    Object.entries(stats.byDay).forEach(([day, data]: [string, any]) => {
      console.log(`${day}: ${data.sent} sent, ${data.failed} failed`);
    });
  }

  /**
   * Run all tests
   */
  static async runAllTests(testEmail: string = 'test@example.com'): Promise<void> {
    console.log('🧪 Starting comprehensive email service tests...\n');

    // Test configuration
    await this.testConfiguration();
    console.log('');

    // Test error handling
    await this.testErrorHandling();
    console.log('');

    // Test all templates (only if configuration is valid)
    if (process.env.RESEND_API_KEY && testEmail !== 'test@example.com') {
      await this.testAllTemplates(testEmail);
      console.log('');

      // Test bulk email
      await this.testBulkEmail([testEmail]);
      console.log('');
    } else {
      console.log('⚠️ Skipping live email tests - set RESEND_API_KEY and provide real test email');
      console.log('');
    }

    // Get health report
    this.getHealthReport();

    console.log('\n✅ Email service tests completed!');
  }
}

/**
 * CLI test runner
 */
if (require.main === module) {
  const testEmail = process.argv[2] || 'test@example.com';

  EmailTester.runAllTests(testEmail).catch(console.error);
}