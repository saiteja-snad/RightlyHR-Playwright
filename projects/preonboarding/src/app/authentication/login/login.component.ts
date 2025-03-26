import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../http-services/auth.service';
import { BnNgIdleService } from 'bn-ng-idle';
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  loginfrom!: FormGroup;
  visible: boolean = false;
  changetype: boolean = true;
  subscription!: Subscription;
  Logindata = {} as any;
  wrongCredentials: any;

  constructor(private readonly fb: FormBuilder, public router: Router, private http: AuthService, private bnIdle: BnNgIdleService,) { }

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
    this.loginfrom = this.fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    })
  }

  viewpassword() {
    this.visible = !this.visible;
    this.changetype = !this.changetype;
  }

  //function for disable error
  errorCheck(Value: any) {
    console.log(Value);
    if (Value == "" || Value == null) {
      this.wrongCredentials = ''
    }
  }

  login(f: NgForm) {
    this.subscription = this.http.login(`ProspectiveLogin/EmployeeLogin`, this.loginfrom).subscribe({
      next: (res: any) => {
        console.log(res);
        if (res != null) {
          this.http.prospectiveStoreToten(res.token.token)
          localStorage.setItem("prospectiveemppersonaldata", JSON.stringify(res.token.employeeData));

          if (res.token.token) {
            this.router.navigate(['/preonboarding/jobapplication']);
          }
          else {
            //this.router.navigate(['/login']);  
          }
        }
        else {

        }
      },
      error: (err: any) => {
        console.log(err);
        if (err.status == '401') {
          this.wrongCredentials = err.error
        }
        else {

        }
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  onCheckboxChange() {
    this.wrongCredentials = ''
  }
}