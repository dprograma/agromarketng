// Main email service exports
export { default as emailService } from './emailService';
export { Logger } from './logger';
export { emailTemplates, getAvailableTemplates, validateTemplate } from './templates';

// Type exports
export type {
  EmailTemplate,
  EmailOptions,
  EmailResponse,
  EmailServiceConfig,
  EmailPriority,
  EmailAttachment,
  EmailTag,
  EmailTemplateData,
  EmailStats,
  LogEntry,
  RetryConfig
} from './types';

// Helper functions for common email operations
import emailService from './emailService';

/**
 * Quick send functions for common email types
 */
export const quickSend = {
  // Welcome email for new users
  welcome: async (to: string, name: string, additionalData: Record<string, any> = {}) => {
    return emailService.sendTemplatedEmail('welcome', to, {
      name,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL,
      year: new Date().getFullYear(),
      ...additionalData
    });
  },

  // Email verification
  verification: async (to: string, name: string, verificationUrl: string) => {
    return emailService.sendTemplatedEmail('verification', to, {
      name,
      verificationUrl,
      year: new Date().getFullYear()
    });
  },

  // Password reset
  passwordReset: async (to: string, name: string, resetUrl: string) => {
    return emailService.sendTemplatedEmail('password-reset', to, {
      name,
      resetUrl,
      year: new Date().getFullYear()
    });
  },

  // Newsletter confirmation
  newsletterConfirmation: async (to: string, name: string, confirmUrl: string) => {
    return emailService.sendTemplatedEmail('newsletter-confirmation', to, {
      name,
      confirmUrl,
      year: new Date().getFullYear()
    });
  },

  // Support ticket reply
  supportReply: async (
    to: string,
    userName: string,
    ticketSubject: string,
    replyContent: string,
    ticketId: string,
    ticketStatus: string = 'open'
  ) => {
    return emailService.sendTemplatedEmail('support-reply', to, {
      userName,
      ticketSubject,
      replyContent,
      ticketId,
      ticketStatus,
      ticketUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/support/tickets/${ticketId}`,
      year: new Date().getFullYear()
    });
  },

  // Agent welcome email
  agentWelcome: async (
    to: string,
    agentName: string,
    specialization: string,
    joinDate: string = new Date().toLocaleDateString()
  ) => {
    return emailService.sendTemplatedEmail('agent-welcome', to, {
      agentName,
      agentEmail: to,
      specialization,
      joinDate,
      dashboardUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/agent/dashboard`,
      year: new Date().getFullYear()
    });
  }
};

/**
 * Email health monitoring
 */
export const emailHealth = {
  // Check if email service is healthy
  isHealthy: () => emailService.getStats(),

  // Test email configuration
  test: () => emailService.testConfiguration(),

  // Get recent error logs
  getErrors: (limit: number = 10) => {
    const stats = emailService.getStats();
    return emailService['logger'].getRecentErrors(limit);
  }
};

/**
 * Bulk email operations
 */
export const bulkEmail = {
  // Send newsletter to multiple recipients
  newsletter: async (
    recipients: Array<{ email: string; name?: string; variables?: Record<string, any> }>,
    globalVariables: Record<string, any> = {}
  ) => {
    return emailService.sendBulkEmails(
      'newsletter-confirmation',
      recipients,
      {
        year: new Date().getFullYear(),
        ...globalVariables
      }
    );
  },

  // Send custom template to multiple recipients
  custom: async (
    templateId: any,
    recipients: Array<{ email: string; variables?: Record<string, any> }>,
    globalVariables: Record<string, any> = {}
  ) => {
    return emailService.sendBulkEmails(templateId, recipients, globalVariables);
  }
};