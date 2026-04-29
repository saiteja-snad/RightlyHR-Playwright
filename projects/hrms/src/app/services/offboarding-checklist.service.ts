import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ChecklistItem {
  label: string;
  completed: boolean;
  moduleId?: number|null;
  route?: string;
  count?: number;
}

@Injectable({
  providedIn: 'root'
})
export class OffboardingChecklistService {
  private checklistItemsSubject = new BehaviorSubject<ChecklistItem[]>([]);
  public checklistItems$ = this.checklistItemsSubject.asObservable();

  // Default checklist items - centralized definition
  private readonly defaultChecklistItems: ChecklistItem[] = [
    { label: 'Leave Requests', count: 0, route: '/personalinfo/job/employmentType/initate-offboarding/leave-approvals', completed: false, moduleId: environment.leavesModuleId },
    { label: 'WFH Requests', count: 0, route: '/personalinfo/job/employmentType/initate-offboarding/wfh-approvals', completed: false, moduleId: environment.wfhModuleId },
    { label: 'Remote Login Requests', count: 0, route: '/personalinfo/job/employmentType/initate-offboarding/remote-login-approvals', completed: false, moduleId: environment.remoteLoginModuleId },
    { label: 'Comp-Off Requests', count: 0, route: '/personalinfo/job/employmentType/initate-offboarding/compoff-approvals', completed: false, moduleId: environment.compoffModuleId },
    { label: 'Permissions Requests', count: 0, route: '/personalinfo/job/employmentType/initate-offboarding/permissions-approvals', completed: false, moduleId: environment.permissionsModuleId },
    { label: 'Extra Hours Requests', count: 0, route: '/personalinfo/job/employmentType/initate-offboarding/extrahours-approvals', completed: false, moduleId: environment.extraHoursModuleId },
    { label: 'Regularizations Requests', count: 0, route: '/personalinfo/job/employmentType/initate-offboarding/regularization-approvals', completed: false, moduleId: environment.attendanceRegularizationModuleId },
    { label: 'Expense Requests', count: 0, route: '/personalinfo/job/employmentType/initate-offboarding/expenses-approvals', completed: false, moduleId: environment.expensesModuleId },
    { label: 'Employee Info Requests', count: 0, route: '/personalinfo/job/employmentType/initate-offboarding/employee-info-approvals', completed: false, moduleId: environment.pendingapprovalemployeid },
    { label: 'Timesheet Entries Requests', count: 0, route: '/personalinfo/job/employmentType/initate-offboarding/timesheet-approvals', completed: false, moduleId: environment.timesheetModuleId },
  ];

  constructor() { 
    // Initialize with stored data if available, otherwise use default
    this.loadFromStorage();
  }

  // Get the default checklist items (fresh copy)
  getDefaultChecklistItems(): ChecklistItem[] {
    return JSON.parse(JSON.stringify(this.defaultChecklistItems));
  }

  setChecklistItems(items: ChecklistItem[]): void {
    this.checklistItemsSubject.next(items);
    this.saveToStorage(items);
  }

  getChecklistItems(): ChecklistItem[] {
    return this.checklistItemsSubject.value;
  }

  getChecklistItemsObservable(): Observable<ChecklistItem[]> {
    return this.checklistItems$;
  }

  // Initialize with default items
  initializeWithDefaults(): void {
    const defaultItems = this.getDefaultChecklistItems();
    this.setChecklistItems(defaultItems);
  }

  updateChecklistItem(index: number, updatedItem: Partial<ChecklistItem>): void {
    const currentItems = this.getChecklistItems();
    if (index >= 0 && index < currentItems.length) {
      currentItems[index] = { ...currentItems[index], ...updatedItem };
      this.setChecklistItems([...currentItems]);
    }
  }

  updateChecklistItemByModuleId(moduleId: number, updatedItem: Partial<ChecklistItem>): void {
    const currentItems = this.getChecklistItems();
    const index = currentItems.findIndex(item => item.moduleId === moduleId);
    if (index !== -1) {
      this.updateChecklistItem(index, updatedItem);
    }
  }

  getChecklistItemsFromStorage(): ChecklistItem[] {
    try {
      const stored = localStorage.getItem('offboardingChecklistItems');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error retrieving checklist items from storage:', error);
      return [];
    }
  }

  private saveToStorage(items: ChecklistItem[]): void {
    try {
      localStorage.setItem('offboardingChecklistItems', JSON.stringify(items));
      console.log('Checklist items stored via service:', items);
    } catch (error) {
      console.error('Error storing checklist items:', error);
    }
  }

  private loadFromStorage(): void {
    const storedItems = this.getChecklistItemsFromStorage();
    if (storedItems.length > 0) {
      this.checklistItemsSubject.next(storedItems);
    } else {
      // If no stored items, initialize with defaults
      this.initializeWithDefaults();
    }
  }

  clearChecklistItems(): void {
    this.checklistItemsSubject.next([]);
    localStorage.removeItem('offboardingChecklistItems');
  }

  hasChecklistItems(): boolean {
    return this.getChecklistItems().length > 0;
  }

  getCompletedCount(): number {
    return this.getChecklistItems().filter(item => item.completed).length;
  }

  getTotalCount(): number {
    return this.getChecklistItems().length;
  }

  // Reset to default items
  resetToDefaults(): void {
    this.initializeWithDefaults();
  }
}