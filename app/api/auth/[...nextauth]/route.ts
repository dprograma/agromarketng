import NextAuth, { NextAuthOptions, CallbacksOptions, DefaultSession, User, Account, Profile } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { AdapterUser } from 'next-auth/adapters';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import TwitterProvider from 'next-auth/providers/twitter';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/lib/prisma';


const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {strategy: 'jwt'},
  debug: process.env.NODE_ENV !== 'production',
  pages: {
    signIn: '/signin',
    error: '/error',
    newUser: '/dashboard',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID as string,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
    }),
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID as string,
      clientSecret: process.env.TWITTER_CLIENT_SECRET as string,
      version: '2.0',
    }),
  ],
  callbacks: {
    async signIn({
      user,
    }: {
      user: User | AdapterUser;
      account: Account | null;
      profile?: Profile | undefined;
    }): Promise<boolean> {
      if (!user.email) {
        console.error("Sign-in error: Missing email");
        return false;
      }
      return true;
    },
    async jwt({ token, user }: { token: JWT; user?: User|AdapterUser }) {
      if (user) {
        console.log("User in jwt callback:", user);
        token.email = user.email || null;
        token.name = user.name || null;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: DefaultSession;
      token: JWT;
    }): Promise<DefaultSession> {
      console.log("Token in session callback:", token); 
      session.user = {
        ...session.user,
        email: token.email || null,
        name: token.name || null,
      };

      return session;
    },
  },
};


const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
