import { Injectable } from '@angular/core';
import { RbacService } from './rbac.service';
import {
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
  TIME_OFF_SUB_TABS,
  WFH_ONDUTY_SUB_TABS,
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
            route = '/myinfo/documents';
        }

        if (this.rbac.allowedToAccess('My Info Team Members Tab.view')) {
            route = '/myinfo/team-members';
        }

        if (this.rbac.allowedToAccess('My Info Onboard Request Tab.view')) {
            route = '/myinfo/onboarding-request';
        }
        break;

        case '/settings' :
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

          if (this.rbac.allowedToAccess('Settings Timeoff Module.view')) {
            for (const item of SETTINGS_TIMEOFF_TABS) {
              if (this.rbac.allowedToAccess(item.permission)) {
                return item.route;
              }
            }
          }

          if (this.rbac.allowedToAccess('Assets Management Configuration Module.view')) {
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
    case 'events':


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
          route = '/myinfo/documents';
        }
        break;
      case '/myinfo/team-members':
        if (this.rbac.allowedToAccess('My Info Team Members Tab.view')) {
          route = '/myinfo/team-members';
        }
        break;

      case '/myinfo/onboarding-request':
        if (this.rbac.allowedToAccess('My Info Onboard Request Tab.view')) {
          route = '/myinfo/onboarding-request';
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
    }
    return route;
  }
}
