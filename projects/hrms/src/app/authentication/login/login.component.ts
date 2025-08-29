import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Carousel } from 'primeng/carousel';
import { FormValidationsService } from '../../services/form-validations.service';
@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, Carousel, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class LoginComponent implements OnInit, OnDestroy {
  errormsg: string | any;
  signIn = {} as any;
  visible = false;
  changetype = true;
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  Login = {} as any;
  subscription!: Subscription;
  returnUrl!: string | null;
  Status: any;
  carouselItems = [
    { subject: 'From onboarding to offboarding, manage every step of the employee journey with ease. RightlyHR streamlines your workflows and puts people first.' },
    { subject: 'Configure letters, automate approvals, and customize forms in just a few clicks. Say goodbye to paperwork chaos and hello to powerful simplicity.' },
    { subject: 'Get clarity with detailed reports, visual dashboards, and smart filters. Track what matters most — all in one clean, modern interface.' },
  ];


  constructor(
    private http: AuthService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    config: NgbModalConfig, private modalService: NgbModal,
    public formsValidation: FormValidationsService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    if (this.http.isLoggedIn()) {
      this.router.navigate(['/uservalidation']);
    }
    this.returnUrl = this.activatedRoute.snapshot.queryParamMap.get("returnUrl");
    this.intialiseForm();
  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  goToUserValidate() {
    this.router.navigate(['/uservalidation'])
  }

  dataSuccessMsg(msg: string) {
    this.Status = msg;
    this.openmodel(this.successhide);
    setTimeout(() => {
      this.modalService.dismissAll();
    }, 2000);
  }

  dataFailureMsg(msg: string) {
    this.Status = msg;
    this.openmodel(this.errorhide);
    setTimeout(() => {
      this.modalService.dismissAll();
    }, 2000);
  }

  viewpassword() {
    this.visible = !this.visible;
    this.changetype = !this.changetype;
  }

  login(f: NgForm) {
    this.subscription = this.http.login("User/login", this.signIn).subscribe({
      next: (res: any) => {
        if (res != null) {
          // this.toaster.success({detail:'Login Success',summary:'Logged in successfully',duration:3000})
          this.dataSuccessMsg('Loggin in successfully')
          this.http.storeToken(res)
          if (this.returnUrl) {
            this.router.navigate([this.returnUrl]);
          }
          else {
            this.router.navigate(["/admin"])
          }
        }
        else {
          //this.toaster.error({detail:'Login Failed',summary:'Invalid Email or Password',duration:3000})
          this.dataFailureMsg('Invalid Email or Password')
        }
      },
      error: (err: any) => {
        // this.toaster.error({detail:'Login Failed',summary:'Invalid Email or Password',duration:3000})
        this.dataFailureMsg('Invalid Email or Password')
      }
    })
  }

  // Normal Login

  loginForm!: FormGroup;
  intialiseForm() {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ],
      ],
      password: ['', Validators.required],
    });

    this.loginForm.valueChanges.subscribe(() => {
      this.Status = '';
    });
  }

  disableerrormsg: boolean = true;
  wrongCredentials: any;
  errorCheck(Value: any) {
    if (Value == '' || Value == null) {
      this.disableerrormsg = true;
      this.wrongCredentials = '';
    }
  }

  onSubmit(loginForm: FormGroup) {
    if (loginForm.valid) {
      const loginData = loginForm.value;
      this.subscription = this.http.login(`v2/Auth/login`, loginData).subscribe({
          next: (res: any) => {
            if (res != null) {
              this.http.storeToken(res);
              if (res.token) {
                this.router.navigate(['/uservalidation']);
              } else {
                //this.router.navigate(['/login']);
              }
            } else {
              this.disableerrormsg = false;
            }
          },
          error: (err: any) => {
            console.log(err);
            if (err.status == '401') {
              this.Status = err.error.message;
            } else {
              this.disableerrormsg = false;
            }
          },
        });
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}