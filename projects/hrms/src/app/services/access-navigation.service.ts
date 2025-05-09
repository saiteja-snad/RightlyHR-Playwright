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
} from '../permission-route.constants';

@Injectable({
  providedIn: 'root',
})
export class AccessNavigationService {
  constructor(private rbac: RbacService) { }

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
  
                if(this.rbac.allowedToAccess('Document Tab.view')) {
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
  
                if(this.rbac.allowedToAccess('NoDue Clearance Tab.view')){
                  return (route = '/settings/employee-fields/no-due-clearnce');
                }
        
            }
          }
  
          if (this.rbac.allowedToAccess('Roles Module.view')) {
            for (const item of SETTINGS_ROLES_TABS) {
              if ('permission' in item && item.permission) {
                if (this.rbac.allowedToAccess(item.permission)) {
                  return item.route;
                }
              } else {
                return item.route;
              }
            }
          }
  
          if (this.rbac.allowedToAccess('Settings Timeoff Module.view')) {
            for (const item of SETTINGS_TIMEOFF_TABS) {
              if(this.rbac.allowedToAccess('Leave Category Tab.view')){
                for(const item of SETTINGS_TIMEOFF_LEAVE_CATEGORY_TABS){
                  if(this.rbac.allowedToAccess(item.permission)){
                    return item.route;
                  }
                }
              }
  
              if(this.rbac.allowedToAccess('Leave Allocation Tab.view')){
                return (route = '/settings/timeoff-configurations/leave-allocation');
              }
  
              if(this.rbac.allowedToAccess('Flexible Leave Allocation Tab.view')){
                return (route = '/settings/timeoff-configurations/flexible-leave-allocation');
              }
  
              if(this.rbac.allowedToAccess('Attendance Eligibility Criteria Tab.view')){
                for(const item of ATTENDANCE_ELIGIBILITY_CRITERIA_TABS){
                  if(this.rbac.allowedToAccess(item.permission)){
                    return item.route;
                  }
                }
              }
  
              if(this.rbac.allowedToAccess('Load Entitlements Tab.view')){
                return (route = '/settings/timeoff-configurations/load-entitlements');
              }
            }
          }
  
          if ( this.rbac.allowedToAccess('Assets Management Configuration Module.view')) {
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
        if (this.rbac.allowedToAccess('Events Module.view')) {
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

        if (this.rbac.allowedToAccess('On Behalf Of Approvals Module.view')) {
          return route = 'time-off/on-behalf-of-approvals/time-off'
        }

        if (this.rbac.allowedToAccess('Global Permissions.view')) {
          return route = 'time-off/global-permissions'
        }

        if (this.rbac.allowedToAccess('Pending Approvals Module.view')) {
          for (const item of PENDING_APPROVALS_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              if (item.route === '/time-off/pending-approvals/time-off-request') {
                for (const item of PENDING_APPROVALS_TIME_OFF_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (this.rbac.allowedToAccess(item.permission)) {
              if (item.route === '/time-off/pending-approvals/wfh') {
                for (const item of PENDING_APPROVALS_WFH_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (this.rbac.allowedToAccess(item.permission)) {
              if (item.route === '/time-off/pending-approvals/comp-off') {
                for (const item of PENDING_APPROVALS_COMP_OFF_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (this.rbac.allowedToAccess(item.permission)) {
              if (item.route === '/time-off/pending-approvals/permissions') {
                for (const item of PENDING_APPROVALS_PERMISSIONS_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (this.rbac.allowedToAccess(item.permission)) {
              if (item.route === '/time-off/pending-approvals/regularization-request') {
                for (const item of PENDING_APPROVALS_REGULARIZATION_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (this.rbac.allowedToAccess(item.permission)) {
              if (item.route === '/time-off/pending-approvals/separation-request') {
                for (const item of SEPARATION_REQUEST_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (this.rbac.allowedToAccess(item.permission)) {
              if (item.route === '/time-off/pending-approvals/recall-request') {
                for (const item of RECALL_REQUEST_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (this.rbac.allowedToAccess(item.permission)) {
              if (item.route === '/time-off/pending-approvals/claimsandexpenses-request') {
                for (const item of EXPENSES_REQUEST_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }
            if (this.rbac.allowedToAccess(item.permission)) {
              if (item.route === '/time-off/pending-approvals/desk-approval') {
                for (const item of DESK_REQUEST_SUB_TABS) {
                  if (this.rbac.allowedToAccess(item.permission)) {
                    return item.route;
                  }
                }
              }
            }

          }
        }
    
        if (this.rbac.allowedToAccess('Trainee Details.view')) {
          return (route = '/time-off/pending-approvals/trainee-approvals');
        }

        if (this.rbac.allowedToAccess('No Due Clearance Request.view')) {
          return (route = '/time-off/pending-approvals/nodue-request');
        }

        if (this.rbac.allowedToAccess('Probation Details.view')) {
          return (route = '/time-off/pending-approvals/probation-request');
        }
        

    break;
      
      
      case '/it-support':

    if (this.rbac.allowedToAccess('My Tickets Tab.view')) {
      return route = '/it-support/mytickets';
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
        if(this.rbac.allowedToAccess('Review Cycle List.view')){
          return (route = '/pms/review-cycle');
        }

        if(this.rbac.allowedToAccess('Review Cycle Employee List.view')){
          return (route = '/pms/apprisal');
        }

        if(this.rbac.allowedToAccess('My Performance Review.view')){
          for(const item of MY_PERFORMANCE_TABS){
            if(this.rbac.allowedToAccess(item.permission)){
              return item.route;
            }
          }
        }

        if(this.rbac.allowedToAccess('My Team Performance Review.view')){
          for( const item of TEAM_PERFORMANCE_TABS){
            if(this.rbac.allowedToAccess(item.permission)){
              return item.route;
            }
          }
        }
        break;

        case '/pmsconfiguration':
         for(const item of PMS_CONFIGURATION_TABS){
          if(this.rbac.allowedToAccess(item.permission)){
            return item.route;
          }
         }
    break;

    case '/calendar':
        if (this.rbac.allowedToAccess('Calender Tab.view')) {
          return route = '/calendar/calendarview';
        }
        if (this.rbac.allowedToAccess('Holidays Tab.view')) {
          for (const item of HOLIDAYS_SUB_TABS) {
            if (this.rbac.allowedToAccess(item.permission)) {
              return item.route;
            }
          }
        }
        break;

        case '/dashboard':
          if(this.rbac.allowedToAccess('Dashboard Module.view')){
            for(const item of DASHBOARD_SUB_TABS){
              if(this.rbac.allowedToAccess(item.permission)){
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
        return route = '/myinfo/documents';
      }
      break;
    case '/myinfo/team-members':
      if (this.rbac.allowedToAccess('My Info Team Members Tab.view')) {
        return route = '/myinfo/team-members';
      }
      break;

    case '/myinfo/onboarding-request':
      if (this.rbac.allowedToAccess('My Info Onboard Request Tab.view')) {
        return route = '/myinfo/onboarding-request';
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

          if (this.rbac.allowedToAccess('Personal Tab.view')) {
            for (const item of SETTINGS_EMPLOYEE_FIELDS_PERSONAL_TABS) {
              if (this.rbac.allowedToAccess(item.permission)) {
                return item.route;
              }
            }
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
        if (this.rbac.allowedToAccess(item.permission)) {
          return item.route;
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
  }
  return route;
}
}