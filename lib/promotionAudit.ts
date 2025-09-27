import prisma from '@/lib/prisma';

export interface PromotionAuditEvent {
  userId: string;
  action: 'BOOST_CREATED' | 'BOOST_EXPIRED' | 'SUBSCRIPTION_PURCHASED' | 'SUBSCRIPTION_CANCELLED' | 'PROMOTION_VIEW';
  entityId: string; // Ad ID or Subscription ID
  entityType: 'AD' | 'SUBSCRIPTION';
  details?: {
    boostType?: number;
    duration?: number;
    amount?: number;
    planName?: string;
    previousStatus?: string;
    newStatus?: string;
    [key: string]: any;
  };
  userAgent?: string;
  ipAddress?: string;
}

export class PromotionAuditLogger {
  static async log(event: PromotionAuditEvent): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: event.userId,
          action: event.action,
          entityId: event.entityId,
          entityType: event.entityType,
          details: event.details || {},
          userAgent: event.userAgent,
          ipAddress: event.ipAddress,
          timestamp: new Date(),
        },
      });
    } catch (error) {
      // Log to console in case database logging fails
      console.error('Failed to log audit event:', {
        error: error instanceof Error ? error.message : String(error),
        event,
      });
    }
  }

  static async logBoostCreated(
    userId: string,
    adId: string,
    boostType: number,
    duration: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'BOOST_CREATED',
      entityId: adId,
      entityType: 'AD',
      details: {
        boostType,
        duration,
        boostEndDate: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString(),
      },
      userAgent,
      ipAddress,
    });
  }

  static async logSubscriptionPurchased(
    userId: string,
    subscriptionId: string,
    planName: string,
    amount: number,
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'SUBSCRIPTION_PURCHASED',
      entityId: subscriptionId,
      entityType: 'SUBSCRIPTION',
      details: {
        planName,
        amount,
        purchaseDate: new Date().toISOString(),
      },
      userAgent,
      ipAddress,
    });
  }

  static async logPromotionView(
    userId: string,
    entityId: string,
    entityType: 'AD' | 'SUBSCRIPTION',
    userAgent?: string,
    ipAddress?: string
  ): Promise<void> {
    await this.log({
      userId,
      action: 'PROMOTION_VIEW',
      entityId,
      entityType,
      details: {
        viewedAt: new Date().toISOString(),
      },
      userAgent,
      ipAddress,
    });
  }

  // Get audit trail for a specific user's promotions
  static async getUserPromotionAudit(userId: string, limit: number = 50) {
    try {
      return await prisma.auditLog.findMany({
        where: {
          userId,
          action: {
            in: ['BOOST_CREATED', 'BOOST_EXPIRED', 'SUBSCRIPTION_PURCHASED', 'SUBSCRIPTION_CANCELLED'],
          },
        },
        orderBy: {
          timestamp: 'desc',
        },
        take: limit,
      });
    } catch (error) {
      console.error('Failed to get user promotion audit:', error);
      return [];
    }
  }

  // Get boost analytics for business intelligence
  static async getBoostAnalytics(dateFrom: Date, dateTo: Date) {
    try {
      return await prisma.auditLog.groupBy({
        by: ['action'],
        where: {
          action: {
            in: ['BOOST_CREATED', 'SUBSCRIPTION_PURCHASED'],
          },
          timestamp: {
            gte: dateFrom,
            lte: dateTo,
          },
        },
        _count: {
          _all: true,
        },
      });
    } catch (error) {
      console.error('Failed to get boost analytics:', error);
      return [];
    }
  }
}