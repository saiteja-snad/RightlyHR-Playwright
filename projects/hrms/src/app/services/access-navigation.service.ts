import { Injectable } from '@angular/core';
import { RbacService } from './rbac.service';
import {
  ASSEST_ALLOCATION_TABS,
  ATTENDANCE_REPORTS_TABS,
  DESK_ALLOCATION_TABS,
  EXPENSE_TABS,
  IT_SUPPORT_TEAM_TICKETS_TABS,
  COMP_OFF_SUB_TABS,
  MY_INFO_JOB_ROUTES,
  MY_INFO_PERSONAL_ROUTES,
  ON_BEHALF_OF_TABS,
  PERMISSIONS_SUB_TABS,
  REGULARIZATION_SUB_TABS,
  REMOTE_LOGIN_SUB_TABS,
  SETTINGS_ASSEST_CONFIGURATION_TABS,
  SETTINGS_DYNAMIC_FORMS_TABS,
  SETTINGS_EMPLOYEE_FIELDS_PERSONAL_TABS,
  SETTINGS_EMPLOYEE_FIELDS_TABS,
  SETTINGS_ROLES_TABS,
  SETTINGS_TIMEOFF_TABS,
  STANDARD_REPORTS_TABS,
  TIME_OFF_SUB_TABS,
  WFH_ONDUTY_SUB_TABS,
  PENDING_APPROVALS_TABS,
  PENDING_APPROVALS_TIME_OFF_SUB_TABS,
  PENDING_APPROVALS_WFH_SUB_TABS,
  PENDING_APPROVALS_COMP_OFF_SUB_TABS,
  PENDING_APPROVALS_PERMISSIONS_SUB_TABS,
  PENDING_APPROVALS_REGULARIZATION_SUB_TABS,
  SEPARATION_REQUEST_SUB_TABS,
  RECALL_REQUEST_SUB_TABS,
  DESK_REQUEST_SUB_TABS,
  EXPENSES_REQUEST_SUB_TABS,
  EVENTS_SUB_TABS,
  SETTINGS_EMPLOYEE_FIELDS_MANAGE_SHIFTS_TABS,
  SETTINGS_EMPLOYEE_FIELDS_MANAGE_POLICIES_TABS,
  SETTINGS_EMPLOYEE_FIELDS_MANAGE_HOLIDAYS_TABS,
  SETTINGS_EMPLOYEE_FIELDS_MANAGE_WEEKENDS_TABS,
  SETTINGS_EMPLOYEE_FIELDS_EXPENSES_TABS,
  SETTINGS_EMPLOYEE_FIELDS_MANAGE_DST_TABS,
  SETTINGS_TIMEOFF_LEAVE_CATEGORY_TABS,
  ATTENDANCE_ELIGIBILITY_CRITERIA_TABS,
  SETTINGS_EMPLOYEE_FIELDS_JOB_TABS,
  PMS_CONFIGURATION_TABS,
  TEAM_PERFORMANCE_TABS,
  MY_PERFORMANCE_TABS,
  HOLIDAYS_SUB_TABS,
  DASHBOARD_SUB_TABS,
  SETTINGS_MAIN_HEADER_TABS,
  EMPLOYEE_INFO_PERSONAL_ROUTES,
  EMPLOYEE_INFO_JOB_ROUTES,
  INVITE_NEW_USER_TABS,
} from '../permission-route.constants';

@Injectable({
  providedIn: 'root',
})
export class AccessNavigationService {
  constructor(private rbac: RbacService) {}

  navigateToAccessedHeaderRoute(actualRoute: string): string {
    let route = '';

    switch (actualRoute) {
      case '/myinfo':
        if (this.rbac.allowedToAccess('My Info Personal Tab.view')) {
          for (const item of MY_INFO_PERSONAL_ROUTES) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('My Info Job Tab.view')) {
          for (const item of MY_INFO_JOB_ROUTES) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('My Info Documents Tab.view')) {
          return (route = '/myinfo/documents');
        }

        if (this.rbac.allowedToAccess('My Info Team Members Tab.view')) {
          return (route = '/myinfo/team-members');
        }

        if (this.rbac.allowedToAccess('My Info Onboard Request Tab.view')) {
          return (route = '/myinfo/onboarding-request');
        }
        break;

      case '/settings':
        if (this.rbac.allowedToAccess('Employee Fields Module.view')) {
          for (const item of SETTINGS_EMPLOYEE_FIELDS_TABS) {
            if (this.rbac.allowedToAccess('Personal Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_PERSONAL_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }
            if (this.rbac.allowedToAccess('Job Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_JOB_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Document Tab.view')) {
              return (route = '/settings/employee-fields/documents');
            }

            if (this.rbac.allowedToAccess('Manage Shifts Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_SHIFTS_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Manage Policies Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_POLICIES_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Manage Holidays Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_HOLIDAYS_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Manage Weekends Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_WEEKENDS_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Expense Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_EXPENSES_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Manage DST Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_DST_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('NoDue Clearance Tab.view')) {
              return (route = '/settings/employee-fields/no-due-clearnce');
            }
          }
        }

        // if (this.rbac.allowedToAccess('Roles Module.view')) {
        //   for (const item of SETTINGS_ROLES_TABS) {
        //     if ('permission' in item && item.permission) {
        //       if (this.rbac.allowedToAccess(item.permission)) {
        //         return item.route;
        //       }
        //     } else {
        //       return item.route;
        //     }
        //   }
        // }

        if (this.rbac.allowedToAccess('Settings Timeoff Module.view')) {
          for (const item of SETTINGS_TIMEOFF_TABS) {
            if (this.rbac.allowedToAccess('Leave Category Tab.view')) {
              for (const item of SETTINGS_TIMEOFF_LEAVE_CATEGORY_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Leave Allocation Tab.view')) {
              return (route =
                '/settings/timeoff-configurations/leave-allocation');
            }

            if (
              this.rbac.allowedToAccess('Flexible Leave Allocation Tab.view')
            ) {
              return (route =
                '/settings/timeoff-configurations/flexible-leave-allocation');
            }

            if (
              this.rbac.allowedToAccess(
                'Attendance Eligibility Criteria Tab.view'
              )
            ) {
              for (const item of ATTENDANCE_ELIGIBILITY_CRITERIA_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Load Entitlements Tab.view')) {
              return (route =
                '/settings/timeoff-configurations/load-entitlements');
            }
          }
        }

        if (
          this.rbac.allowedToAccess(
            'Assets Management Configuration Module.view'
          )
        ) {
          for (const item of SETTINGS_ASSEST_CONFIGURATION_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('Dynamic Forms Module.view')) {
          for (const item of SETTINGS_DYNAMIC_FORMS_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/events':
        if (this.rbac.allowedToAccess('Events.view')) {
          for (const item of EVENTS_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/reports':
        if (this.rbac.allowedToAccess('Standard Reports.view')) {
          for (const item of STANDARD_REPORTS_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('Custom Reports.view')) {
          return (route = '/reports/custom-reports');
        }

        if (this.rbac.allowedToAccess('Attendance reports.view')) {
          for (const item of ATTENDANCE_REPORTS_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('Monthly Attendance Reports.view')) {
          return (route = '/reports/monthly-attandance-reports');
        }
        break;

      case '/assets-management':
        for (const item of ASSEST_ALLOCATION_TABS) {
          if (this.rbac.allowedToAccess(item.permission)) {
            return item.route;
          }
        }

        break;

      case '/desk':
        for (const item of DESK_ALLOCATION_TABS) {
          if (this.rbac.allowedToAccess(item.permission)) {
            return item.route;
          }
        }

        break;
      case '/claimsandexpenses':
        for (const item of EXPENSE_TABS) {
          if (this.rbac.allowedToAccess(item.permission)) {
            return item.route;
          }
        }

        break;

      case '/time-off':
        if (this.rbac.allowedToAccess('Time Off Module.view')) {
          for (const item of TIME_OFF_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        if (this.rbac.allowedToAccess('Remote Login Module.view')) {
          for (const item of REMOTE_LOGIN_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('WFH/On Duty Module.view')) {
          for (const item of WFH_ONDUTY_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('Comp Off Module.view')) {
          for (const item of COMP_OFF_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('Permissions Module.view')) {
          for (const item of PERMISSIONS_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('Regularization Module.view')) {
          for (const item of REGULARIZATION_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('On Behalf Of Module.view')) {
          for (const item of ON_BEHALF_OF_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('Attendance Module.view')) {
          return (route = '/time-off/attendance');
        }

        if (this.rbac.allowedToAccess('On Behalf Of Approvals Module.view')) {
          return (route = 'time-off/on-behalf-of-approvals/time-off');
        }

        if (this.rbac.allowedToAccess('Global Permissions Module.view')) {
          return (route = 'time-off/global-permissions');
        }

        if (this.rbac.allowedToAccess('Pending Approvals Module.view')) {
          for (const item of PENDING_APPROVALS_TABS) {
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Time Off Tab.view'
            ) {
              if (
                item.route === '/time-off/pending-approvals/time-off-request'
              ) {
                for (const item of PENDING_APPROVALS_TIME_OFF_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'WFH Tab.view'
            ) {
              if (item.route === '/time-off/pending-approvals/wfh') {
                for (const item of PENDING_APPROVALS_WFH_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Comp Off Tab.view'
            ) {
              if (item.route === '/time-off/pending-approvals/comp-off') {
                for (const item of PENDING_APPROVALS_COMP_OFF_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Permissions Tab.view'
            ) {
              if (item.route === '/time-off/pending-approvals/permissions') {
                for (const item of PENDING_APPROVALS_PERMISSIONS_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Regularization Tab.view'
            ) {
              if (
                item.route ===
                '/time-off/pending-approvals/regularization-request'
              ) {
                for (const item of PENDING_APPROVALS_REGULARIZATION_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Seperation Request Tab.view'
            ) {
              if (
                item.route === '/time-off/pending-approvals/separation-request'
              ) {
                for (const item of SEPARATION_REQUEST_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Recall Request Tab.view'
            ) {
              if (item.route === '/time-off/pending-approvals/recall-request') {
                for (const item of RECALL_REQUEST_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Claims and Expenses Tab.view'
            ) {
              if (
                item.route ===
                '/time-off/pending-approvals/claimsandexpenses-request'
              ) {
                for (const item of EXPENSES_REQUEST_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Desk Requests Tab.view'
            ) {
              if (item.route === '/time-off/pending-approvals/desk-approval') {
                for (const item of DESK_REQUEST_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
          }
          if (this.rbac.allowedToAccess('Trainee Details Tab.view')) {
            return (route = '/time-off/pending-approvals/trainee-approvals');
          }

          if (this.rbac.allowedToAccess('No Due Clearence Requests Tab.view')) {
            return (route = '/time-off/pending-approvals/nodue-request');
          }

          if (this.rbac.allowedToAccess('Probation Details Tab.view')) {
            return (route = '/time-off/pending-approvals/probation-request');
          }
        }

        break;

      case '/it-support':
        if (this.rbac.allowedToAccess('My Tickets Tab.view')) {
          return (route = '/it-support/mytickets');
        }

        if (this.rbac.allowedToAccess('Team Tickets Tab.view')) {
          for (const item of IT_SUPPORT_TEAM_TICKETS_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        break;

      case '/pms':
        if (this.rbac.allowedToAccess('Review Cycle List.view')) {
          return (route = '/pms/review-cycle');
        }

        if (this.rbac.allowedToAccess('Review Cycle Employee List.view')) {
          return (route = '/pms/apprisal');
        }

        if (this.rbac.allowedToAccess('My Performance Review.view')) {
          for (const item of MY_PERFORMANCE_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('My Team Performance Review.view')) {
          for (const item of TEAM_PERFORMANCE_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/pmsconfiguration':
        for (const item of PMS_CONFIGURATION_TABS) {
          if (this.rbac.allowedToAccess(item.permission)) {
            return item.route;
          }
        }
        break;

      case '/calendar':
        if (this.rbac.allowedToAccess('Calender Tab.view')) {
          return (route = '/calendar/calendarview');
        }

        if (this.rbac.allowedToAccess('Holidays Tab.view')) {
          for (const item of HOLIDAYS_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/calendar/holiday':
        if (this.rbac.allowedToAccess('Holidays Tab.view')) {
          for (const item of HOLIDAYS_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/personalinfo':
         if (this.rbac.allowedToAccess('Employee Info Personal Tab.view')) {
          for (const item of EMPLOYEE_INFO_PERSONAL_ROUTES) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('Employee Info Job Tab.view')) {
          for (const item of EMPLOYEE_INFO_JOB_ROUTES) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }

        if (this.rbac.allowedToAccess('Employee Info Documents Tab.view')) {
          return (route = '/personalinfo/documents');
        }

        if (this.rbac.allowedToAccess('Employee Info Team Members Tab.view')) {
          return (route = '/personalinfo/team-members');
        }

        if (
          this.rbac.allowedToAccess('Employee Info Onboard Request Tab.view')
        ) {
          return (route = '/personalinfo/onboarding-request');
        }
        break;

      case '/admin':
        if (this.rbac.allowedToAccess('Dashboard.view')) {
          return route = '/admin/dashboard'
        }
        break;
      
      case '/admin/active-new-user':
        if (this.rbac.allowedToAccess('Invite New User.view')) {
          for (const item of INVITE_NEW_USER_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      
    }
    return route;
  }

  navigateToAccessedRoute(actualRoute: string): string {
    let route = '';

    switch (actualRoute) {
      case '/myinfo/personal':
        if (this.rbac.allowedToAccess('My Info Personal Tab.view')) {
          for (const item of MY_INFO_PERSONAL_ROUTES) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/myinfo/job':
        if (this.rbac.allowedToAccess('My Info Job Tab.view')) {
          for (const item of MY_INFO_JOB_ROUTES) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/myinfo/documents':
        if (this.rbac.allowedToAccess('My Info Documents Tab.view')) {
          return (route = '/myinfo/documents');
        }
        break;
      case '/myinfo/team-members':
        if (this.rbac.allowedToAccess('My Info Team Members Tab.view')) {
          return (route = '/myinfo/team-members');
        }
        break;

      case '/myinfo/onboarding-request':
        if (this.rbac.allowedToAccess('My Info Onboard Request Tab.view')) {
          return (route = '/myinfo/onboarding-request');
        }
        break;

      case '/settings/employee-fields':
        if (this.rbac.allowedToAccess('Employee Fields Module.view')) {
          for (const item of SETTINGS_EMPLOYEE_FIELDS_TABS) {
            if (this.rbac.allowedToAccess('Personal Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_PERSONAL_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Job Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_JOB_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Document Tab.view')) {
              return (route = '/settings/employee-fields/documents');
            }

            if (this.rbac.allowedToAccess('Manage Shifts Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_SHIFTS_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Manage Policies Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_POLICIES_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Manage Holidays Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_HOLIDAYS_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Manage Weekends Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_WEEKENDS_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Expense Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_EXPENSES_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('Manage DST Tab.view')) {
              for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_DST_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }
            }

            if (this.rbac.allowedToAccess('NoDue Clearance Tab.view')) {
              return (route = '/settings/employee-fields/no-due-clearnce');
            }
          }
        }
        break;

      case '/settings/roles-permissions':
        for (const item of SETTINGS_ROLES_TABS) {
          return item.route;
        }

        break;
      case '/settings/timeoff-configurations':
        for (const item of SETTINGS_TIMEOFF_TABS) {
          if (this.rbac.allowedToAccess('Leave Category Tab.view')) {
            for (const item of SETTINGS_TIMEOFF_LEAVE_CATEGORY_TABS) {
              if (this.rbac.allowedToAccess(item.permission)) {
                return item.route;
              }
            }
          }

          if (this.rbac.allowedToAccess('Leave Allocation Tab.view')) {
            return (route =
              '/settings/timeoff-configurations/leave-allocation');
          }

          if (this.rbac.allowedToAccess('Flexible Leave Allocation Tab.view')) {
            return (route =
              '/settings/timeoff-configurations/flexible-leave-allocation');
          }

          if (
            this.rbac.allowedToAccess(
              'Attendance Eligibility Criteria Tab.view'
            )
          ) {
            for (const item of ATTENDANCE_ELIGIBILITY_CRITERIA_TABS) {
              if (this.rbac.allowedToAccess(item.permission)) {
                return item.route;
              }
            }
          }

          if (this.rbac.allowedToAccess('Load Entitlements Tab.view')) {
            return (route =
              '/settings/timeoff-configurations/load-entitlements');
          }
        }

        break;
      case '/reports/standard-reports':
        if (this.rbac.allowedToAccess('Standard Reports.view')) {
          for (const item of STANDARD_REPORTS_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/reports/custom-reports':
        if (this.rbac.allowedToAccess('Custom Reports.view')) {
          return (route = '/reports/custom-reports');
        }
        break;

      case '/reports/attendence-reports':
        if (this.rbac.allowedToAccess('Attendance reports.view')) {
          for (const item of ATTENDANCE_REPORTS_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/reports/monthly-attandance-reports':
        if (this.rbac.allowedToAccess('Monthly Attendance Reports.view')) {
          return (route = '/reports/monthly-attandance-reports');
        }
        break;

      case '/it-support/mytickets':
        if (this.rbac.allowedToAccess('My Tickets Tab.view')) {
          return (route = '/it-support/mytickets');
        }
        break;

      case '/it-support/team-tickets':
        if (this.rbac.allowedToAccess('Team Tickets Tab.view')) {
          for (const item of IT_SUPPORT_TEAM_TICKETS_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/calendar/holiday':
        if (this.rbac.allowedToAccess('Holidays Tab.view')) {
          for (const item of HOLIDAYS_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/time-off/pending-approvals/separation-request':
        if (this.rbac.allowedToAccess('Separation Request Tab.view')) {
          for (const item of SEPARATION_REQUEST_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/settings/dynamic-forms':
        if (this.rbac.allowedToAccess('Dynamic Forms Module.view')) {
          for (const item of SETTINGS_DYNAMIC_FORMS_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/settings/assets-configuration':
        if (
          this.rbac.allowedToAccess(
            'Assets Management Configuration Module.view'
          )
        ) {
          for (const item of SETTINGS_ASSEST_CONFIGURATION_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/settings/timeoff-configurations/eligibility-criterias':
        if (
          this.rbac.allowedToAccess('Attendance Eligibility Criteria Tab.view')
        ) {
          for (const item of ATTENDANCE_ELIGIBILITY_CRITERIA_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/settings/timeoff-configurations/leave-categoery':
        if (this.rbac.allowedToAccess('Leave Category Tab.view')) {
          for (const item of SETTINGS_TIMEOFF_LEAVE_CATEGORY_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/settings/timeoff-configurations/leave-allocation':
        if (this.rbac.allowedToAccess('Leave Allocation Tab.view')) {
          return (route = '/settings/timeoff-configurations/leave-allocation');
        }
        break;

      case '/settings/timeoff-configurations/flexible-leave-allocation':
        if (this.rbac.allowedToAccess('Flexible Leave Allocation Tab.view')) {
          return (route =
            '/settings/timeoff-configurations/flexible-leave-allocation');
        }
        break;

      case '/settings/timeoff-configurations/load-entitlements':
        if (this.rbac.allowedToAccess('Load Entitlements Tab.view')) {
          return (route = '/settings/timeoff-configurations/load-entitlements');
        }
        break;

      case '/settings/employee-fields/personal':
        if (this.rbac.allowedToAccess('Personal Tab.view')) {
          for (const item of SETTINGS_EMPLOYEE_FIELDS_PERSONAL_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/settings/employee-fields/job':
        if (this.rbac.allowedToAccess('Job Tab.view')) {
          for (const item of SETTINGS_EMPLOYEE_FIELDS_JOB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/settings/employee-fields/documents':
        if (this.rbac.allowedToAccess('Document Tab.view')) {
          return (route = '/settings/employee-fields/documents');
        }
        break;

      case '/settings/employee-fields/manage-shifts':
        if (this.rbac.allowedToAccess('Manage Shifts Tab.view')) {
          for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_SHIFTS_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/settings/employee-fields/manage-policies':
        if (this.rbac.allowedToAccess('Manage Policies Tab.view')) {
          for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_POLICIES_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/settings/employee-fields/manage-holidays':
        if (this.rbac.allowedToAccess('Manage Holidays Tab.view')) {
          for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_HOLIDAYS_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/settings/employee-fields/manage-weekends':
        if (this.rbac.allowedToAccess('Manage Weekends Tab.view')) {
          for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_WEEKENDS_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/settings/employee-fields/expenes':
        if (this.rbac.allowedToAccess('Expense Tab.view')) {
          for (const item of SETTINGS_EMPLOYEE_FIELDS_EXPENSES_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/settings/employee-fields/manage-dsts':
        if (this.rbac.allowedToAccess('Manage DST Tab.view')) {
          for (const item of SETTINGS_EMPLOYEE_FIELDS_MANAGE_DST_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/settings/employee-fields/no-due-clearnce':
        if (this.rbac.allowedToAccess('NoDue Clearance Tab.view')) {
          return (route = '/settings/employee-fields/no-due-clearnce');
        }
        break;

      case '/settings/timeoff-configurations':
        if (this.rbac.allowedToAccess('Settings Timeoff Module.view')) {
          for (const item of SETTINGS_TIMEOFF_TABS) {
            if (this.rbac.allowedToAccess('Leave Category Tab.view')) {
              for (const item of SETTINGS_TIMEOFF_LEAVE_CATEGORY_TABS) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              }

              if (this.rbac.allowedToAccess('Leave Allocation Tab.view')) {
                return (route =
                  '/settings/timeoff-configurations/leave-allocation');
              }

              if (
                this.rbac.allowedToAccess('Flexible Leave Allocation Tab.view')
              ) {
                return (route =
                  '/settings/timeoff-configurations/flexible-leave-allocation');
              }

              if (
                this.rbac.allowedToAccess(
                  'Attendance Eligibility Criteria Tab.view'
                )
              ) {
                for (const item of ATTENDANCE_ELIGIBILITY_CRITERIA_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
              if (this.rbac.allowedToAccess('Load Entitlements Tab.view')) {
                return (route =
                  '/settings/timeoff-configurations/load-entitlements');
              }
            }
          }
        }
        break;

      case '/time-off/leaves':
        if (this.rbac.allowedToAccess('Time Off Module.view')) {
          for (const item of TIME_OFF_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/time-off/wfh':
        if (this.rbac.allowedToAccess('WFH/On Duty Module.view')) {
          for (const item of WFH_ONDUTY_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/time-off/remote':
        if (this.rbac.allowedToAccess('Remote Login Module.view')) {
          for (const item of REMOTE_LOGIN_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/time-off/comp-off':
        if (this.rbac.allowedToAccess('Comp Off Module.view')) {
          for (const item of COMP_OFF_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/time-off/premissions':
        if (this.rbac.allowedToAccess('Permissions Module.view')) {
          for (const item of PERMISSIONS_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/time-off/regularization':
        if (this.rbac.allowedToAccess('Regularization Module.view')) {
          for (const item of REGULARIZATION_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/time-off/on-behalf-of':
        if (this.rbac.allowedToAccess('On Behalf Of Module.view')) {
          for (const item of ON_BEHALF_OF_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/time-off/attendance':
        if (this.rbac.allowedToAccess('Attendance Module.view')) {
          return (route = '/time-off/attendance');
        }
        break;
      case '/time-off/on-behalf-of-approvals':
        if (this.rbac.allowedToAccess('On Behalf Of Approvals Module.view')) {
          return (route = '/time-off/on-behalf-of-approvals/time-off');
        }
        break;
      case '/time-off/global-permissions':
        if (this.rbac.allowedToAccess('Global Permissions Module.view')) {
          return (route = '/time-off/global-permissions');
        }
        break;

      case '/time-off/pending-approvals':
        if (this.rbac.allowedToAccess('Pending Approvals Module.view')) {
          for (const item of PENDING_APPROVALS_TABS) {
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Time Off Tab.view'
            ) {
              if (
                item.route === '/time-off/pending-approvals/time-off-request'
              ) {
                for (const item of PENDING_APPROVALS_TIME_OFF_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'WFH Tab.view'
            ) {
              if (item.route === '/time-off/pending-approvals/wfh') {
                for (const item of PENDING_APPROVALS_WFH_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Comp Off Tab.view'
            ) {
              if (item.route === '/time-off/pending-approvals/comp-off') {
                for (const item of PENDING_APPROVALS_COMP_OFF_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Permissions Tab.view'
            ) {
              if (item.route === '/time-off/pending-approvals/permissions') {
                for (const item of PENDING_APPROVALS_PERMISSIONS_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Regularization Tab.view'
            ) {
              if (
                item.route ===
                '/time-off/pending-approvals/regularization-request'
              ) {
                for (const item of PENDING_APPROVALS_REGULARIZATION_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Seperation Request Tab.view'
            ) {
              if (
                item.route === '/time-off/pending-approvals/separation-request'
              ) {
                for (const item of SEPARATION_REQUEST_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Recall Request Tab.view'
            ) {
              if (item.route === '/time-off/pending-approvals/recall-request') {
                for (const item of RECALL_REQUEST_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Claims and Expenses Tab.view'
            ) {
              if (
                item.route ===
                '/time-off/pending-approvals/claimsandexpenses-request'
              ) {
                for (const item of EXPENSES_REQUEST_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (
              this.rbac.allowedToAccess(item.permission) &&
              item.permission === 'Desk Requests Tab.view'
            ) {
              if (item.route === '/time-off/pending-approvals/desk-approval') {
                for (const item of DESK_REQUEST_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
          }
          if (this.rbac.allowedToAccess('Trainee Details Tab.view')) {
            return (route = '/time-off/pending-approvals/trainee-approvals');
          }

          if (this.rbac.allowedToAccess('No Due Clearence Requests Tab.view')) {
            return (route = '/time-off/pending-approvals/nodue-request');
          }

          if (this.rbac.allowedToAccess('Probation Details Tab.view')) {
            return (route = '/time-off/pending-approvals/probation-request');
          }
        }
        break;

      case '/time-off/pending-approvals/time-off-request':
        if (this.rbac.allowedToAccess('Time Off Tab.view')) {
          for (const item of PENDING_APPROVALS_TIME_OFF_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/time-off/pending-approvals/wfh':
        if (this.rbac.allowedToAccess('WFH Tab.view')) {
          for (const item of PENDING_APPROVALS_WFH_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/time-off/pending-approvals/comp-off':
        if (this.rbac.allowedToAccess('Comp Off Tab.view')) {
          for (const item of PENDING_APPROVALS_COMP_OFF_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/time-off/pending-approvals/permissions':
        if (this.rbac.allowedToAccess('Permissions Tab.view')) {
          for (const item of PENDING_APPROVALS_PERMISSIONS_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/time-off/pending-approvals/regularization-request':
        if (this.rbac.allowedToAccess('Regularization Tab.view')) {
          for (const item of PENDING_APPROVALS_REGULARIZATION_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/time-off/pending-approvals/separation-request':
        if (this.rbac.allowedToAccess('Separation Request Tab.view')) {
          for (const item of SEPARATION_REQUEST_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/time-off/pending-approvals/recall-request':
        if (this.rbac.allowedToAccess('Recall Request Tab.view')) {
          for (const item of RECALL_REQUEST_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/time-off/pending-approvals/desk-approval':
        if (this.rbac.allowedToAccess('Desk Requests Tab.view')) {
          for (const item of DESK_REQUEST_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

      case '/time-off/pending-approvals/claimsandexpenses-request':
        if (this.rbac.allowedToAccess('Claims and Expenses Tab.view')) {
          for (const item of EXPENSES_REQUEST_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;
      case '/time-off/pending-approvals/trainee-approvals':
        if (this.rbac.allowedToAccess('Trainee Details Tab.view')) {
          return (route = '/time-off/pending-approvals/trainee-approvals');
        }
        break;
      case '/time-off/pending-approvals/nodue-request':
        if (this.rbac.allowedToAccess('No Due Clearence Requests Tab.view')) {
          return (route = '/time-off/pending-approvals/nodue-request');
        }
        break;
      case '/time-off/pending-approvals/probation-request':
        if (this.rbac.allowedToAccess('Probation Details Tab.view')) {
          return (route = '/time-off/pending-approvals/probation-request');
        }
        break;
        
      case '/personalinfo/personal':
      if (this.rbac.allowedToAccess('Employee Info Personal Tab.view')) {
        for (const item of EMPLOYEE_INFO_PERSONAL_ROUTES) {
          if (this.rbac.allowedToAccess(item.permission)) {
            return item.route;
          }
        }
      }
      break;

    case '/personalinfo/job':
      if (this.rbac.allowedToAccess('Employee Info Job Tab.view')) {
        for (const item of EMPLOYEE_INFO_JOB_ROUTES) {
          if (this.rbac.allowedToAccess(item.permission)) {
            return item.route;
          }
        }
      }
      break;

    case '/personalinfo/documents':
      if (this.rbac.allowedToAccess('Employee Info Documents Tab.view')) {
        return route = '/personalinfo/documents';
      }
      break;

    case '/personalinfo/team-members':
      if (this.rbac.allowedToAccess('Employee Info Team Members Tab.view')) {
        return route = '/personalinfo/team-members';
      }
      break;

    }

    return route;
  }
}
