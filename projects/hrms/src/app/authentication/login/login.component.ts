import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Carousel } from 'primeng/carousel';
import { FormValidationsService } from '../../services/form-validations.service';
import { SignalsService } from '../../services/signals.service';
import { GoogleSigninButtonModule, SocialAuthService, SocialLoginModule, SocialUser } from '@abacritt/angularx-social-login';
@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, Carousel, ReactiveFormsModule, GoogleSigninButtonModule],
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
  spinnerLoader = false;
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
    public formsValidation: FormValidationsService,
    public signal: SignalsService
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.initializeAuthState();
  }

  ngOnInit(): void {
    if (this.http.isLoggedIn()) {
      this.router.navigateByUrl('/uservalidation');
    }

    this.returnUrl = this.activatedRoute.snapshot.queryParamMap.get("returnUrl");
    this.intialiseForm();
  }

  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  goToUserValidate() {
    if (this.signal.authSignal() !== '') {
      this.signal.authSignal.set('');
    }
    this.http.loginWithMicrosoft();
  }

  // loginWithGoogle() {
  //   if (this.signal.authSignal() !== '') {
  //     this.signal.authSignal.set('');
  //   }
  //   this.http.loginWithGoogle();
  // }

  viewpassword() {
    this.visible = !this.visible;
    this.changetype = !this.changetype;
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
      this.signal.authSignal.set('');
    });
  }

  async onSubmit(loginForm: FormGroup) {
    if (loginForm.valid) {
      this.spinnerLoader = true;

      const loginData = loginForm.value;
      const deviceName = this.http.getDeviceName();
      const ipAddress = await this.http.getIpAddress();

      const payload = {
        email: loginData.email,
        password: loginData.password,
        deviceName,
        ipAddress,
        userAgent: navigator.userAgent
      };

      this.subscription = this.http.login(`v2/Auth/login`, payload).subscribe({
        next: (res: any) => {
          this.http.storeAuthResponse(res);
          setTimeout(() => {
            this.router.navigate(['/uservalidation']);
          }, 2000);
        },
        error: (err: any) => {
          this.spinnerLoader = false;
          this.Status = 'Invalid Email ID or Password';
          this.signal.authSignal.set(err.error?.message || 'Login failed. Please try again');
        }
      });
    } else {
      console.log('Form invalid');
    }
  }

  private initializeAuthState() {
    this.subscription = this.http.getUser$().subscribe({
      next: (user) => {
        if (user) {
          console.log('User authenticated');
        }
      },
      error: (err) => {
        this.Status = err?.error?.message || 'Something went wrong';
      },
      complete:() =>{
        this.Status= '';
      }
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}