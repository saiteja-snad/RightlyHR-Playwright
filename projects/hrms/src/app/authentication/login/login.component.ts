import { Component, ViewChild } from '@angular/core';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';


@Component({
  selector: 'app-login',
  imports: [FormsModule,CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  errormsg:string|any;
  signIn={} as any;
  visible = false;
  changetype = true;
  @ViewChild('successhide') private readonly successhide!:NgbModal;
  @ViewChild('errorhide') private readonly errorhide!:NgbModal;
  Login={} as any;
  subscription!: Subscription;
  returnUrl!:string|null
  Status:any
  constructor(
    private http:AuthService,
    private router:Router,
    private activatedRoute:ActivatedRoute,
    config: NgbModalConfig, private modalService: NgbModal,private msalService: MsalService
    ){
      config.backdrop = 'static';
    config.keyboard = false;
    }

  ngOnInit():void{
    if(this.http.isLoggedIn()){
      this.router.navigate(['/admin']);
    }
    this.returnUrl = this.activatedRoute.snapshot.queryParamMap.get("returnUrl")
  }
  openmodel(content: any) {
    this.modalService.open(content, { centered: true })
  }

  dataSuccessMsg(msg:string){
    this.Status = msg;
          this.openmodel(this.successhide);
          setTimeout(() => {
            this.modalService.dismissAll();
          }, 2000);

  }

  dataFailureMsg(msg:string){
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

  login(f:NgForm){
  this.subscription=this.http.login("User/login",this.signIn).subscribe({
    next:(res:any)=>{
      if(res != null){
       // this.toaster.success({detail:'Login Success',summary:'Logged in successfully',duration:3000})
        this.dataSuccessMsg('Loggin in successfully')
        this.http.storeToken(res)
        if(this.returnUrl){
          this.router.navigate([this.returnUrl]);
        }
        else{
          this.router.navigate(["/admin"])
        }
      }
      else{
        //this.toaster.error({detail:'Login Failed',summary:'Invalid Email or Password',duration:3000})
        this.dataFailureMsg('Invalid Email or Password')
      }
    },
    error:(err:any)=>{
     // this.toaster.error({detail:'Login Failed',summary:'Invalid Email or Password',duration:3000})
      this.dataFailureMsg('Invalid Email or Password')
    }
  })
  }

}
