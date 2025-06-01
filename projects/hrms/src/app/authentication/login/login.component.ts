import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Carousel } from 'primeng/carousel';
@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule, Carousel,],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class LoginComponent {
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
    config: NgbModalConfig, private modalService: NgbModal,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    if (this.http.isLoggedIn()) {
      this.router.navigate(['/uservalidation']);
    }
    this.returnUrl = this.activatedRoute.snapshot.queryParamMap.get("returnUrl")
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
}