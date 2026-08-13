import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../http-services/auth.service';
import { BnNgIdleService } from 'bn-ng-idle';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormValidationService } from '../../common-services/form-validation.service';
import { TranslateModule } from '@ngx-translate/core';
import { TenantService } from '../../common-services/tenant.service';
import { PopupService } from '../../common-services/popup.service';
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, Toast, TranslateModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None
})

export class LoginComponent implements OnInit, OnDestroy {
  loginform!: FormGroup;
  showPassword = false;
  subscription!: Subscription;
  wrongCredentials: any;
  spinnerLoader = false;
  domainVerificationStatus: 'idle' | 'verifying' | 'verified' | 'invalid' = 'idle';

  constructor(
    private readonly fb: FormBuilder,
    public router: Router,
    private http: AuthService,
    private bnIdle: BnNgIdleService,
    public formvalidationService: FormValidationService,
    private activatedRoute: ActivatedRoute,
    public tenantService: TenantService,
    private popupService: PopupService
  ) { }

  ngOnInit() {
    this.initiallogin();
    this.bnIdle.startWatching(3600).subscribe((isTimeOut: boolean) => {
      if (isTimeOut) {
        localStorage.removeItem('prospectiveusertoken');
        this.router.navigate(['/login']);
        this.bnIdle.resetTimer();
      }
    });

    const domainFromRoute = this.activatedRoute.snapshot.queryParamMap.get('domain') || '';
    if (domainFromRoute) {
      localStorage.setItem('tenantDomain', domainFromRoute);
    }
    this.initDomainVerification();
  }

  private initDomainVerification(): void {
    const domain = this.tenantService.getDomainFromHostname();
    if (domain) {
      this.domainVerificationStatus = 'verifying';
      this.tenantService.verifyDomain(domain).subscribe({
        next: (response) => {
          if (response && response.isValid !== false) {
            this.domainVerificationStatus = 'verified';
          } else {
            this.domainVerificationStatus = 'invalid';
            this.popupService.openError('Domain does not exist.');
          }
        },
        error: (err) => {
          this.domainVerificationStatus = 'invalid';
          this.popupService.openError(err?.error?.message || 'Domain does not exist.');
        }
      });
    } else {
      this.domainVerificationStatus = 'invalid';
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const msg = isLocal
        ? 'Domain not found.'
        : 'Invalid tenant URL. Please use the format: snad.rightlyhr.com';
      setTimeout(() => this.popupService.openError(msg));
    }
  }

  get isDomainVerified(): boolean {
    return this.domainVerificationStatus === 'verified';
  }

  initiallogin() {
    this.loginform = this.fb.group({
      username: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]
    });
    this.loginform.valueChanges.subscribe(() => {
      this.wrongCredentials = '';
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  errorCheck(Value: any) {
    if (Value == '' || Value == null) {
      this.wrongCredentials = '';
    }
  }

  login(form: FormGroup) {
    this.spinnerLoader = true;
    if (form.invalid) {
      return;
    }
    const formData = form.value;
    const payload = {
      emailaddress: formData.username,
      password: formData.password,
      domain: this.tenantService.currentDomain
    };
    this.subscription = this.http.login(`ProspectiveLogin/EmployeeLogin`, payload).subscribe({
      next: (res: any) => {
        if (res != null) {
          this.http.prospectiveStoreToten(res.token.token);
          localStorage.setItem('prospectiveemppersonaldata', JSON.stringify(res.token.employeeData));
          if (res.token.token) {
            this.router.navigate(['/job-details']);
          }
        }
        this.spinnerLoader = false;
      },
      error: (err: any) => {
        this.wrongCredentials = err.error;
        this.spinnerLoader = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}