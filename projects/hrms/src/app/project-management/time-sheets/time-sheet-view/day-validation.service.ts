import { Injectable } from "@angular/core";

// day-validation.service.ts
export interface DayStatusResult {
  blocked: boolean;
  blockReason: string | null;
}

export interface ValidationContext {
  selectedResource: any;
  holidays: any[];
  weekends: any[];
  leaves: any[];
}

@Injectable({
  providedIn: 'root'
})
export class DayValidationService {
  private holidaySet: Set<string> = new Set();
  private leaveRanges: Array<{ start: number; end: number }> = [];
  private weekendConfig: Map<string, Set<number>> = new Map();

  /**
   * Initialize validation cache for performance
   */
  initialize(context: ValidationContext): void {
    this.buildHolidaySet(context?.holidays);
    this.buildLeaveRanges(context?.leaves);
    this.buildWeekendConfig(context?.weekends);
  }

  /**
   * Main validation function
   */
  checkDayStatus(date: Date, context: ValidationContext): DayStatusResult {
    const normalizedDate = this.normalizeDate(date);
    const resource = context.selectedResource;
    console.log(resource);
    
    // Priority 1: Resource allocation range
    if (resource?.startDate || resource?.endDate) {
      const resourceStart = resource.startDate ? this.normalizeDate(new Date(resource.startDate)) : null;
      const resourceEnd = resource.endDate ? this.normalizeDate(new Date(resource.endDate)) : null;

      if (resourceStart && normalizedDate < resourceStart) {
        console.log('Day is outside resource allocation period (before start)');
        return { blocked: true, blockReason: 'Outside Resource Allocation Period' };
      }
      if (resourceEnd && normalizedDate > resourceEnd) {
        console.log('Day is outside resource allocation period (after end)');
        return { blocked: true, blockReason: 'Outside Resource Allocation Period' };
      }
    }

    // Priority 2: Phase range
    if (resource?.phase?.startDate || resource?.phase?.endDate) {
      const phaseStart = resource.phase.startDate ? this.normalizeDate(new Date(resource.phase.startDate)) : null;
      const phaseEnd = resource.phase.endDate ? this.normalizeDate(new Date(resource.phase.endDate)) : null;

      if (phaseStart && normalizedDate < phaseStart) {
        console.log('Day is blocked by phase date restriction (before start)');
        return { blocked: true, blockReason: 'Phase Date Restriction' };
      }
      if (phaseEnd && normalizedDate > phaseEnd) {
        console.log('Day is blocked by phase date restriction (after end)');
        return { blocked: true, blockReason: 'Phase Date Restriction' };
      }
    }

    // Priority 3: Project range
    if (resource?.project?.startDate || resource?.project?.endDate) {
      const projectStart = resource.project.startDate ? this.normalizeDate(new Date(resource.project.startDate)) : null;
      const projectEnd = resource.project.endDate ? this.normalizeDate(new Date(resource.project.endDate)) : null;

      if (projectStart && normalizedDate < projectStart) {
        console.log('Day is outside project period (before start)');
        return { blocked: true, blockReason: 'Outside Project Period' };
      }
      if (projectEnd && normalizedDate > projectEnd) {
        console.log('Day is outside project period (after end)');
        return { blocked: true, blockReason: 'Outside Project Period' };
      }
    }

    // Priority 4: Holiday check (fast Set lookup)
    const dateKey = this.getDateKey(normalizedDate);
    if (this.holidaySet.has(dateKey)) {
      console.log('Day is blocked due to holiday');
      return { blocked: true, blockReason: 'Holiday' };
    }

    // Priority 5: Leave check
    const dateTime = normalizedDate.getTime();
    for (const leave of this.leaveRanges) {
      if (dateTime >= leave.start && dateTime <= leave.end) {
        console.log('Day is blocked due to leave');
        return { blocked: true, blockReason: 'Leave' };
      }
    }

    // Priority 6: Weekend check
    const isWeekend = this.isConfiguredWeekend(normalizedDate);
    if (isWeekend) {
      const projectAllowsWeekend = resource?.project?.isWeekendAllowed ?? false;
      const resourceAllowsWeekend = resource?.weekendWorkAllowed ?? false;

      if (!projectAllowsWeekend && !resourceAllowsWeekend) {
        console.log('Day is blocked due to weekend');
        return { blocked: true, blockReason: 'Weekend' };
      }
    }

    return { blocked: false, blockReason: null };
  }

  /**
   * Normalize date to midnight UTC to avoid timezone issues
   */
 /**
 * Normalize date safely without timezone shifting
 * Works for both ISO string and Date object
 */
private normalizeDate(dateInput: string | Date): Date {
  if (!dateInput) return null as any;

  // If already Date object
  if (dateInput instanceof Date) {
    return new Date(
      dateInput.getFullYear(),
      dateInput.getMonth(),
      dateInput.getDate()
    );
  }

  // If ISO string (2026-02-01T00:00:00)
  const datePart = dateInput.split('T')[0];
  const [year, month, day] = datePart.split('-').map(Number);

  return new Date(year, month - 1, day);
}
  /**
   * Build holiday Set for O(1) lookup
   */
  private buildHolidaySet(holidays: any[]): void {
    this.holidaySet.clear();
    if (!holidays || !Array.isArray(holidays)) return;

    holidays.forEach(holiday => {
      if (holiday.status === 'Published' && holiday.holidayDate) {
        const date = this.normalizeDate(new Date(holiday.holidayDate));
        this.holidaySet.add(this.getDateKey(date));
      
        
      }
    });
  }

  /**
   * Build leave ranges for efficient range checking
   */
  private buildLeaveRanges(leaves: any[]): void {
    this.leaveRanges = [];
    if (!leaves || !Array.isArray(leaves)) return;

    leaves.forEach(leave => {
      if (leave.startDate && leave.endDate) {
        const start = this.normalizeDate(new Date(leave.startDate));
        const end = this.normalizeDate(new Date(leave.endDate));
        this.leaveRanges.push({
          start: start.getTime(),
          end: end.getTime()
        });
      }
    });
  }

  /**
   * Build weekend configuration map
   * Key: weekday name (e.g., "Sunday")
   * Value: Set of week numbers (1-5)
   */
  private buildWeekendConfig(weekends: any[]): void {
  
    this.weekendConfig.clear();
    if (!weekends || !Array.isArray(weekends)) return;

    weekends.forEach(weekend => {
      const weekday = weekend.weekday;
      if (!weekday) return;

      const weeks = new Set<number>();

      if (weekend.firstweek) weeks.add(1);
      if (weekend.secondweek) weeks.add(2);
      if (weekend.thirdweek) weeks.add(3);
      if (weekend.fourthweek) weeks.add(4);
      if (weekend.fifthweek) weeks.add(5);

      if (weeks.size > 0) {
        this.weekendConfig.set(weekday, weeks);
      }
    });
  }

  /**
   * Check if date is a configured weekend
   */
  private isConfiguredWeekend(date: Date): boolean {
    const weekdayName = this.getWeekdayName(date);
    const weekOfMonth = this.getWeekOfMonth(date);

    const configuredWeeks = this.weekendConfig.get(weekdayName);
    if (!configuredWeeks) return false;

    return configuredWeeks.has(weekOfMonth);
  }

  /**
   * Get weekday name (Sunday, Monday, etc.)
   */
  private getWeekdayName(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  /**
   * Calculate week of month (1-5)
   */
  private getWeekOfMonth(date: Date): number {
    const dayOfMonth = date.getDate();
    return Math.ceil(dayOfMonth / 7);
  }

  /**
   * Generate date key for Set lookup (YYYY-MM-DD)
   */
  private getDateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Clear all caches
   */
  clear(): void {
    this.holidaySet.clear();
    this.leaveRanges = [];
    this.weekendConfig.clear();
  }
}
