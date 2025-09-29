export type EmailTemplate =
  | 'welcome'
  | 'verification'
  | 'password-reset'
  | 'newsletter-confirmation'
  | 'support-reply'
  | 'agent-welcome'
  | 'chat-notification'
  | 'agent-assigned'
  | 'ticket-created'
  | 'ticket-closed'
  | 'account-deletion'
  | 'email-change-verification'
  | '2fa-setup';

export type EmailPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  tags?: EmailTag[];
  priority?: EmailPriority;
}

export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType?: string;
  path?: string;
}

export interface EmailTag {
  name: string;
  value: string;
}

export interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  data?: any;
  duration: number;
}

export interface EmailServiceConfig {
  from: string;
  domain: string;
  environment: string;
  baseUrl: string;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

export interface EmailTemplateData {
  subject: string;
  html: string;
  text?: string;
  description?: string;
}

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  data?: any;
}

export interface EmailStats {
  totalSent: number;
  totalFailed: number;
  totalRetries: number;
  averageDeliveryTime: number;
  lastSent?: string;
  byTemplate: Record<string, { sent: number; failed: number }>;
  byDay: Record<string, { sent: number; failed: number }>;
}