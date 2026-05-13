import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ModuleNavigationService {

  private readonly moduleRoutes: { [key: number]: string } = {
     [environment.leavesModuleId]: '/personalinfo/job/employmentType/initate-offboarding/leave-approvals',
      [environment.wfhModuleId]: '/personalinfo/job/employmentType/initate-offboarding/wfh-approvals',
      [environment.remoteLoginModuleId]: '/personalinfo/job/employmentType/initate-offboarding/remote-login-approvals',
      [environment.compoffModuleId]: '/personalinfo/job/employmentType/initate-offboarding/compoff-approvals',
      [environment.permissionsModuleId]: '/personalinfo/job/employmentType/initate-offboarding/permissions-approvals',
      [environment.extraHoursModuleId]: '/personalinfo/job/employmentType/initate-offboarding/extrahours-approvals',
      [environment.attendanceRegularizationModuleId]: '/personalinfo/job/employmentType/initate-offboarding/regularization-approvals',
      [environment.expensesModuleId]: '/personalinfo/job/employmentType/initate-offboarding/expenses-approvals',
      [environment.timesheetModuleId]: '/personalinfo/job/employmentType/initate-offboarding/timesheet-approvals',
      [environment.pendingapprovalemployeid]: '/personalinfo/job/employmentType/initate-offboarding/employee-info-approvals',
  };

  private readonly offboardingModuleRoutes: { [key: number]: string } = {
     [environment.leavesModuleId]: '/personalinfo/job/employmentType/approval-requests/leave-approvals',
      [environment.wfhModuleId]: '/personalinfo/job/employmentType/approval-requests/wfh-approvals',
      [environment.remoteLoginModuleId]: '/personalinfo/job/employmentType/approval-requests/remote-login-approvals',
      [environment.compoffModuleId]: '/personalinfo/job/employmentType/approval-requests/compoff-approvals',
      [environment.permissionsModuleId]: '/personalinfo/job/employmentType/approval-requests/permissions-approvals',
      [environment.extraHoursModuleId]: '/personalinfo/job/employmentType/approval-requests/extrahours-approvals',
      [environment.attendanceRegularizationModuleId]: '/personalinfo/job/employmentType/approval-requests/regularization-approvals',
      [environment.expensesModuleId]: '/personalinfo/job/employmentType/approval-requests/expenses-approvals',
      [environment.timesheetModuleId]: '/personalinfo/job/employmentType/approval-requests/timesheet-approvals',
      [environment.pendingapprovalemployeid]: '/personalinfo/job/employmentType/approval-requests/employee-info-approvals',
  };

  constructor(private router: Router) { }

  /**
   * Navigate to approval requests route based on module ID
   * @param moduleId - The module ID to navigate to
   * @param fallbackRoute - Optional fallback route if module not found
   */
  navigateToApprovalRoute(moduleId: number, fallbackRoute?: string): void {
    const targetRoute = this.moduleRoutes[moduleId];
    if (targetRoute) {
      this.router.navigate([targetRoute]);
    } else {
      const defaultFallback = '/personalinfo/job/employmentType/approval-requests/leave-approvals';
      this.router.navigateByUrl(fallbackRoute || defaultFallback);
    }
  }

  /**
   * Navigate to offboarding route based on module ID
   * @param moduleId - The module ID to navigate to
   * @param fallbackRoute - Optional fallback route if module not found
   */
  navigateToOffboardingRoute(moduleId: number, fallbackRoute?: string): void {
    const targetRoute = this.offboardingModuleRoutes[moduleId];
    if (targetRoute) {
      this.router.navigate([targetRoute]);
    } else {
      const defaultFallback = '/personalinfo/job/employmentType/initate-offboarding/leave-approvals';
      this.router.navigateByUrl(fallbackRoute || defaultFallback);
    }
  }

  /**
   * Get the route path for a module ID without navigating
   * @param moduleId - The module ID
   * @param isOffboarding - Whether to get offboarding route or approval route
   * @returns The route path or null if not found
   */
  getModuleRoute(moduleId: number, isOffboarding: boolean = false): string | null {
    const routes = isOffboarding ? this.offboardingModuleRoutes : this.moduleRoutes;
    return routes[moduleId] || null;
  }

  /**
   * Check if a module ID has a valid route
   * @param moduleId - The module ID to check
   * @param isOffboarding - Whether to check offboarding routes or approval routes
   * @returns True if route exists, false otherwise
   */
  hasModuleRoute(moduleId: number, isOffboarding: boolean = false): boolean {
    const routes = isOffboarding ? this.offboardingModuleRoutes : this.moduleRoutes;
    return moduleId in routes;
  }

  /**
   * Get all available module routes
   * @param isOffboarding - Whether to get offboarding routes or approval routes
   * @returns Object with moduleId as key and route as value
   */
  getAllModuleRoutes(isOffboarding: boolean = false): { [key: number]: string } {
    return isOffboarding ? { ...this.offboardingModuleRoutes } : { ...this.moduleRoutes };
  }
}
