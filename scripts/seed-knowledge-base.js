const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedKnowledgeBase() {
  try {
    // Find the admin user to create articles
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@agromarket.ng' }
    });

    if (!admin) {
      console.log('Admin user not found. Please create the admin persona first.');
      return;
    }

    console.log('Found admin user:', admin.name, 'ID:', admin.id);

    // Sample knowledge base articles
    const articles = [
      {
        title: "How to handle customer refund requests",
        content: `This guide explains the process for handling customer refund requests in accordance with our company policy.

## Policy Overview

Our refund policy allows customers to request refunds within 30 days of purchase for any reason. After 30 days, refunds are only provided for defective products or services.

## Steps to Process a Refund

1. Verify the purchase date and order details
2. Determine if the request falls within the 30-day window
3. Check if the product was returned (if applicable)
4. Process the refund through the payment system
5. Send confirmation email to the customer

## Special Cases

- For subscription services, prorate the refund based on usage
- For digital products, ensure the product access has been revoked
- For high-value refunds (over $500), get manager approval

## Documentation

Always document the reason for the refund in the customer's account notes and in the refund processing system.`,
        category: "customer-service",
        tags: ["refunds", "customer-service", "payments"]
      },
      {
        title: "Troubleshooting common technical issues",
        content: `This article covers the most common technical issues reported by customers and how to resolve them.

## Login Problems

- **Issue**: Customer cannot log in
- **Solution**: Reset password, check email verification status, verify account hasn't been locked due to multiple failed attempts

## Payment Processing Errors

- **Issue**: Payment declined
- **Solution**: Verify card details, check for sufficient funds, ensure billing address matches card information

## Mobile App Crashes

- **Issue**: App closes unexpectedly
- **Solution**: Check app version, suggest reinstalling, verify device compatibility

## Website Loading Issues

- **Issue**: Website doesn't load or loads partially
- **Solution**: Clear browser cache, try different browser, check internet connection

## Account Synchronization Problems

- **Issue**: Data not syncing between devices
- **Solution**: Verify sync is enabled, check last sync time, ensure all devices are using the same account`,
        category: "technical",
        tags: ["troubleshooting", "login", "payments", "mobile", "sync"]
      },
      {
        title: "Product pricing and subscription plans",
        content: `This document outlines our current pricing structure and subscription plans.

## Basic Plan - $9.99/month

- Access to core features
- 5GB storage
- Email support
- 1 user account

## Professional Plan - $24.99/month

- All Basic features
- 25GB storage
- Priority email support
- 5 user accounts
- Advanced analytics

## Enterprise Plan - $99.99/month

- All Professional features
- 100GB storage
- 24/7 phone and email support
- Unlimited user accounts
- Custom integrations
- Dedicated account manager

## Annual Discounts

All plans offer a 20% discount when billed annually.

## Special Promotions

- New customers: 30-day free trial of any plan
- Referral program: One month free for each successful referral
- Nonprofit organizations: 50% discount on all plans`,
        category: "billing",
        tags: ["pricing", "subscriptions", "plans", "billing"]
      },
      {
        title: "Agricultural product listing guidelines",
        content: `This guide helps agents assist farmers with creating effective product listings on our agricultural marketplace.

## Required Information

### Basic Details
- Product name and variety
- Quantity available
- Unit of measurement (kg, tons, pieces, etc.)
- Price per unit
- Harvest/production date

### Product Description
- Quality grade or certification
- Growing method (organic, conventional, greenhouse, etc.)
- Storage conditions
- Packaging details

## Photography Guidelines

### Image Requirements
- Minimum 3 high-quality photos
- Natural lighting preferred
- Show product from multiple angles
- Include packaging if applicable

### Quality Standards
- Resolution: Minimum 1024x768 pixels
- Format: JPG, PNG, or WebP
- Clear, unblurred images
- No watermarks or text overlays

## Pricing Best Practices

### Market Research
- Check competitor pricing in your region
- Consider seasonal price fluctuations
- Factor in transportation costs

### Pricing Strategy
- Start with competitive pricing
- Offer bulk discounts for large orders
- Consider premium pricing for organic/certified products

## Common Issues and Solutions

### Low Visibility
- Add more relevant keywords to title and description
- Upload additional high-quality photos
- Respond quickly to customer inquiries

### Few Inquiries
- Review pricing compared to similar products
- Improve product description with more details
- Add certifications or quality badges`,
        category: "product",
        tags: ["listings", "agriculture", "farmers", "marketplace", "guidelines"]
      },
      {
        title: "Handling agricultural payment disputes",
        content: `Guidelines for resolving payment issues specific to agricultural transactions.

## Common Payment Issues in Agriculture

### Seasonal Payment Delays
- Many farmers have cash flow tied to harvest cycles
- Payment terms may need to be flexible
- Consider partial payments with agreed schedule

### Quality Disputes
- Product quality may differ from expectations
- Weather conditions can affect produce quality
- Document quality standards in advance

## Resolution Process

### Step 1: Understand the Issue
- Listen to both buyer and seller perspectives
- Review original listing and communication
- Check payment terms and conditions

### Step 2: Mediate Discussion
- Facilitate communication between parties
- Focus on finding mutually acceptable solution
- Document all agreements reached

### Step 3: Implement Solution
- Process refunds or partial payments as agreed
- Update transaction records
- Follow up to ensure satisfaction

## Prevention Strategies

### Clear Listing Requirements
- Detailed product descriptions
- Quality standards and grading
- Clear payment terms
- Return/refund policies

### Communication Best Practices
- Encourage direct communication between parties
- Provide translation services when needed
- Document all agreements

### Platform Protections
- Escrow services for large transactions
- Quality guarantee programs
- Dispute resolution procedures`,
        category: "billing",
        tags: ["payments", "disputes", "agriculture", "refunds", "quality"]
      },
      {
        title: "Supporting rural farmers with technology",
        content: `Guide for helping farmers who may be less familiar with digital platforms.

## Common Challenges

### Limited Internet Access
- Slow or unreliable connections
- Mobile data limitations
- Preference for phone communication

### Technology Familiarity
- May be new to online marketplaces
- Prefer simple, straightforward processes
- Need step-by-step guidance

## Support Strategies

### Communication Preferences
- Offer phone support when possible
- Use simple, clear language
- Be patient and understanding
- Repeat instructions when needed

### Technical Assistance
- Guide through account setup process
- Help with photo uploading
- Explain search and filtering features
- Demonstrate messaging system

### Educational Resources
- Create video tutorials with local language support
- Provide printed guides for offline reference
- Organize community training sessions
- Partner with agricultural extension services

## Best Practices

### Onboarding New Farmers
- Assign dedicated support agent initially
- Schedule follow-up calls after first listing
- Provide success metrics and feedback
- Connect with successful farmer mentors

### Ongoing Support
- Regular check-ins during growing season
- Proactive assistance during busy periods
- Seasonal reminders and tips
- Community building activities

### Accessibility Features
- Large text options
- Voice guidance where possible
- Simple navigation
- Offline capability for key features`,
        category: "general",
        tags: ["farmers", "rural", "technology", "support", "accessibility"]
      }
    ];

    // Create all articles
    for (let articleData of articles) {
      const article = await prisma.knowledgeArticle.create({
        data: {
          ...articleData,
          createdBy: admin.id
        }
      });
      console.log(`Created article: "${article.title}"`);
    }

    console.log('✅ Knowledge base seeded successfully!');
    console.log(`📚 Created ${articles.length} knowledge base articles`);
    console.log('📊 Categories:');

    const categoryCounts = {};
    articles.forEach(article => {
      categoryCounts[article.category] = (categoryCounts[article.category] || 0) + 1;
    });

    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`   - ${category}: ${count} articles`);
    });

  } catch (error) {
    console.error('Error seeding knowledge base:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedKnowledgeBase();