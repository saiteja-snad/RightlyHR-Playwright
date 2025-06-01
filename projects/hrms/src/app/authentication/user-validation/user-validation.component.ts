import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { MsalService } from '@azure/msal-angular';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { RbacService } from '../../services/rbac.service';
import { MY_INFO_DOCUMENTS_ROUTES, MY_INFO_JOB_ROUTES, MY_INFO_ONBOARD_REQUEST, MY_INFO_PERSONAL_ROUTES, MY_INFO_TEAM_MEMBERS } from '../../permission-route.constants';
@Component({
  selector: 'app-user-validation',
  imports: [FormsModule, CommonModule],
  templateUrl: './user-validation.component.html',
  styleUrl: './user-validation.component.scss'
})

export class UserValidationComponent {
  subscription!: Subscription;
  name!: string;
  myInfoRoutes = MY_INFO_PERSONAL_ROUTES;
  myInfoJobRoutes=MY_INFO_JOB_ROUTES;
  myInfoDocumentsRoutes=MY_INFO_DOCUMENTS_ROUTES;
  myInfoTeamMembersRoutes=MY_INFO_TEAM_MEMBERS;
  myInfoOnBoradRequest = MY_INFO_ONBOARD_REQUEST;

  constructor(
    private _msalService: MsalService,
    private router: Router,
    private http: HttpService,
    private accessNav: AccessNavigationService,
    private rbac:RbacService
  ) { }

  async ngOnInit() {
    await this.postLogin();
  }

  async postLogin() {
    await this._msalService.instance.initialize();
    //  const loginResponse = await this._msalService.instance.loginRedirect();
    //console.log(loginResponse.accessToken);
    const account = this._msalService.instance.getAllAccounts()[0];
    if (account) {
      this._msalService.instance.setActiveAccount(account);
    } else {
      return;
    }
    const response = await this._msalService.instance.acquireTokenSilent({
      account: account,
      scopes: ['user.read'],
    });
    const token = response.accessToken;
    //console.log(token);
    this.name = account?.name as string;
    this.getUserDetails(account?.username);
  }

  getUserDetails(email: string) {
    this.subscription = this.http.getUserDetails(email).subscribe({
      next: (response: any) => {
        if (response.empdatum) {
          this.name = `${response.empdatum.firstName} ${response.empdatum.middleName ?? ''} ${response.empdatum.lastName ?? ''}`;
          localStorage.setItem('rightlyHrRoleClaims', JSON.stringify(response.claims));
          localStorage.setItem('rightlyHrUser', JSON.stringify(response.empdatum));
          localStorage.setItem('rightlyHrUserRoles', JSON.stringify(response.roles));
          setTimeout(() => {
            if (response.roles.length <= 0) {
              this.router.navigate(['/unauthorized']);
            }  else {
              this.navigateBasedOnPermission();
            }
          }, 2000);

        } else {
          this.navigateBasedOnPermission();
        }
      },
      error: (err) => {
        this.navigateBasedOnPermission();
      },
    });
  }


 navigateBasedOnPermission() {
  const primaryPermissions = [
    { permission: 'Dashboard.view', route: '/admin' },
    { permission: 'Employees.view', route: '/employee-management/active-employees' }
  ];

  const permissionsWithRoutes = [
    { permission: 'Events.view', route: '/events' },
    { permission: 'Calendar.view', route: '/calendar-view' },
    { permission: 'Attendance.view', route: '/attendance' },
    { permission: 'Reports.view', route: '/reports' },
    { permission: 'Time-Off.view', route: '/time-off' },
    { permission: 'Org Hierarchy.view', route: '/organization-chart' },
    { permission: 'IT Support.view', route: '/it-support' },
    { permission: 'Desk Allocation.view', route: '/desk' },
    { permission: 'Asset Management.view', route: '/assets-management' },
    { permission: 'Expenses.view', route: '/claimsandexpenses' },
    { permission: 'PMS.view', route: '/pms' },
    { permission: 'PMS Configurations.view', route: '/pmsconfiguration' },
    { permission: 'Holidays.view', route: '/holidays' },
    { permission: 'Contacts Directory.view', route: '/contacts-directory' },
    { permission: 'Blood Bank.view', route: '/blood-bank' },
    { permission: 'Phone Book.view', route: '/phonebook' },
    { permission: 'Settings Icon.view', route: '/settings' }
  ];

  const myInfoPermissions = [
    ...this.myInfoRoutes,
    ...this.myInfoJobRoutes,
    ...this.myInfoDocumentsRoutes,
    ...this.myInfoTeamMembersRoutes,
    ...this.myInfoOnBoradRequest
  ];

  // Step 1: Check Dashboard or Employees
  for (const item of primaryPermissions) {
    if (this.rbac.allowedToAccess(item.permission)) {
      const finalRoute = this.goToAccessibleRoute(item.route);
      if (finalRoute) {
        this.router.navigate([finalRoute]);
        return;
      }
    }
  }

  // Step 2: Check My Info permissions
  for (const item of myInfoPermissions) {
    if (this.rbac.allowedToAccess(item.permission)) {
      const myInfoRoute = this.goToAccessibleRoute('/myinfo');
      if (myInfoRoute) {
        this.router.navigate([myInfoRoute]);
        return;
      }
    }
  }

  // Step 3: Check remaining permissions
  for (const item of permissionsWithRoutes) {
    if (this.rbac.allowedToAccess(item.permission)) {
      const finalRoute = item.route === '/settings'
        ? item.route
        : this.goToAccessibleRoute(item.route);

      if (finalRoute) {
        this.router.navigate([finalRoute]);
        return;
      }
    }
  }

  // Step 4: Fallback
  this.router.navigate(['/unauthorized']);
}



  goToAccessibleRoute(actualRoute: string) {
    return this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
  }



  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}