import clsx from "clsx";

export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return clsx(inputs);
}
/**
 * Formats a number as currency with comma separators
 * @param amount - The number to format
 * @param currency - Optional currency symbol (defaults to ₦)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currency: string = '₦'): string {
  return `${currency}${amount.toLocaleString('en-NG')}`;
}