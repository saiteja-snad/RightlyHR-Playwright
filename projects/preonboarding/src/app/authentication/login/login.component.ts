import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../http-services/auth.service';
import { BnNgIdleService } from 'bn-ng-idle';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { FormValidationService } from '../../common-services/form-validation.service';
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, Toast],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService],
  encapsulation: ViewEncapsulation.None
})

export class LoginComponent {
  loginform!: FormGroup;
  showPassword = false;
  subscription!: Subscription;
  wrongCredentials: any;
  spinnerLoader = false;

  constructor(private readonly fb: FormBuilder, public router: Router, private http: AuthService, private bnIdle: BnNgIdleService,
    public formvalidationService:FormValidationService) { }

  ngOnInit() {
    this.initiallogin();
    this.bnIdle.startWatching(3600).subscribe((isTimeOut: boolean) => {
      if (isTimeOut) {
        localStorage.removeItem('prospectiveusertoken')
        this.router.navigate(['/login']);
        this.bnIdle.resetTimer();
      }
    })
  }

  initiallogin() {
    this.loginform = this.fb.group({
      username: [null, [Validators.required, Validators.email]],
      password: [null, Validators.required]
    })
    this.loginform.valueChanges.subscribe(() => {
      this.wrongCredentials = '';
    })
  }



  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  //function for disable error
  errorCheck(Value: any) {
    console.log(Value);
    if (Value == "" || Value == null) {
      this.wrongCredentials = ''
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
      password: formData.password
    }
    this.subscription = this.http.login(`ProspectiveLogin/EmployeeLogin`, payload).subscribe({
      next: (res: any) => {
        if (res != null) {
          this.http.prospectiveStoreToten(res.token.token)
          localStorage.setItem("prospectiveemppersonaldata", JSON.stringify(res.token.employeeData));
          if (res.token.token) {
            this.router.navigate(['/job-details']);
          }
        }
        this.spinnerLoader = false;
      },
      error: (err: any) => {
        console.log(err);
        this.wrongCredentials = err.error;
        this.spinnerLoader = false;
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}