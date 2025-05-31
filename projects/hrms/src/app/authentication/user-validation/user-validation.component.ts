import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { MsalService } from '@azure/msal-angular';
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-user-validation',
  imports: [FormsModule, CommonModule],
  templateUrl: './user-validation.component.html',
  styleUrl: './user-validation.component.scss'
})

export class UserValidationComponent {
  subscription!: Subscription;
  name!: string

  constructor(
    private _msalService: MsalService,
    private router: Router,
    private http: HttpService,
    private accessNav: AccessNavigationService
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
            } else if (response.roles.includes('ADMIN') || response.roles.includes('HR MANAGER')) {
              this.router.navigate(['/admin/dashboard']);
            } else {
              const route = this.accessNav.navigateToAccessedHeaderRoute('/myinfo');
              if (route) {
                this.router.navigate([route]);
              }
              else {
                this.router.navigate(['/unauthorized']);
              }
            }
          }, 2000);

        } else {
          const route = this.accessNav.navigateToAccessedHeaderRoute('/myinfo');
          if (route) {
            this.router.navigate([route]);
          }
          else {
            this.router.navigate(['/unauthorized']);
          }
        }
      },
      error: (err) => {
        const route = this.accessNav.navigateToAccessedHeaderRoute('/myinfo');
        if (route) {
          this.router.navigate([route]);
        }
        else {
          this.router.navigate(['/unauthorized']);
        }
      },
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }
}