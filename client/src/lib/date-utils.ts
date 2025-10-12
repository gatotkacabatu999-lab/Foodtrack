import { differenceInDays, format, isAfter, parseISO } from "date-fns";

export function getDaysUntilExpiry(expiryDate: string | Date): number {
  try {
    const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
    if (isNaN(expiry.getTime())) {
      return 0;
    }
    const today = new Date();
    return differenceInDays(expiry, today);
  } catch (error) {
    return 0;
  }
}

export function getCountdownStatus(daysRemaining: number): 'danger' | 'warning' | 'safe' {
  if (daysRemaining <= 3) return 'danger';
  if (daysRemaining <= 15) return 'warning';
  return 'safe';
}

export function formatExpiryDate(date: string | Date): string {
  try {
    const expiry = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(expiry.getTime())) {
      return 'Invalid date';
    }
    return format(expiry, 'MMM d, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
}

export function formatUploadDate(date: string | Date): string {
  try {
    const uploaded = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(uploaded.getTime())) {
      return 'Invalid date';
    }
    return format(uploaded, 'MMM d, yyyy \'at\' h:mm a');
  } catch (error) {
    return 'Invalid date';
  }
}

export function isExpired(expiryDate: string | Date): boolean {
  try {
    const expiry = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
    if (isNaN(expiry.getTime())) {
      return false;
    }
    return isAfter(new Date(), expiry);
  } catch (error) {
    return false;
  }
}

export function formatDateForInput(date: string | Date | null | undefined): string {
  if (!date) {
    return '';
  }
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    if (isNaN(d.getTime())) {
      return '';
    }
    return format(d, 'yyyy-MM-dd');
  } catch (error) {
    return '';
  }
}

export function getDaysUntilTrashClear(deletedAt: string | Date): number {
  try {
    const deleted = typeof deletedAt === 'string' ? parseISO(deletedAt) : deletedAt;
    if (isNaN(deleted.getTime())) {
      return 0;
    }
    const clearDate = new Date(deleted);
    clearDate.setDate(clearDate.getDate() + 30); // 30 days from deletion
    const today = new Date();
    return differenceInDays(clearDate, today);
  } catch (error) {
    return 0;
  }
}


export function getCalendarDays(year: number, month: number): Array<{ day: number; isCurrentMonth: boolean; date: Date }> {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());
  
  const days = [];
  const currentDate = new Date(startDate);
  
  for (let i = 0; i < 42; i++) {
    days.push({
      day: currentDate.getDate(),
      isCurrentMonth: currentDate.getMonth() === month,
      date: new Date(currentDate)
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return days;
}
