// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parses a date string in "dd/MM/yyyy" format into a Date object.
 * This is crucial for consistent date sorting across different environments.
 */
export const parseDate = (dateString: string): Date => {
  const parts = dateString.split('/');
  if (parts.length !== 3) {
      return new Date(NaN);
  }
  // parts[0] = ngày (dd), parts[1] = tháng (mm), parts[2] = năm (yyyy)
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
};

/**
 * Chuyển đổi một giá trị có thể là string/number/undefined thành number, trả về 0 nếu không hợp lệ.
 */
export const sizeToNumber = (size: string | number | undefined): number => {
  if (typeof size === 'number') return size;
  if (typeof size === 'string') {
    const parts = size.trim().split(/\s+/);
    const rawValue = parts[0]?.replace(',', '.');
    const value = parseFloat(rawValue) || 0;
    
    // Logic cũ của sizeToNumber
    const unit = (parts[1] || "").toUpperCase();
    switch (unit) {
      case "GB": return value * 1024 * 1024 * 1024;
      case "MB":
      case "M": return value * 1024 * 1024;
      case "KB":
      case "K": return value * 1024;
      default: return value;
    }
  }
  return 0;
};

/**
 * Hàm chuyển đổi số bytes thành định dạng có thể đọc (B, KB, MB, GB, v.v.).
 */
export const formatBytes = (bytes: number | string | undefined, decimals = 2): string => {
    const numBytes = sizeToNumber(bytes); 
    
    if (numBytes === 0) {
        return '0 Bytes';
    }

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(numBytes) / Math.log(k));

    return parseFloat((numBytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};