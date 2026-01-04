import { Resend } from 'resend';
import {
  EmailTemplate,
  EmailOptions,
  EmailResponse,
  EmailServiceConfig,
  RetryConfig,
  EmailPriority
} from './types';
import { emailTemplates } from './templates';
import { Logger } from './logger';

class EmailService {
  private resend: Resend;
  private config: EmailServiceConfig;
  private logger: Logger;
  private retryConfig: RetryConfig;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.logger = new Logger();

    this.config = {
      from: process.env.EMAIL_FROM || 'AgroMarket <onboarding@resend.dev>',
      domain: process.env.RESEND_DOMAIN || 'resend.dev',
      environment: process.env.NODE_ENV || 'development',
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    };

    this.retryConfig = {
      maxRetries: 3,
      retryDelay: 1000, // 1 second
      backoffMultiplier: 2
    };

    this.validateConfig();
  }

  private validateConfig(): void {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY environment variable is required');
    }

    if (!this.config.from) {
      throw new Error('EMAIL_FROM environment variable is required');
    }
  }

  /**
   * Send email with template
   */
  async sendTemplatedEmail(
    templateId: EmailTemplate,
    to: string | string[],
    variables: Record<string, any> = {},
    options: Partial<EmailOptions> = {}
  ): Promise<EmailResponse> {
    const template = emailTemplates[templateId];
    if (!template) {
      throw new Error(`Email template '${templateId}' not found`);
    }

    const emailData = {
      from: options.from || this.config.from,
      to: Array.isArray(to) ? to : [to],
      subject: this.interpolateTemplate(template.subject, variables),
      html: this.interpolateTemplate(template.html, variables),
      text: template.text ? this.interpolateTemplate(template.text, variables) : undefined,
      headers: options.headers,
      tags: options.tags || [{ name: 'template', value: templateId }],
      ...options
    };

    return this.sendWithRetry(emailData, options.priority);
  }

  /**
   * Send custom email
   */
  async sendEmail(emailData: EmailOptions): Promise<EmailResponse> {
    const data = {
      from: emailData.from || this.config.from,
      ...emailData,
      to: Array.isArray(emailData.to) ? emailData.to : [emailData.to]
    };

    return this.sendWithRetry(data, emailData.priority);
  }

  /**
   * Send email with retry logic
   */
  private async sendWithRetry(
    emailData: any,
    priority: EmailPriority = 'normal',
    attempt: number = 1
  ): Promise<EmailResponse> {
    const startTime = Date.now();

    try {
      this.logger.info('Attempting to send email', {
        to: emailData.to,
        subject: emailData.subject,
        attempt,
        priority
      });

      const result = await this.resend.emails.send(emailData);

      if (result.error) {
        throw new Error(`Resend API error: ${result.error.message}`);
      }

      const duration = Date.now() - startTime;
      this.logger.info('Email sent successfully', {
        id: result.data?.id,
        to: emailData.to,
        subject: emailData.subject,
        duration: `${duration}ms`,
        attempt
      });

      return {
        success: true,
        messageId: result.data?.id || '',
        data: result.data,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);

      this.logger.error('Email sending failed', {
        error: errorMessage,
        to: emailData.to,
        subject: emailData.subject,
        attempt,
        duration: `${duration}ms`
      });

      // Retry logic for non-critical errors
      if (attempt < this.retryConfig.maxRetries && this.shouldRetry(error)) {
        const delay = this.retryConfig.retryDelay * Math.pow(this.retryConfig.backoffMultiplier, attempt - 1);

        this.logger.info(`Retrying email send in ${delay}ms`, {
          to: emailData.to,
          attempt: attempt + 1,
          maxRetries: this.retryConfig.maxRetries
        });

        await this.sleep(delay);
        return this.sendWithRetry(emailData, priority, attempt + 1);
      }

      return {
        success: false,
        error: errorMessage,
        duration
      };
    }
  }

  /**
   * Determine if error should trigger a retry
   */
  private shouldRetry(error: any): boolean {
    const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

    // Don't retry for client errors (4xx)
    if (errorMessage.includes('invalid') ||
        errorMessage.includes('unauthorized') ||
        errorMessage.includes('forbidden') ||
        errorMessage.includes('bad request')) {
      return false;
    }

    // Retry for server errors (5xx) and network issues
    return true;
  }

  /**
   * Interpolate template variables
   */
  private interpolateTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Send bulk emails (for newsletters, etc.)
   */
  async sendBulkEmails(
    templateId: EmailTemplate,
    recipients: Array<{ email: string; variables?: Record<string, any> }>,
    globalVariables: Record<string, any> = {},
    options: Partial<EmailOptions> = {}
  ): Promise<EmailResponse[]> {
    const results: EmailResponse[] = [];
    const batchSize = 100; // Resend's batch limit

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      const batchPromises = batch.map(recipient =>
        this.sendTemplatedEmail(
          templateId,
          recipient.email,
          { ...globalVariables, ...recipient.variables },
          options
        )
      );

      const batchResults = await Promise.allSettled(batchPromises);

      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            success: false,
            error: result.reason instanceof Error ? result.reason.message : String(result.reason),
            duration: 0
          });
        }
      });

      // Rate limiting - wait between batches
      if (i + batchSize < recipients.length) {
        await this.sleep(1000); // 1 second between batches
      }
    }

    return results;
  }

  /**
   * Get email sending statistics
   */
  getStats(): any {
    return this.logger.getStats();
  }

  /**
   * Test email configuration
   */
  async testConfiguration(): Promise<boolean> {
    try {
      const testResult = await this.sendEmail({
        to: process.env.TEST_EMAIL || 'test@example.com',
        subject: 'AgroMarket Email Service Test',
        html: '<p>This is a test email to verify the email service configuration.</p>',
        text: 'This is a test email to verify the email service configuration.',
        tags: [{ name: 'type', value: 'test' }]
      });

      return testResult.success;
    } catch (error) {
      this.logger.error('Email configuration test failed', { error });
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
export default emailService;