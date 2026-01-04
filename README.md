# AgroMarket NG

A comprehensive agricultural marketplace platform built with [Next.js](https://nextjs.org) for connecting farmers, suppliers, and buyers across Nigeria.

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

#### Database Configuration
```env
# PostgreSQL Database
DATABASE_URL="postgresql://user:password@localhost:5432/agromarket"
```

#### Authentication & Security
```env
# NextAuth.js Secret (Generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-nextauth-secret-key"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
FACEBOOK_CLIENT_ID="your-facebook-client-id"
FACEBOOK_CLIENT_SECRET="your-facebook-client-secret"
TWITTER_CLIENT_ID="your-twitter-client-id"
TWITTER_CLIENT_SECRET="your-twitter-client-secret"
```

#### Payment Integration
```env
# Paystack Configuration
PAYSTACK_SECRET_KEY="your-paystack-secret-key"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="your-paystack-public-key"
```

#### Email Services
```env
# Resend Email Service
RESEND_API_KEY="your-resend-api-key"
```

#### Application Configuration
```env
# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Admin Credentials (for initial setup)
ADMIN_EMAIL="admin@agromarket.com"
ADMIN_PASS="secure-admin-password"
```

#### Optional Services
```env
# Cron Job Security
CRON_SECRET="your-cron-secret-key"

# Redis (for caching - optional)
REDIS_URL="redis://localhost:6379"

# Environment
NODE_ENV="development" # or "production"
```

### Environment Validation

The application validates required environment variables on startup. Missing critical variables will prevent the application from starting in production mode.

**Critical Variables (Application will fail without these):**
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`

**Important Variables (Features may be limited without these):**
- `RESEND_API_KEY` (Email functionality)
- OAuth provider credentials (Social login)

## Getting Started

1. **Install dependencies:**
```bash
npm install
```

2. **Set up your database:**
```bash
# Run database migrations
npx prisma db push

# Seed the database (optional)
npx prisma db seed
```

3. **Run the development server:**
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Features

- **User Authentication**: Multi-provider authentication (Google, Facebook, Twitter)
- **Ad Management**: Create, edit, and manage agricultural product listings
- **Ad Promotions**: Boost ads with different promotion types and subscription plans
- **Payment Integration**: Secure payment processing with Paystack
- **Search & Filtering**: Advanced search with category and location filtering
- **Responsive Design**: Mobile-first design with comprehensive breakpoints
- **Admin Dashboard**: Administrative features for platform management
- **Real-time Features**: Live chat, notifications, and updates

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Paystack integration
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query (TanStack Query)
- **Email**: Resend API
- **Rate Limiting**: Custom in-memory rate limiting
- **Caching**: Redis (optional)

## Production Deployment

### Environment Variables for Production

Ensure the following environment variables are set in production:

```env
NODE_ENV=production
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-secure-nextauth-secret"
PAYSTACK_SECRET_KEY="your-production-paystack-secret"
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="your-production-paystack-public-key"
NEXT_PUBLIC_BASE_URL="https://yourdomain.com"
NEXT_PUBLIC_API_URL="https://yourdomain.com"
```

### Security Checklist

- [ ] All environment variables are set securely
- [ ] Database is properly secured and backed up
- [ ] Rate limiting is enabled
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] Audit logging is enabled
- [ ] Error reporting is configured

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
