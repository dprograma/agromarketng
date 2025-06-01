import {
    createNotification,
    createAdApprovalNotification,
    createPromotionExpiryNotification,
    createPaymentSuccessNotification,
    createPaymentFailureNotification,
    markNotificationsAsRead,
    getUnreadNotificationCount,
    sendRealTimeNotification,
    broadcastNotification,
} from '../notifications';
import prisma from '../prisma'; // Assuming prisma client is used
// import { io } from 'socket.io-client'; // Assuming socket.io-client is used

// Mock prisma client
jest.mock('../prisma', () => ({
    __esModule: true,
    default: {
        notification: {
            create: jest.fn(),
            updateMany: jest.fn(),
            count: jest.fn(),
        },
        $transaction: jest.fn(),
    },
}));

// Mock socket.io server
const mockEmit = jest.fn();
const mockTo = jest.fn(() => ({ emit: mockEmit }));
const mockIoServer = { to: mockTo };
jest.mock('socket.io', () => ({
    __esModule: true,
    Server: jest.fn(() => mockIoServer),
    // Also export a default if the import is default
    default: mockIoServer,
}));

const mockPrisma = prisma as jest.Mocked<typeof import('../prisma').default>;

describe('notifications', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockTo.mockClear();
        mockEmit.mockClear();
        // Mocks are reset by jest.clearAllMocks() and defined in jest.mock
    });

    describe('createNotification', () => {
        it('should create a notification in the database', async () => {
            const notificationData = {
                userId: 'user123',
                type: 'ad_approved',
                message: 'Your ad has been approved',
            };
            // Mock the return value to include read and createdAt, as the function adds them
            const mockReturnValue = {
                id: 'notif1',
                ...notificationData,
                read: false,
                createdAt: new Date(),
                time: 'less than a minute ago', // Add time field as it appears in error output
            };
            (mockPrisma.notification.create as jest.Mock).mockResolvedValue(mockReturnValue);

            await createNotification(
                notificationData.userId,
                notificationData.type,
                notificationData.message
            );

            // Expect only the input data to be passed to prisma.notification.create
            expect(mockPrisma.notification.create).toHaveBeenCalledWith({
                data: {
                    userId: notificationData.userId,
                    type: notificationData.type,
                    message: notificationData.message,
                },
            });
        });
    });

    describe('createAdApprovalNotification', () => {
        it('should call createNotification with correct parameters', async () => {
            const userId = 'user123';
            const adTitle = 'My Awesome Ad';
            const expectedMessage = `Your ad "${adTitle}" has been approved.`;

            // Spy on createNotification and mock its return value
            const createNotificationSpy = jest.spyOn(require('../notifications'), 'createNotification').mockResolvedValue({
                userId,
                type: 'ad_approved',
                message: expectedMessage,
                read: false,
                createdAt: new Date(),
                time: 'less than a minute ago',
                id: 'mock-notif-ad',
            });

            await createAdApprovalNotification(userId, adTitle);

            expect(createNotificationSpy).toHaveBeenCalledWith(
                userId,
                'ad_approved',
                expectedMessage
            );
            createNotificationSpy.mockRestore(); // Restore the original function
        });
    });

    describe('createPromotionExpiryNotification', () => {
        it('should call createNotification with correct parameters', async () => {
            const userId = 'user123';
            const daysLeft = 3;
            const expectedMessage = `Your promotion is expiring in ${daysLeft} days.`;

            // Spy on createNotification and mock its return value
            const createNotificationSpy = jest.spyOn(require('../notifications'), 'createNotification').mockResolvedValue({
                userId,
                type: 'promotion_expiry',
                message: expectedMessage,
                read: false,
                createdAt: new Date(),
                time: 'less than a minute ago',
                id: 'mock-notif-promo',
            });

            await createPromotionExpiryNotification(userId, daysLeft);

            expect(createNotificationSpy).toHaveBeenCalledWith(
                userId,
                'promotion_expiry',
                expectedMessage
            );
            createNotificationSpy.mockRestore(); // Restore the original function
        });
    });

    describe('createPaymentSuccessNotification', () => {
        it('should call createNotification with correct parameters', async () => {
            const userId = 'user123';
            const item = 'Premium Plan';
            const expectedMessage = `Your payment for "${item}" was successful.`;

            // Spy on createNotification and mock its return value
            const createNotificationSpy = jest.spyOn(require('../notifications'), 'createNotification').mockResolvedValue({
                userId,
                type: 'payment_success',
                message: expectedMessage,
                read: false,
                createdAt: new Date(),
                time: 'less than a minute ago',
                id: 'mock-notif-paysuccess',
            });

            await createPaymentSuccessNotification(userId, item);

            expect(createNotificationSpy).toHaveBeenCalledWith(
                userId,
                'payment_success',
                expectedMessage
            );
            createNotificationSpy.mockRestore(); // Restore the original function
        });
    });

    describe('createPaymentFailureNotification', () => {
        it('should call createNotification with correct parameters', async () => {
            const userId = 'user123';
            const item = 'Premium Plan';
            const expectedMessage = `Your payment for "${item}" failed. Please try again.`;

            // Spy on createNotification and mock its return value
            const createNotificationSpy = jest.spyOn(require('../notifications'), 'createNotification').mockResolvedValue({
                userId,
                type: 'payment_failure',
                message: expectedMessage,
                read: false,
                createdAt: new Date(),
                time: 'less than a minute ago',
                id: 'mock-notif-payfail',
            });

            await createPaymentFailureNotification(userId, item);

            expect(createNotificationSpy).toHaveBeenCalledWith(
                userId,
                'payment_failure',
                expectedMessage
            );
            createNotificationSpy.mockRestore(); // Restore the original function
        });
    });

    describe('markNotificationsAsRead', () => {
        it('should update notifications as read for a user and given IDs', async () => {
            const userId = 'user123';
            const notificationIds = ['notif1', 'notif2'];

            await markNotificationsAsRead(userId, notificationIds);

            expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
                where: {
                    userId: userId,
                    id: {
                        in: notificationIds,
                    },
                },
                data: {
                    read: true,
                },
            });
        });

        it('should not call updateMany if notificationIds array is empty', async () => {
            const userId = 'user123';
            const notificationIds: string[] = [];

            await markNotificationsAsRead(userId, notificationIds);

            expect(mockPrisma.notification.updateMany).not.toHaveBeenCalled();
        });
    });

    describe('getUnreadNotificationCount', () => {
        it('should return the count of unread notifications for a user', async () => {
            const userId = 'user123';
            const unreadCount = 5;
            (mockPrisma.notification.count as jest.Mock).mockResolvedValue(unreadCount);

            const result = await getUnreadNotificationCount(userId);

            expect(result).toBe(unreadCount);
            expect(mockPrisma.notification.count).toHaveBeenCalledWith({
                where: {
                    userId: userId,
                    read: false,
                },
            });
        });
    });

    describe('sendRealTimeNotification', () => {
        it('should emit a "new_notification" event to the specified user', async () => {
            const userId = 'user123';
            const notificationData = {
                type: 'test',
                message: 'This is a test',
                time: 'less than a minute ago', // Use the format seen in the error output
            };
            // Mock createNotification to return a notification object
            jest.spyOn(require('../notifications'), 'createNotification').mockResolvedValue({
                userId,
                type: notificationData.type,
                message: notificationData.message,
                read: false,
                createdAt: new Date(),
                time: notificationData.time,
            });

            // Use the mocked io server directly
            await sendRealTimeNotification(mockIoServer as any, userId, notificationData.type, notificationData.message, notificationData.time);

            expect(mockTo).toHaveBeenCalledWith(`user_${userId}`); // Ensure io.to was called with the correct user ID
            expect(mockEmit).toHaveBeenCalledWith('notification_received', expect.objectContaining({
                userId,
                type: notificationData.type,
                message: notificationData.message,
            }));
            // Restore the spy after the test
            (require('../notifications').createNotification as jest.Mock).mockRestore();
        });
    });

    describe('broadcastNotification', () => {
        it('should emit a "notification_received" event to specified users if userIds are provided', async () => {
            const notificationData = {
                type: 'broadcast',
                message: 'Important announcement',
                userIds: ['user1', 'user2'],
            };

            // Mock createNotification for broadcast test
            jest.spyOn(require('../notifications'), 'createNotification').mockImplementation(async (userId, type, message) => ({
                userId, type, message, read: false, createdAt: new Date(), id: `mock-notif-${userId}`, time: 'less than a minute ago' // Add time field
            }));

            // Use the mocked io server directly
            await broadcastNotification(mockIoServer as any, notificationData.userIds, notificationData.type, notificationData.message);

            // Expect io.to and emit to be called for each user
            expect(mockTo).toHaveBeenCalledWith('user_user1');
            expect(mockEmit).toHaveBeenCalledWith('notification_received', expect.objectContaining({
                userId: 'user1',
                type: notificationData.type,
                message: notificationData.message,
            }));

            expect(mockTo).toHaveBeenCalledWith('user_user2');
            expect(mockEmit).toHaveBeenCalledWith('notification_received', expect.objectContaining({
                userId: 'user2',
                type: notificationData.type,
                message: notificationData.message,
            }));
            // Restore the spy after the test
            (require('../notifications').createNotification as jest.Mock).mockRestore();
        });

        it('should not emit any events if userIds array is empty', async () => {
            const notificationData = {
                type: 'broadcast',
                message: 'Important announcement',
                userIds: [],
            };

            // Mock createNotification
            jest.spyOn(require('../notifications'), 'createNotification').mockResolvedValue(undefined);

            // Use the mocked io server directly
            await broadcastNotification(mockIoServer as any, notificationData.userIds, notificationData.type, notificationData.message);

            expect(mockTo).not.toHaveBeenCalled();
            expect(mockEmit).not.toHaveBeenCalled();
            // Restore the spy after the test
            (require('../notifications').createNotification as jest.Mock).mockRestore();
        });
    });


});