import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

/**
 * POST - Delete user account permanently
 */
export async function POST(req: NextRequest) {
  try {
    // Get token from cookies
    const token = req.cookies.get('next-auth.session-token')?.value ||
                  req.cookies.get('__Secure-next-auth.session-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token and get userId
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as { id: string };
    const userId = decoded.id;

    // Get request data
    const { password, confirmationText } = await req.json();

    if (!password || !confirmationText) {
      return NextResponse.json(
        { error: 'Password and confirmation text are required' },
        { status: 400 }
      );
    }

    // Verify confirmation text
    if (confirmationText.toLowerCase().trim() !== 'delete my account') {
      return NextResponse.json(
        { error: 'Please type "DELETE MY ACCOUNT" to confirm' },
        { status: 400 }
      );
    }

    // Get user and verify password
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
        name: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Incorrect password' },
        { status: 400 }
      );
    }

    // Begin transaction to delete all user data
    await prisma.$transaction(async (tx) => {
      // Delete related data first (due to foreign key constraints)

      // Delete user's ads
      await tx.ad.deleteMany({
        where: { userId: userId }
      });

      // Delete user's transactions
      await tx.transaction.deleteMany({
        where: { userId: userId }
      });

      // Delete user's invoices
      await tx.invoice.deleteMany({
        where: { userId: userId }
      });

      // Delete user's payment methods
      await tx.paymentMethod.deleteMany({
        where: { userId: userId }
      });

      // Delete user's support tickets and messages
      await tx.supportMessage.deleteMany({
        where: { senderId: userId }
      });

      await tx.supportTicket.deleteMany({
        where: { userId: userId }
      });

      // Delete user's conversations and messages
      await tx.message.deleteMany({
        where: { senderId: userId }
      });

      await tx.conversation.deleteMany({
        where: {
          OR: [
            { buyerId: userId },
            { sellerId: userId }
          ]
        }
      });

      // Delete user's notifications
      await tx.notification.deleteMany({
        where: { userId: userId }
      });

      // Delete notification preferences
      await tx.notificationPreferences.deleteMany({
        where: { userId: userId }
      });

      // Delete saved searches
      await tx.savedSearch.deleteMany({
        where: { userId: userId }
      });

      // Delete agent record if exists
      await tx.agent.deleteMany({
        where: { userId: userId }
      });

      // Delete authentication records
      await tx.session.deleteMany({
        where: { userId: userId }
      });

      await tx.account.deleteMany({
        where: { userId: userId }
      });

      // Delete verification tokens related to this user
      await tx.verificationToken.deleteMany({
        where: {
          identifier: {
            contains: userId
          }
        }
      });

      // Finally, delete the user
      await tx.user.delete({
        where: { id: userId }
      });
    });

    // Clear the response cookies
    const response = NextResponse.json({
      success: true,
      message: 'Account deleted successfully'
    });

    // Clear authentication cookies
    response.cookies.set('next-auth.session-token', '', {
      expires: new Date(0),
      path: '/'
    });

    response.cookies.set('__Secure-next-auth.session-token', '', {
      expires: new Date(0),
      path: '/',
      secure: true
    });

    return response;

  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}