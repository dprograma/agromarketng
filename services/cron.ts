import cron from 'node-cron';

export function initCronJobs() {
  // Run every day at midnight
  cron.schedule('0 0 * * *', async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/cron/check-subscriptions`,
        {
          headers: {
            'Authorization': `Bearer ${process.env.CRON_SECRET}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to check subscriptions');
      }

      const data = await response.json();
      console.log('Cron job completed:', data);
    } catch (error) {
      console.error('Cron job failed:', error);
    }
  });
}