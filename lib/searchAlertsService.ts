import prisma from '@/lib/prisma';

export interface SearchMatch {
  savedSearchId: string;
  adId: string;
  adTitle: string;
  adPrice: number;
  adLocation: string;
  adCategory: string;
}

export class SearchAlertsService {
  /**
   * Check for new ads that match saved searches with alerts enabled
   * This would typically be called by a cron job or background worker
   */
  static async checkForNewMatches(): Promise<SearchMatch[]> {
    try {
      // Get all saved searches with alerts enabled
      const savedSearches = await prisma.savedSearch.findMany({
        where: {
          alertsEnabled: true
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        }
      });

      if (savedSearches.length === 0) {
        return [];
      }

      const matches: SearchMatch[] = [];

      // Check each saved search against recent ads
      for (const savedSearch of savedSearches) {
        const recentAds = await prisma.ad.findMany({
          where: {
            // Only check ads created after the last alert was sent, or in the last 24 hours
            createdAt: {
              gt: savedSearch.lastAlertAt || new Date(Date.now() - 24 * 60 * 60 * 1000)
            },
            status: 'Active',
            // Text search in title and description
            OR: [
              {
                title: {
                  contains: savedSearch.query,
                  mode: 'insensitive'
                }
              },
              {
                description: {
                  contains: savedSearch.query,
                  mode: 'insensitive'
                }
              }
            ],
            // Apply category filter if specified
            ...(savedSearch.category && {
              category: savedSearch.category
            }),
            // Apply location filter if specified
            ...(savedSearch.location && {
              location: {
                contains: savedSearch.location,
                mode: 'insensitive'
              }
            }),
            // Apply price filters if specified
            ...(savedSearch.priceMin && {
              price: {
                gte: savedSearch.priceMin
              }
            }),
            ...(savedSearch.priceMax && {
              price: {
                lte: savedSearch.priceMax
              }
            }),
            // Exclude ads from the same user
            userId: {
              not: savedSearch.userId
            }
          },
          select: {
            id: true,
            title: true,
            price: true,
            location: true,
            category: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Limit to prevent spam
        });

        // Add matches to the results
        for (const ad of recentAds) {
          matches.push({
            savedSearchId: savedSearch.id,
            adId: ad.id,
            adTitle: ad.title,
            adPrice: Number(ad.price),
            adLocation: ad.location,
            adCategory: ad.category
          });
        }
      }

      return matches;
    } catch (error) {
      console.error('Error checking for search matches:', error);
      return [];
    }
  }

  /**
   * Send alert notifications for matches
   */
  static async sendAlertNotifications(matches: SearchMatch[]): Promise<void> {
    try {
      if (matches.length === 0) return;

      // Group matches by saved search
      const matchesBySearch = matches.reduce((acc, match) => {
        if (!acc[match.savedSearchId]) {
          acc[match.savedSearchId] = [];
        }
        acc[match.savedSearchId].push(match);
        return acc;
      }, {} as Record<string, SearchMatch[]>);

      // Process each saved search's matches
      for (const [savedSearchId, searchMatches] of Object.entries(matchesBySearch)) {
        // Get the saved search details
        const savedSearch = await prisma.savedSearch.findUnique({
          where: { id: savedSearchId },
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true
              }
            }
          }
        });

        if (!savedSearch) continue;

        // Create notifications in database
        for (const match of searchMatches) {
          await prisma.notification.create({
            data: {
              userId: savedSearch.userId,
              title: 'New Ad Matches Your Search!',
              message: `New ad "${match.adTitle}" matches your saved search "${savedSearch.query}"`,
              type: 'search_alert',
              metadata: {
                adId: match.adId,
                savedSearchId: savedSearchId,
                adPrice: match.adPrice,
                adLocation: match.adLocation
              }
            }
          });

          // Record that we sent an alert for this match
          await prisma.searchAlert.create({
            data: {
              savedSearchId: savedSearchId,
              adId: match.adId
            }
          });
        }

        // Update the last alert time for this saved search
        await prisma.savedSearch.update({
          where: { id: savedSearchId },
          data: {
            lastAlertAt: new Date()
          }
        });
      }

      console.log(`Sent ${matches.length} search alert notifications`);
    } catch (error) {
      console.error('Error sending alert notifications:', error);
    }
  }

  /**
   * Main function to run the complete search alerts process
   * This should be called by a cron job every few minutes
   */
  static async processSearchAlerts(): Promise<void> {
    console.log('Processing search alerts...');

    const matches = await this.checkForNewMatches();

    if (matches.length > 0) {
      console.log(`Found ${matches.length} new matches for saved searches`);
      await this.sendAlertNotifications(matches);
    } else {
      console.log('No new matches found');
    }
  }
}