import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TimesheetFilterState {
  dateRange: [Date, Date] | null;
  resourceId: any; // Can be single value or array
  projectId: any[] | null;
  clientId: any[] | null;
  departmentId: any[] | null;
  tmorrmId: any[] | null;
}

@Injectable({
  providedIn: 'root'
})
export class TimesheetFilterService {
  private filterState = new BehaviorSubject<TimesheetFilterState | null>(null);

  getFilters(): Observable<TimesheetFilterState | null> {
    return this.filterState.asObservable();
  }

  getCurrentFilters(): TimesheetFilterState | null {
    return this.filterState.value;
  }

  setFilters(filters: TimesheetFilterState): void {
    this.filterState.next(filters);
  }

  clearFilters(): void {
    this.filterState.next(null);
  }

  clearOnlyFilterFields(): void {
    const current = this.filterState.value;
    if (current) {
      this.filterState.next({
        ...current,
        projectId: null,
        clientId: null,
        departmentId: null,
        tmorrmId: null
      });
    }
  }
}
