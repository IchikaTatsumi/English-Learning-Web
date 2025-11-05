import {
  format,
  isFuture,
  parseISO,
  differenceInDays,
  isValid,
} from 'date-fns';

export class DateUtil {
  private static parseDate(date: Date | string): Date | null {
    try {
      const parsed = typeof date === 'string' ? parseISO(date) : date;
      return isValid(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  static formatDate(
    date: Date | string,
    formatStr: string = 'dd/MM/yyyy',
  ): string {
    const parsedDate = this.parseDate(date);
    if (!parsedDate) {
      return 'Invalid Date';
    }

    try {
      return format(parsedDate, formatStr);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  }

  static isDateInFuture(date: Date | string): boolean {
    const parsedDate = this.parseDate(date);
    if (!parsedDate) {
      return false;
    }

    try {
      return isFuture(parsedDate);
    } catch (error) {
      console.error('Error checking if date is in future:', error);
      return false;
    }
  }

  static differenceInDays(
    dateLeft: Date | string,
    dateRight: Date | string = new Date(),
  ): number {
    const d1 = this.parseDate(dateLeft);
    const d2 = this.parseDate(dateRight);

    if (!d1 || !d2) {
      return 0;
    }

    try {
      return differenceInDays(d1, d2);
    } catch (error) {
      console.error('Error calculating difference in days:', error);
      return 0;
    }
  }
}
