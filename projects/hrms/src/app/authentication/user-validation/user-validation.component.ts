import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { RbacService } from '../../services/rbac.service';
import { MY_INFO_DOCUMENTS_ROUTES, MY_INFO_JOB_ROUTES, MY_INFO_ONBOARD_REQUEST, MY_INFO_PERSONAL_ROUTES, MY_INFO_TEAM_MEMBERS } from '../../permission-route.constants';
import { environment } from '../../../environments/environment';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from '../../services/auth.service';
import { SignalsService } from '../../services/signals.service';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
@Component({
  selector: 'app-user-validation',
  imports: [
    FormsModule,
    CommonModule,
    TranslateModule
  ],
  templateUrl: './user-validation.component.html',
  styleUrl: './user-validation.component.scss'
})

export class UserValidationComponent implements OnInit, OnDestroy {
  subscription!: Subscription;
  name!: string;
  loginReposne: any
  myInfoRoutes = MY_INFO_PERSONAL_ROUTES;
  myInfoJobRoutes = MY_INFO_JOB_ROUTES;
  myInfoDocumentsRoutes = MY_INFO_DOCUMENTS_ROUTES;
  myInfoTeamMembersRoutes = MY_INFO_TEAM_MEMBERS;
  myInfoOnBoradRequest = MY_INFO_ONBOARD_REQUEST;
  @ViewChild('new_feature_validation_popup', { static: true }) newFeatureValidationPopup: any;


  constructor(
    private router: Router,
    private http: HttpService,
    private accessNav: AccessNavigationService,
    private rbac: RbacService,
    private modalService: NgbModal,
    private auth: AuthService,
    public signal: SignalsService
  ) { }

  async ngOnInit() {
    this.postLogin();
  }

  async postLogin() {

    const tokens = await this.auth.getTokenResponse();
    const storedRes = localStorage.getItem('currentUser');

    // Case 1: Microsoft tokens exist but no stored response → first time login
    if (tokens && !storedRes) {
      const deviceName = this.auth.getDeviceName();
      const ipAddress = await this.auth.getIpAddress();

      const payload = {
        provider: 'Microsoft',
        accessToken: tokens.id_token,
        deviceName,
        ipAddress,
        userAgent: navigator.userAgent
      };

      this.auth.postData('v2/Auth/social', payload).subscribe({
        next: (res: any) => {
          this.auth.storeAuthResponse(res);
          this.getUserDetails(res.email);
        },
        error: (err) => {
          this.signal.authSignal.set(err.error?.message || 'Social login failed. Please try again');
          this.router.navigate(['/unauthorized']);
        }
      });

      return;
    }

    if (storedRes) {
      const parsedRes = JSON.parse(storedRes);
      this.getUserDetails(parsedRes.email);
      return;
    }
    this.router.navigate(['/login']);
  }


  // async postLogin() {
  //   // Check for Microsoft OAuth token first
  //   const oauthTokens = await this.authService.getTokenResponse();
  //   const storedRes = localStorage.getItem('currentUser');

  //   if (oauthTokens && !storedRes) {
  //     const deviceName = this.authService.getDeviceName();
  //     const ipAddress = await this.authService.getIpAddress();
  //     const payload = {
  //       provider: 'Microsoft',
  //       accessToken: oauthTokens.id_token,
  //       deviceName,
  //       ipAddress,
  //       userAgent: navigator.userAgent
  //     };
  //     this.executeSocialLogin(payload);
  //     return;
  //   }

  //   // Check for Google SocialAuth token
  //   const socialUser = this.authService.getUser();
  //   if (socialUser && !storedRes) {
  //     const deviceName = this.authService.getDeviceName();
  //     const ipAddress = await this.authService.getIpAddress();
  //     const payload = {
  //       provider: 'Google',
  //       accessToken: socialUser.idToken,
  //       deviceName,
  //       ipAddress,
  //       userAgent: navigator.userAgent
  //     };
  //     this.executeSocialLogin(payload);
  //     return;
  //   }

  //   if (storedRes) {
  //     const parsedRes = JSON.parse(storedRes);
  //     this.getUserDetails(parsedRes.employeeId);
  //     return;
  //   }

  //   localStorage.clear();
  //   sessionStorage.clear();
  //   this.router.navigate(['/login']);
  // }

  // executeSocialLogin(payload: any) {
  //   this.authService.postData('Auth/social', payload).subscribe({
  //     next: (res: any) => {
  //       this.authService.storeAuthResponse(res);
  //       console.log('Social Backend login success:', res);
  //       this.getUserDetails(res.employeeId); // Note: API might return email or employeeId, adjust based on response structure
  //     },
  //     error: (err) => {
  //       this.http.loginErrorSignal.set(err?.error?.message || 'Social login failed.');
  //       this.router.navigate(['/login']);
  //     },
  //     complete: () => {
  //       this.http.loginErrorSignal.set('');
  //     }
  //   });
  // }


  getUserDetails(email: string) {
    this.subscription = this.http.getUserDetails(email).subscribe({
      next: (response: any) => {
        if (response.empdatum) {
          this.loginReposne = response;
          this.name = `${response.empdatum.firstName} ${response.empdatum.middleName ?? ''} ${response.empdatum.lastName ?? ''}`;
          localStorage.setItem('rightlyHrRoleClaims', JSON.stringify(response.claims));
          localStorage.setItem('rightlyHrUser', JSON.stringify(response.empdatum));
          localStorage.setItem('rightlyHrUserRoles', JSON.stringify(response.roles));
          if (response.enableNewVersion) {
            if (!response.betaConfiguration) {
              this.modalService.open(this.newFeatureValidationPopup, { backdrop: 'static', keyboard: false, centered: true });
            } else if (response.betaConfiguration && response.betaConfiguration.popUpShown) {
              // setTimeout(() => {
              //   if (response.roles.length <= 0) {
              //     this.router.navigate(['/unauthorized']);
              //   } else {

              //     this.navigateBasedOnPermission();
              //   }
              // }, 2000);


              this.stayBack()

            } else {
              this.modalService.open(this.newFeatureValidationPopup, { backdrop: 'static', keyboard: false, centered: true });
              // this.navigateToOldUIApplication();
            }
          } else {
            this.stayBack()
          }
        } else {
          this.router.navigate(['/unauthorized']);
        }
      },
      error: (err) => {
        this.router.navigate(['/login']);
      },
    });
  }


  navigateBasedOnPermission() {
    const primaryPermissions = [
      { permission: 'Dashboard.view', route: '/dashboard' },
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


    // Step 3: Check My Info permissions
    for (const item of myInfoPermissions) {
      if (this.rbac.allowedToAccess(item.permission)) {
        const myInfoRoute = this.goToAccessibleRoute('/myinfo');
        if (myInfoRoute) {
          this.router.navigate([myInfoRoute]);
          return;
        }
      }
    }

    // Step 4: Check remaining permissions
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

    // Step 5: Fallback
    this.router.navigate(['/unauthorized']);
  }



  goToAccessibleRoute(actualRoute: string) {
    return this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
  }


  onClickGetStarted() {
    this.subscription = this.http.postdata('BetaUser/post', { employeeId: this.loginReposne.empdatum.employeeId, popUpShown: true }).subscribe({
      next: (response: any) => {
        this.modalService.dismissAll();
        this.stayBack()
      },
      error: (err) => {
        console.error(err);
      },
    })
  }


  navigateToOldUIApplication() {
    window.location.href = environment.oldVersionUrl || 'https://snad.rightlyhr.com/uservalidation';
  }

  stayBack() {
    this.modalService.dismissAll();

    if (this.loginReposne.roles) {
      setTimeout(() => {
        if (this.loginReposne.roles.length <= 0) {
          this.router.navigate(['/unauthorized']);
        } else {

          this.navigateBasedOnPermission();
          localStorage.removeItem('loadEntitlement')
          localStorage.removeItem('carryForwardJobId')
          localStorage.removeItem('intialloadEntitlement')
        }
      }, 2000);
    } else {
      this.router.navigate(['/unauthorized']);
    }

  }


  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}
