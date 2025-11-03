// src/common/utils/date.util.service.ts

import { format, isFuture, parseISO, differenceInDays } from 'date-fns';

export class DateUtil {
  /**
   * Định dạng đối tượng Date hoặc chuỗi ISO thành chuỗi ngày tháng dễ đọc.
   * @param date - Đối tượng Date hoặc chuỗi ISO 8601.
   * @param formatStr - Chuỗi định dạng (ví dụ: 'yyyy-MM-dd', 'dd/MM/yyyy HH:mm').
   * @returns Chuỗi ngày tháng đã được định dạng.
   */
  static formatDate(
    date: Date | string,
    formatStr: string = 'dd/MM/yyyy',
  ): string {
    if (typeof date === 'string') {
      try {
        date = parseISO(date); // Chuyển chuỗi ISO thành đối tượng Date
      } catch (error) {
        return 'Invalid Date';
      }
    }
    return format(date, formatStr);
  }

  /**
   * Kiểm tra xem một ngày có nằm trong tương lai hay không.
   * @param date - Đối tượng Date hoặc chuỗi ISO 8601.
   * @returns boolean.
   */
  static isDateInFuture(date: Date | string): boolean {
    if (typeof date === 'string') {
      date = parseISO(date);
    }
    return isFuture(date);
  }

  /**
   * Tính số ngày chênh lệch giữa hai ngày.
   * @param dateLeft - Ngày đầu tiên.
   * @param dateRight - Ngày thứ hai.
   * @returns Số ngày chênh lệch (có thể là số âm).
   */
  static differenceInDays(
    dateLeft: Date | string,
    dateRight: Date | string = new Date(),
  ): number {
    const d1 = typeof dateLeft === 'string' ? parseISO(dateLeft) : dateLeft;
    const d2 = typeof dateRight === 'string' ? parseISO(dateRight) : dateRight;
    return differenceInDays(d1, d2);
  }
}
