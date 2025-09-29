import { LogEntry, EmailStats } from './types';

export class Logger {
  private logs: LogEntry[] = [];
  private stats: EmailStats = {
    totalSent: 0,
    totalFailed: 0,
    totalRetries: 0,
    averageDeliveryTime: 0,
    byTemplate: {},
    byDay: {}
  };
  private deliveryTimes: number[] = [];

  constructor(private maxLogs: number = 1000) {}

  info(message: string, data?: any): void {
    this.addLog('info', message, data);

    if (data?.duration && !data?.error) {
      this.updateStats('sent', data.duration, data.template);
    }
  }

  warn(message: string, data?: any): void {
    this.addLog('warn', message, data);
  }

  error(message: string, data?: any): void {
    this.addLog('error', message, data);

    if (data?.attempt && data.attempt > 1) {
      this.stats.totalRetries++;
    }

    if (data?.error) {
      this.updateStats('failed', 0, data.template);
    }
  }

  private addLog(level: LogEntry['level'], message: string, data?: any): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data
    };

    this.logs.push(entry);

    // Keep only the latest maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      const logData = data ? JSON.stringify(data, null, 2) : '';
      console.log(`[EmailService ${level.toUpperCase()}] ${message}`, logData);
    }
  }

  private updateStats(type: 'sent' | 'failed', duration: number, template?: string): void {
    const today = new Date().toISOString().split('T')[0];

    if (type === 'sent') {
      this.stats.totalSent++;
      this.stats.lastSent = new Date().toISOString();

      // Track delivery times for average calculation
      this.deliveryTimes.push(duration);
      if (this.deliveryTimes.length > 100) {
        this.deliveryTimes = this.deliveryTimes.slice(-100); // Keep last 100
      }
      this.stats.averageDeliveryTime =
        this.deliveryTimes.reduce((a, b) => a + b, 0) / this.deliveryTimes.length;

      // Update daily stats
      if (!this.stats.byDay[today]) {
        this.stats.byDay[today] = { sent: 0, failed: 0 };
      }
      this.stats.byDay[today].sent++;

    } else if (type === 'failed') {
      this.stats.totalFailed++;

      // Update daily stats
      if (!this.stats.byDay[today]) {
        this.stats.byDay[today] = { sent: 0, failed: 0 };
      }
      this.stats.byDay[today].failed++;
    }

    // Update template stats
    if (template) {
      if (!this.stats.byTemplate[template]) {
        this.stats.byTemplate[template] = { sent: 0, failed: 0 };
      }

      if (type === 'sent') {
        this.stats.byTemplate[template].sent++;
      } else {
        this.stats.byTemplate[template].failed++;
      }
    }

    // Clean up old daily stats (keep last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

    Object.keys(this.stats.byDay).forEach(date => {
      if (date < cutoffDate) {
        delete this.stats.byDay[date];
      }
    });
  }

  getLogs(level?: LogEntry['level'], limit?: number): LogEntry[] {
    let filteredLogs = this.logs;

    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }

    if (limit) {
      filteredLogs = filteredLogs.slice(-limit);
    }

    return filteredLogs.reverse(); // Most recent first
  }

  getStats(): EmailStats {
    return { ...this.stats };
  }

  clearLogs(): void {
    this.logs = [];
  }

  clearStats(): void {
    this.stats = {
      totalSent: 0,
      totalFailed: 0,
      totalRetries: 0,
      averageDeliveryTime: 0,
      byTemplate: {},
      byDay: {}
    };
    this.deliveryTimes = [];
  }

  // Export logs for external monitoring/alerting
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      const headers = 'timestamp,level,message,data';
      const rows = this.logs.map(log =>
        `${log.timestamp},${log.level},"${log.message}","${JSON.stringify(log.data || {})}"`
      );
      return [headers, ...rows].join('\n');
    }

    return JSON.stringify(this.logs, null, 2);
  }

  // Get recent errors for debugging
  getRecentErrors(limit: number = 10): LogEntry[] {
    return this.getLogs('error', limit);
  }

  // Health check - returns true if error rate is acceptable
  isHealthy(errorThreshold: number = 0.1): boolean {
    const total = this.stats.totalSent + this.stats.totalFailed;
    if (total === 0) return true;

    const errorRate = this.stats.totalFailed / total;
    return errorRate <= errorThreshold;
  }
}