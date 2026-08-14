import { EmailTemplateData } from './types';

export const emailTemplates: Record<string, EmailTemplateData> = {
  'security-account-locked': {
    subject: 'Security Alert: Your Account Has Been Locked',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #dc2626; margin: 0;">Security Alert</h1>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hello {{name}},</p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Your AgroMarket account has been temporarily locked due to multiple failed login attempts.
        </p>

        <div style="background-color: #fef2f2; padding: 20px; border-left: 4px solid #dc2626; margin: 20px 0;">
          <p style="margin: 0; color: #991b1b;"><strong>Security Details:</strong></p>
          <ul style="color: #991b1b; margin: 10px 0;">
            <li>Failed attempts: {{failedAttempts}}</li>
            <li>Time of last attempt: {{timestamp}}</li>
            <li>Account locked until: {{lockUntil}}</li>
          </ul>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          If this was you, please wait {{lockDurationMinutes}} minutes before attempting to log in again. Your account will be automatically unlocked after this period.
        </p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          If you don't recognize this activity, your account may be at risk. We recommend:
        </p>

        <ul style="font-size: 16px; line-height: 1.6; color: #333;">
          <li>Resetting your password immediately when the lock expires</li>
          <li>Enabling two-factor authentication</li>
          <li>Reviewing your recent account activity</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetPasswordUrl}}" style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p style="font-size: 14px; color: #666;">
          Need help? Contact our support team at <a href="mailto:support@agromarket.com" style="color: #166534;">support@agromarket.com</a>
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p>© {{year}} AgroMarket. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
      Security Alert: Your Account Has Been Locked

      Hello {{name}},

      Your AgroMarket account has been temporarily locked due to multiple failed login attempts.

      Security Details:
      - Failed attempts: {{failedAttempts}}
      - Time of last attempt: {{timestamp}}
      - Account locked until: {{lockUntil}}

      If this was you, please wait {{lockDurationMinutes}} minutes before attempting to log in again.

      If you don't recognize this activity, please reset your password and enable two-factor authentication.

      Reset Password: {{resetPasswordUrl}}

      Need help? Contact support@agromarket.com

      © {{year}} AgroMarket. All rights reserved.
    `,
    description: 'Security notification when account is locked due to failed login attempts'
  },

  'security-failed-login': {
    subject: 'Security Alert: Failed Login Attempt',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #f59e0b; margin: 0;">Security Alert</h1>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hello {{name}},</p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          We detected a failed login attempt on your AgroMarket account.
        </p>

        <div style="background-color: #fffbeb; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0;">
          <p style="margin: 0; color: #92400e;"><strong>Attempt Details:</strong></p>
          <ul style="color: #92400e; margin: 10px 0;">
            <li>Time: {{timestamp}}</li>
            <li>Failed attempts so far: {{failedAttempts}}</li>
            <li>Remaining attempts: {{remainingAttempts}}</li>
          </ul>
        </div>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          If this was you, you can safely ignore this email. However, if you don't recognize this activity, we recommend securing your account immediately.
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetPasswordUrl}}" style="background-color: #166534; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Secure My Account
          </a>
        </div>

        <p style="font-size: 14px; color: #666; text-align: center;">
          Your account will be locked for 30 minutes after 5 failed attempts.
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p>© {{year}} AgroMarket. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
      Security Alert: Failed Login Attempt

      Hello {{name}},

      We detected a failed login attempt on your AgroMarket account.

      Attempt Details:
      - Time: {{timestamp}}
      - Failed attempts so far: {{failedAttempts}}
      - Remaining attempts: {{remainingAttempts}}

      If this was you, you can safely ignore this email. If not, please secure your account immediately.

      Secure My Account: {{resetPasswordUrl}}

      Your account will be locked for 30 minutes after 5 failed attempts.

      © {{year}} AgroMarket. All rights reserved.
    `,
    description: 'Security notification for failed login attempts'
  },
  welcome: {
    subject: 'Welcome to AgroMarket NG, {{name}}! Here\'s how to get started',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">

        <!-- Header -->
        <div style="background-color: #166534; padding: 32px 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 28px; letter-spacing: 1px;">AgroMarket NG</h1>
          <p style="color: #86efac; font-size: 14px; margin: 6px 0 0 0;">Nigeria's Agricultural Marketplace</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 24px; border: 1px solid #e0e0e0; border-top: none;">

          <p style="font-size: 17px; line-height: 1.6; color: #111827; margin-top: 0;">Hi {{name}},</p>

          <p style="font-size: 15px; line-height: 1.7; color: #374151;">
            Welcome to <strong>AgroMarket NG</strong> — Nigeria's trusted platform for buying and selling agricultural products. Whether you're a farmer, dealer, or buyer, you're now part of a community connecting thousands of people across the country.
          </p>

          <!-- What you can do -->
          <div style="background-color: #f0fdf4; border-radius: 8px; padding: 20px 24px; margin: 24px 0;">
            <h2 style="color: #166534; font-size: 16px; margin: 0 0 14px 0;">🌾 What you can do on AgroMarket NG</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; color: #166534; font-size: 18px; width: 28px; vertical-align: top;">✅</td>
                <td style="padding: 6px 0; color: #374151; font-size: 14px; line-height: 1.5;"><strong>Post unlimited ads for free</strong> — list your farm produce, livestock, equipment, or agro inputs at no cost.</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #166534; font-size: 18px; width: 28px; vertical-align: top;">✅</td>
                <td style="padding: 6px 0; color: #374151; font-size: 14px; line-height: 1.5;"><strong>Reach buyers across Nigeria</strong> — your listings are visible to buyers in Lagos, Abuja, Kano, Port Harcourt, and everywhere in between.</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #166534; font-size: 18px; width: 28px; vertical-align: top;">✅</td>
                <td style="padding: 6px 0; color: #374151; font-size: 14px; line-height: 1.5;"><strong>Message sellers directly</strong> — no middleman. Contact any seller through our built-in messaging to negotiate and close deals.</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #166534; font-size: 18px; width: 28px; vertical-align: top;">✅</td>
                <td style="padding: 6px 0; color: #374151; font-size: 14px; line-height: 1.5;"><strong>Boost your ads</strong> — get featured placement to appear at the top of search results and reach more buyers faster.</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; color: #166534; font-size: 18px; width: 28px; vertical-align: top;">✅</td>
                <td style="padding: 6px 0; color: #374151; font-size: 14px; line-height: 1.5;"><strong>Read expert farming guides</strong> — our blog covers crop management, pricing strategies, loans, and more.</td>
              </tr>
            </table>
          </div>

          <!-- Guidelines -->
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 24px 0;">
            <h2 style="color: #92400e; font-size: 15px; margin: 0 0 10px 0;">📋 Platform Guidelines</h2>
            <ul style="color: #78350f; font-size: 14px; line-height: 1.7; margin: 0; padding-left: 18px;">
              <li>Only post genuine agricultural products — no fake or misleading listings.</li>
              <li>Use accurate descriptions, photos, and prices. Buyers rely on this to make decisions.</li>
              <li>Respond promptly to messages from buyers. Fast responses build your reputation.</li>
              <li>Do not share personal financial details (bank PIN, passwords) through the platform.</li>
              <li>Treat all buyers and sellers with respect. We have zero tolerance for scams or harassment.</li>
            </ul>
          </div>

          <!-- CTA -->
          <div style="text-align: center; margin: 32px 0 24px 0;">
            <a href="{{baseUrl}}/dashboard/new-ad" style="background-color: #166534; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
              Post Your First Ad →
            </a>
          </div>

          <p style="font-size: 14px; line-height: 1.7; color: #6b7280; text-align: center;">
            Or <a href="{{baseUrl}}/products" style="color: #166534; text-decoration: none; font-weight: 600;">browse current listings</a> to find what you're looking for.
          </p>

          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;" />

          <p style="font-size: 13px; color: #9ca3af; line-height: 1.6; text-align: center; margin: 0;">
            Need help? Reply to this email or visit our <a href="{{baseUrl}}/dashboard/support" style="color: #166534;">support centre</a>.<br/>
            © {{year}} AgroMarket NG. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
Hi {{name}},

Welcome to AgroMarket NG — Nigeria's trusted platform for buying and selling agricultural products.

WHAT YOU CAN DO:
- Post unlimited ads for free
- Reach buyers across Nigeria
- Message sellers directly — no middleman
- Boost your ads for more visibility
- Read expert farming guides on our blog

PLATFORM GUIDELINES:
- Only post genuine agricultural products
- Use accurate descriptions, photos, and prices
- Respond promptly to messages
- Never share financial details through the platform
- Treat everyone with respect

Post your first ad: {{baseUrl}}/dashboard/new-ad
Browse listings: {{baseUrl}}/products

Need help? Contact support at {{baseUrl}}/dashboard/support

© {{year}} AgroMarket NG. All rights reserved.
    `,
    description: 'Comprehensive welcome email for new users'
  },

  broadcast: {
    subject: '{{subject}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <div style="background-color: #166534; padding: 28px 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px;">AgroMarket NG</h1>
          <p style="color: #86efac; font-size: 13px; margin: 4px 0 0 0;">Nigeria's Agricultural Marketplace</p>
        </div>
        <div style="padding: 32px 24px; border: 1px solid #e0e0e0; border-top: none;">
          <p style="font-size: 16px; color: #111827; margin-top: 0;">Hi {{name}},</p>
          <div style="font-size: 15px; line-height: 1.8; color: #374151;">{{content}}</div>
          <div style="text-align: center; margin: 32px 0;">
            <a href="{{baseUrl}}/products" style="background-color: #166534; color: #ffffff; padding: 13px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
              Visit AgroMarket NG
            </a>
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
            © {{year}} AgroMarket NG. All rights reserved.<br/>
            You're receiving this because you have an account on <a href="{{baseUrl}}" style="color: #166534;">agromarketng.com</a>.
          </p>
        </div>
      </div>
    `,
    text: `
Hi {{name}},

{{content}}

Visit AgroMarket NG: {{baseUrl}}/products

© {{year}} AgroMarket NG. All rights reserved.
    `,
    description: 'Admin broadcast/newsletter to all users'
  },

  verification: {
    subject: 'Verify Your AgroMarket Account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">AgroMarket</h1>
        </div>

        <h2 style="color: #166534; text-align: center;">Verify Your Account</h2>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hello {{name}},</p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Thank you for signing up for AgroMarket! To complete your registration and secure your account, please verify your email address by clicking the button below:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{verificationUrl}}" style="background-color: #166534; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Verify Your Account
          </a>
        </div>

        <p style="font-size: 14px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="{{verificationUrl}}" style="color: #166534; word-break: break-all;">{{verificationUrl}}</a>
        </p>

        <p style="font-size: 14px; color: #666;">
          This verification link will expire in 24 hours.
        </p>

        <p style="font-size: 14px; color: #666;">
          If you didn't create an account with AgroMarket, you can safely ignore this email.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p>© {{year}} AgroMarket. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
      Verify Your AgroMarket Account

      Hello {{name}},

      Thank you for signing up! Please verify your email address by clicking this link:
      {{verificationUrl}}

      This link will expire in 24 hours.

      If you didn't create an account, you can safely ignore this email.

      © {{year}} AgroMarket. All rights reserved.
    `,
    description: 'Email verification for new accounts'
  },

  'password-reset': {
    subject: 'Reset Your AgroMarket Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">AgroMarket</h1>
        </div>

        <h2 style="color: #166534; text-align: center;">Password Reset Request</h2>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hello {{name}},</p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          We received a request to reset your password for your AgroMarket account. Click the button below to create a new password:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{resetUrl}}" style="background-color: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Reset Password
          </a>
        </div>

        <p style="font-size: 14px; color: #666;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="{{resetUrl}}" style="color: #dc2626; word-break: break-all;">{{resetUrl}}</a>
        </p>

        <p style="font-size: 14px; color: #666;">
          This password reset link will expire in 1 hour for security reasons.
        </p>

        <p style="font-size: 14px; color: #666;">
          If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p>© {{year}} AgroMarket. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
      Reset Your AgroMarket Password

      Hello {{name}},

      We received a request to reset your password. Click this link to create a new password:
      {{resetUrl}}

      This link will expire in 1 hour.

      If you didn't request this, you can safely ignore this email.

      © {{year}} AgroMarket. All rights reserved.
    `,
    description: 'Password reset email'
  },

  'newsletter-confirmation': {
    subject: 'Confirm Your AgroMarket Newsletter Subscription',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">AgroMarket</h1>
        </div>

        <h2 style="color: #166534; text-align: center;">Confirm Your Newsletter Subscription</h2>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hello {{name}},</p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Thank you for subscribing to the AgroMarket newsletter! To complete your subscription and start receiving our latest agricultural insights, market updates, and farming tips, please confirm your email address:
        </p>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{confirmUrl}}" style="background-color: #166534; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Confirm Subscription
          </a>
        </div>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">What You'll Receive:</h3>
          <ul style="color: #333; line-height: 1.6;">
            <li>Weekly market prices and trends</li>
            <li>Seasonal farming tips and best practices</li>
            <li>New product announcements</li>
            <li>Success stories from our farming community</li>
          </ul>
        </div>

        <p style="font-size: 14px; color: #666;">
          If you didn't subscribe to our newsletter, you can safely ignore this email.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p>© {{year}} AgroMarket. All rights reserved.</p>
          <p>You're receiving this email because you signed up for the AgroMarket newsletter.</p>
        </div>
      </div>
    `,
    text: `
      Confirm Your AgroMarket Newsletter Subscription

      Hello {{name}},

      Thank you for subscribing! Please confirm your subscription by clicking this link:
      {{confirmUrl}}

      What You'll Receive:
      - Weekly market prices and trends
      - Seasonal farming tips and best practices
      - New product announcements
      - Success stories from our farming community

      If you didn't subscribe, you can safely ignore this email.

      © {{year}} AgroMarket. All rights reserved.
    `,
    description: 'Newsletter subscription confirmation'
  },

  'support-reply': {
    subject: 'Reply to your support ticket: {{ticketSubject}}',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">AgroMarket Support</h1>
        </div>

        <h2 style="color: #166534;">Support Ticket Update</h2>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hello {{userName}},</p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Our support team has replied to your ticket "<strong>{{ticketSubject}}</strong>".
        </p>

        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #166534;">
          <h3 style="color: #166534; margin-top: 0;">Agent Reply:</h3>
          <p style="color: #333; line-height: 1.6; margin: 0;">{{replyContent}}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{ticketUrl}}" style="background-color: #166534; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            View Full Conversation
          </a>
        </div>

        <p style="font-size: 14px; color: #666;">
          Ticket ID: #{{ticketId}}<br>
          Status: {{ticketStatus}}
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p>© {{year}} AgroMarket. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
      Support Ticket Update

      Hello {{userName}},

      Our support team has replied to your ticket "{{ticketSubject}}".

      Agent Reply: {{replyContent}}

      View full conversation: {{ticketUrl}}

      Ticket ID: #{{ticketId}}
      Status: {{ticketStatus}}

      © {{year}} AgroMarket. All rights reserved.
    `,
    description: 'Support ticket reply notification'
  },

  'agent-welcome': {
    subject: 'Welcome to the AgroMarket Support Team!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #166534; margin: 0;">AgroMarket</h1>
          <p style="color: #16a34a; font-size: 14px; margin: 5px 0 0 0;">Support Team</p>
        </div>

        <h2 style="color: #166534; text-align: center;">Welcome to Our Team!</h2>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">Hello {{agentName}},</p>

        <p style="font-size: 16px; line-height: 1.6; color: #333;">
          Welcome to the AgroMarket support team! We're excited to have you join us in helping our farming community succeed.
        </p>

        <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #166534; margin-top: 0;">Your Account Details:</h3>
          <ul style="color: #333; line-height: 1.6;">
            <li><strong>Email:</strong> {{agentEmail}}</li>
            <li><strong>Role:</strong> Support Agent</li>
            <li><strong>Specialization:</strong> {{specialization}}</li>
            <li><strong>Join Date:</strong> {{joinDate}}</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{dashboardUrl}}" style="background-color: #166534; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Access Agent Dashboard
          </a>
        </div>

        <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
          <h3 style="color: #92400e; margin-top: 0;">Next Steps:</h3>
          <ol style="color: #92400e; line-height: 1.6;">
            <li>Complete your agent profile setup</li>
            <li>Review our support guidelines and best practices</li>
            <li>Familiarize yourself with common agricultural issues</li>
            <li>Start responding to support tickets</li>
          </ol>
        </div>

        <p style="font-size: 14px; color: #666;">
          If you have any questions about your role or need assistance, please contact the admin team.
        </p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #666; font-size: 12px;">
          <p>© {{year}} AgroMarket. All rights reserved.</p>
        </div>
      </div>
    `,
    text: `
      Welcome to the AgroMarket Support Team!

      Hello {{agentName}},

      Welcome to the AgroMarket support team! We're excited to have you join us.

      Your Account Details:
      - Email: {{agentEmail}}
      - Role: Support Agent
      - Specialization: {{specialization}}
      - Join Date: {{joinDate}}

      Access your dashboard: {{dashboardUrl}}

      Next Steps:
      1. Complete your agent profile setup
      2. Review our support guidelines
      3. Familiarize yourself with common agricultural issues
      4. Start responding to support tickets

      © {{year}} AgroMarket. All rights reserved.
    `,
    description: 'Welcome email for new support agents'
  }
};

// Helper function to get all available templates
export function getAvailableTemplates(): string[] {
  return Object.keys(emailTemplates);
}

// Helper function to validate template
export function validateTemplate(templateId: string): boolean {
  return templateId in emailTemplates;
}