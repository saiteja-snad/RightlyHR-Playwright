import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { finalize, Subscription } from 'rxjs';
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
  spinnerLoader = false;
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

      console.log("User is logged in, navigating...");
      this.router.navigateByUrl('/uservalidation')
        .then(ok => console.log("Navigation success?", ok))
        .catch(err => console.error("Navigation failed:", err));
    }

    this.returnUrl = this.activatedRoute.snapshot.queryParamMap.get("returnUrl");
    this.intialiseForm();
  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  goToUserValidate() {
    this.http.loginWithMicrosoft();
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

  // Classic Login
  loginForm!: FormGroup;
  intialiseForm() {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          Validators.required,
          Validators.pattern('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'),
        ],
      ],
      password: ['', Validators.required],
    });

    this.loginForm.valueChanges.subscribe(() => {
      this.Status = '';
      // this.disableerrormsg= false;
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

  async onSubmit(loginForm: FormGroup) {
    console.log('Submit clicked, spinnerLoader:', this.spinnerLoader);

    if (loginForm.valid) {
      this.spinnerLoader = true;
      console.log('Form valid, calling API...');

      const loginData = loginForm.value;
      const deviceName = this.http.getDeviceName();
      const ipAddress = await this.http.getIpAddress();

      const payload = {
        email: loginData.email,
        password: loginData.password,
        deviceName,
        ipAddress
      };

      this.subscription = this.http.login(`v2/Auth/login`, payload)
        .pipe(finalize(() => {
          console.log('Finalize triggered, resetting loader');
          this.spinnerLoader = false;
        }))
        .subscribe({
          next: (res: any) => {
            console.log('API success:', res);
            if (res) {
              this.http.storeAuthResponse(res);
              localStorage.setItem('loginType', 'Classic Login');
              setTimeout(() => {
                console.log('Navigating to /uservalidation');
                this.router.navigate(['/uservalidation']);
              }, 2000);
            } else {
              this.disableerrormsg = false;
            }
          },
          error: (err: any) => {
            console.error('API error:', err);
            this.Status = 'Invalid Email ID or Password';
          }
        });
    } else {
      console.log('Form invalid');
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}