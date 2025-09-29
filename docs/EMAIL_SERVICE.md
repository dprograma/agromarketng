# Centralized Email Service Documentation

## Overview

The AgroMarket application now uses a centralized email service powered by Resend API. This service provides robust, scalable, and production-ready email functionality with comprehensive error handling, retry logic, and detailed logging.

## Features

- ✅ **Centralized Configuration**: Single point of configuration for all email sending
- ✅ **Template Management**: Pre-built email templates for common use cases
- ✅ **Error Handling**: Comprehensive error handling with retry logic
- ✅ **Logging & Monitoring**: Detailed logging and performance statistics
- ✅ **Production Ready**: Built for scalability and reliability
- ✅ **Type Safety**: Full TypeScript support with proper type definitions
- ✅ **Rate Limiting**: Built-in rate limiting and batch processing for bulk emails

## Architecture

```
lib/email/
├── index.ts           # Main exports and helper functions
├── emailService.ts    # Core email service class
├── templates.ts       # Email template definitions
├── types.ts          # TypeScript type definitions
├── logger.ts         # Logging and statistics
└── test.ts           # Testing utilities
```

## Environment Variables

### Required

```bash
# Resend API Configuration
RESEND_API_KEY=re_xxxxxxxxxxxxx           # Your Resend API key

# Email Configuration
EMAIL_FROM="AgroMarket <noreply@yourdomain.com>"  # Default sender email
NEXT_PUBLIC_BASE_URL=https://yourdomain.com       # Base URL for email links
```

### Optional

```bash
# Email Service Configuration
RESEND_DOMAIN=yourdomain.com              # Your verified domain in Resend
TEST_EMAIL=test@yourdomain.com            # Email for testing configuration

# Environment
NODE_ENV=production                       # Controls logging verbosity
```

## Usage

### Quick Send Functions

```typescript
import { quickSend } from '@/lib/email';

// Welcome email for new users
await quickSend.welcome('user@example.com', 'John Doe');

// Email verification
await quickSend.verification('user@example.com', 'John Doe', verificationUrl);

// Password reset
await quickSend.passwordReset('user@example.com', 'John Doe', resetUrl);

// Newsletter confirmation
await quickSend.newsletterConfirmation('user@example.com', 'John Doe', confirmUrl);

// Support ticket reply
await quickSend.supportReply(
  'user@example.com',
  'John Doe',
  'Billing Issue',
  'We have resolved your billing issue.',
  'TICKET123',
  'closed'
);

// Agent welcome email
await quickSend.agentWelcome('agent@example.com', 'Jane Smith', 'Technical Support');
```

### Custom Emails

```typescript
import { emailService } from '@/lib/email';

// Send custom email
const result = await emailService.sendEmail({
  to: 'user@example.com',
  subject: 'Custom Subject',
  html: '<h1>Custom HTML Content</h1>',
  text: 'Custom plain text content',
  tags: [{ name: 'type', value: 'custom' }],
  priority: 'high'
});

if (result.success) {
  console.log('Email sent:', result.messageId);
} else {
  console.error('Email failed:', result.error);
}
```

### Templated Emails

```typescript
import { emailService } from '@/lib/email';

// Send with template
const result = await emailService.sendTemplatedEmail(
  'welcome',
  'user@example.com',
  {
    name: 'John Doe',
    baseUrl: 'https://yourdomain.com',
    year: new Date().getFullYear()
  }
);
```

### Bulk Emails

```typescript
import { bulkEmail } from '@/lib/email';

// Send newsletter to multiple recipients
const recipients = [
  { email: 'user1@example.com', name: 'User 1' },
  { email: 'user2@example.com', name: 'User 2' }
];

const results = await bulkEmail.newsletter(recipients, {
  companyName: 'AgroMarket',
  unsubscribeUrl: 'https://yourdomain.com/unsubscribe'
});

console.log(`Sent to ${results.filter(r => r.success).length} recipients`);
```

## Available Templates

| Template ID | Description | Variables |
|-------------|-------------|-----------|
| `welcome` | Welcome email for new users | `name`, `baseUrl`, `year` |
| `verification` | Email address verification | `name`, `verificationUrl`, `year` |
| `password-reset` | Password reset instructions | `name`, `resetUrl`, `year` |
| `newsletter-confirmation` | Newsletter subscription confirmation | `name`, `confirmUrl`, `year` |
| `support-reply` | Support ticket reply notification | `userName`, `ticketSubject`, `replyContent`, `ticketId`, `ticketStatus`, `ticketUrl`, `year` |
| `agent-welcome` | Welcome email for new support agents | `agentName`, `agentEmail`, `specialization`, `joinDate`, `dashboardUrl`, `year` |

## Error Handling

The email service includes comprehensive error handling:

```typescript
// Automatic retry with exponential backoff
// - Retries up to 3 times for recoverable errors
// - Exponential backoff: 1s, 2s, 4s
// - Smart error detection (doesn't retry client errors)

// Error response structure
interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
  data?: any;
  duration: number;
}
```

## Monitoring & Health Checks

### Get Service Statistics

```typescript
import { emailService } from '@/lib/email';

const stats = emailService.getStats();
console.log('Total sent:', stats.totalSent);
console.log('Total failed:', stats.totalFailed);
console.log('Average delivery time:', stats.averageDeliveryTime);
```

### Health Check

```typescript
import { emailHealth } from '@/lib/email';

// Test configuration
const isHealthy = await emailHealth.test();

// Get recent errors
const errors = emailHealth.getErrors(10);
```

## Testing

### Run Comprehensive Tests

```bash
# Run all tests with a real email address
npx ts-node lib/email/test.ts your-email@example.com

# Run configuration test only
npx ts-node -e "import { EmailTester } from './lib/email/test'; EmailTester.testConfiguration()"
```

### Test in Code

```typescript
import { EmailTester } from '@/lib/email/test';

// Test all functionality
await EmailTester.runAllTests('test@example.com');

// Test specific template
await EmailTester.testAllTemplates('test@example.com');

// Get health report
EmailTester.getHealthReport();
```

## Migration from Previous Implementation

The centralized email service replaces all previous email implementations:

### Before (Multiple Configurations)
```typescript
// Different configurations in each file
const transporter = nodemailer.createTransporter({...});
await transporter.sendMail({...});
```

### After (Centralized)
```typescript
// Single import, consistent interface
import { quickSend } from '@/lib/email';
await quickSend.verification(email, name, url);
```

## Production Deployment

### 1. Set Up Resend Account

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Generate API key
4. Add API key to environment variables

### 2. Configure Environment Variables

```bash
# Production environment
RESEND_API_KEY=re_xxxxxxxxxxxxx
EMAIL_FROM="AgroMarket <noreply@yourdomain.com>"
RESEND_DOMAIN=yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NODE_ENV=production
```

### 3. DNS Configuration

Add these DNS records for your domain:

```
# SPF Record
TXT @ "v=spf1 include:_spf.resend.com ~all"

# DKIM Record (provided by Resend)
TXT resend._domainkey.yourdomain.com "p=..."

# DMARC Record
TXT _dmarc.yourdomain.com "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

### 4. Monitoring Setup

```typescript
// Add to your monitoring/health check endpoint
import { emailHealth } from '@/lib/email';

export async function GET() {
  const stats = emailHealth.isHealthy();
  const errors = emailHealth.getErrors(5);

  return Response.json({
    emailService: {
      healthy: stats.totalFailed / (stats.totalSent + stats.totalFailed) < 0.1,
      stats,
      recentErrors: errors
    }
  });
}
```

## Performance Considerations

- **Rate Limiting**: Automatic rate limiting for bulk emails (100 emails per batch)
- **Batch Processing**: Large email lists are processed in batches with delays
- **Retry Logic**: Failed emails are retried with exponential backoff
- **Monitoring**: Built-in performance monitoring and error tracking
- **Memory Efficient**: Logs are automatically cleaned up (keeps last 1000 entries)

## Troubleshooting

### Common Issues

1. **"RESEND_API_KEY environment variable is required"**
   - Set the RESEND_API_KEY environment variable

2. **"Email delivery failed"**
   - Check your Resend API key is valid
   - Verify your domain in Resend dashboard
   - Check rate limits

3. **"Template not found"**
   - Use valid template IDs from the available templates list

4. **High failure rate**
   - Check email addresses are valid
   - Verify DNS configuration
   - Check Resend dashboard for delivery issues

### Debug Mode

```typescript
// Enable detailed logging in development
process.env.NODE_ENV = 'development';

// Check recent errors
import { emailService } from '@/lib/email';
const logger = emailService['logger'];
const errors = logger.getRecentErrors(10);
console.log(errors);
```

## Support

For issues with the email service:

1. Check the health report: `EmailTester.getHealthReport()`
2. Review recent errors in the logs
3. Test configuration: `EmailTester.testConfiguration()`
4. Check Resend dashboard for delivery issues

## Security Notes

- API keys are never logged or exposed in error messages
- All email content is sanitized before sending
- Rate limiting prevents abuse
- Failed authentication attempts are logged for monitoring