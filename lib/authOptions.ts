import { NextAuthOptions } from 'next-auth';
import bcrypt from 'bcryptjs';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';

import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';
import { quickSend } from '@/lib/email';

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const { email, password } = credentials!;
        if (!email || !password) throw new Error('Email and password are required');

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('Invalid credentials');

        // Check if account is locked
        if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
          const lockMinutesRemaining = Math.ceil((user.accountLockedUntil.getTime() - Date.now()) / 60000);
          throw new Error(`Account is locked due to too many failed login attempts. Please try again in ${lockMinutesRemaining} minutes.`);
        }

        // Reset lockout if lock period has expired
        if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              failedLoginAttempts: 0,
              accountLockedUntil: null,
              lastFailedLoginAt: null
            }
          });
        }

        // Check if account is verified
        if (!user.verified) throw new Error('Account not verified. Please check your email for verification link.');

        const isValidPassword = await bcrypt.compare(password, user.password || '');

        if (!isValidPassword) {
          // Increment failed login attempts
          const failedAttempts = (user.failedLoginAttempts || 0) + 1;
          const now = new Date();

          // Lock account after 5 failed attempts for 30 minutes
          if (failedAttempts >= 5) {
            const lockUntil = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: failedAttempts,
                accountLockedUntil: lockUntil,
                lastFailedLoginAt: now
              }
            });

            // Send account locked notification email (async, don't block login)
            quickSend.accountLocked(user.email, user.name, failedAttempts, lockUntil).catch(err => {
              console.error('Failed to send account locked email:', err);
            });

            throw new Error('Too many failed login attempts. Account locked for 30 minutes.');
          } else {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                failedLoginAttempts: failedAttempts,
                lastFailedLoginAt: now
              }
            });

            const remainingAttempts = 5 - failedAttempts;

            // Send failed login notification after 3rd attempt (async, don't block login)
            if (failedAttempts >= 3) {
              quickSend.failedLoginAttempt(user.email, user.name, failedAttempts, remainingAttempts).catch(err => {
                console.error('Failed to send login attempt notification email:', err);
              });
            }

            throw new Error(`Invalid credentials. ${remainingAttempts} attempts remaining before account lockout.`);
          }
        }

        // Successful login - reset failed attempts
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            accountLockedUntil: null,
            lastFailedLoginAt: null
          }
        });

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        // Fetch the user from the database to include the role
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id as string },
          select: { email: true, name: true, role: true },
        });
        if (dbUser) {
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.role = dbUser.role; // Add the role to the token
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          role: token.role as string, // Add the role to the session user object
        };
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days - better UX for frequent users
  },
  pages: {
    signIn: '/signin',
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

