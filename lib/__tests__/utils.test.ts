import { formatCurrency } from '../utils';

describe('formatCurrency', () => {
  it('should format a number as currency with default currency symbol', () => {
    const amount = 1000;
    const formattedAmount = formatCurrency(amount);
    expect(formattedAmount).toBe('₦1,000');
  });

  it('should format a number as currency with a custom currency symbol', () => {
    const amount = 2500.50;
    const currency = '$';
    const formattedAmount = formatCurrency(amount, currency);
    expect(formattedAmount).toBe('$2,500.5');
  });

  it('should handle zero amount', () => {
    const amount = 0;
    const formattedAmount = formatCurrency(amount);
    expect(formattedAmount).toBe('₦0');
  });

  it('should handle large numbers', () => {
    const amount = 1000000;
    const formattedAmount = formatCurrency(amount);
    expect(formattedAmount).toBe('₦1,000,000');
  });
});