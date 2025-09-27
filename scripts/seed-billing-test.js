const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedBillingTestData() {
  try {
    // Find Sarah Adebayo's user record
    const user = await prisma.user.findUnique({
      where: { email: 'sarah.farmer@agromarket.ng' }
    });

    if (!user) {
      console.log('Sarah Adebayo user not found');
      return;
    }

    console.log('Found user:', user.name, 'ID:', user.id);

    // Create a subscription plan
    const subscriptionPlan = await prisma.subscriptionPlan.upsert({
      where: { id: 'test-gold-plan' },
      update: {},
      create: {
        id: 'test-gold-plan',
        name: 'Gold',
        price: 4000,
        duration: 30,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        benefits: [
          'Unlimited ad posts',
          'Featured on homepage',
          'Top of category',
          'Ad banners',
          '10% boost discount'
        ],
        features: {
          listingPriority: 2,
          featuredOnHome: true,
          topOfCategory: true,
          adBoostDiscount: 10,
          analyticsAccess: true,
          maxActiveBoosts: -1
        },
        listingPriority: 2
      }
    });

    console.log('Created subscription plan:', subscriptionPlan.name);

    // Add payment methods
    const paymentMethod1 = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        type: 'card',
        provider: 'Visa',
        last4: '4242',
        expiryMonth: 12,
        expiryYear: 2026,
        isDefault: true,
        token: 'test_card_token_1'
      }
    });

    const paymentMethod2 = await prisma.paymentMethod.create({
      data: {
        userId: user.id,
        type: 'paypal',
        provider: 'PayPal',
        email: 'sarah.farmer@paypal.com',
        isDefault: false,
        token: 'test_paypal_token_1'
      }
    });

    console.log('Created payment methods:', paymentMethod1.type, paymentMethod2.type);

    // Create transactions
    const transactions = [
      {
        userId: user.id,
        amount: 4000,
        currency: 'NGN',
        status: 'successful',
        type: 'subscription',
        reference: 'TXN_' + Date.now() + '_1',
        paymentMethod: 'Visa ****4242',
        subscriptionPlanId: subscriptionPlan.id,
        metadata: {
          planName: 'Gold',
          duration: 30
        }
      },
      {
        userId: user.id,
        amount: 1000,
        currency: 'NGN',
        status: 'successful',
        type: 'boost',
        reference: 'TXN_' + Date.now() + '_2',
        paymentMethod: 'PayPal',
        metadata: {
          adId: 'test-ad-1',
          boostType: 'Homepage Feature',
          duration: 7
        }
      },
      {
        userId: user.id,
        amount: 2000,
        currency: 'NGN',
        status: 'successful',
        type: 'boost',
        reference: 'TXN_' + Date.now() + '_3',
        paymentMethod: 'Visa ****4242',
        metadata: {
          adId: 'test-ad-2',
          boostType: 'Top of Category',
          duration: 14
        }
      },
      {
        userId: user.id,
        amount: 500,
        currency: 'NGN',
        status: 'failed',
        type: 'boost',
        reference: 'TXN_' + Date.now() + '_4',
        paymentMethod: 'Visa ****4242',
        metadata: {
          adId: 'test-ad-3',
          boostType: 'Highlighted Listing',
          duration: 7,
          failureReason: 'Insufficient funds'
        }
      }
    ];

    for (let transactionData of transactions) {
      const transaction = await prisma.transaction.create({
        data: transactionData
      });
      console.log('Created transaction:', transaction.reference, transaction.status);
    }

    // Create invoices
    const invoice1 = await prisma.invoice.create({
      data: {
        userId: user.id,
        invoiceNumber: 'INV-' + Date.now() + '-001',
        amount: 4000,
        currency: 'NGN',
        status: 'paid',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        paidDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        subscriptionPlanId: subscriptionPlan.id,
        items: {
          lineItems: [
            {
              description: 'Gold Subscription Plan',
              quantity: 1,
              unitPrice: 4000,
              total: 4000
            }
          ],
          subtotal: 4000,
          tax: 0,
          total: 4000
        }
      }
    });

    const invoice2 = await prisma.invoice.create({
      data: {
        userId: user.id,
        invoiceNumber: 'INV-' + Date.now() + '-002',
        amount: 3000,
        currency: 'NGN',
        status: 'unpaid',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        items: {
          lineItems: [
            {
              description: 'Ad Boost - Homepage Feature',
              quantity: 2,
              unitPrice: 1500,
              total: 3000
            }
          ],
          subtotal: 3000,
          tax: 0,
          total: 3000
        }
      }
    });

    console.log('Created invoices:', invoice1.invoiceNumber, invoice2.invoiceNumber);

    // Update user with subscription
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionPlanId: subscriptionPlan.id
      }
    });

    console.log('✅ Sample billing data created successfully for', user.name);
    console.log('📊 Summary:');
    console.log('- Subscription: Gold Plan');
    console.log('- Payment Methods: 2');
    console.log('- Transactions: 4 (3 successful, 1 failed)');
    console.log('- Invoices: 2 (1 paid, 1 unpaid)');

  } catch (error) {
    console.error('Error seeding billing test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedBillingTestData();