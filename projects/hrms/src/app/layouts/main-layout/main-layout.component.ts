import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { SidenavComponent } from "../../shared/sidenav/sidenav.component";
import { HeaderComponent } from "../../shared/header/header.component";
import { Router, RouterOutlet } from '@angular/router';
import { IJob } from '../../Interfaces/letters-model';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { FormValidationsService } from '../../services/form-validations.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { PredefinedThemesService } from '../../services/theme-service/predefined-themes.service';
@Component({
  selector: 'app-main-layout',
  imports: [SidenavComponent, HeaderComponent, RouterOutlet, CommonModule, ReactiveFormsModule,],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})

export class MainLayoutComponent implements OnInit, OnDestroy {
  changePasswordForm!: FormGroup;
  getStartedForm!: FormGroup;
  empinfo = {} as IJob;
  employeeName: any
  showPassword1 = false;
  showPassword2 = false;
  subscription!: Subscription;
  @ViewChild('changepasswordModal', { static: true }) changepasswordModal!: TemplateRef<any>;
  @ViewChild('getstarted', { static: true }) getstarted!: TemplateRef<any>;

  StrongPasswordRegx: RegExp = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])(?!.*\s).{8,}$/;

  constructor(private fb: FormBuilder, public readonly router: Router, private http: HttpService,
    private modalService: NgbModal, private conformationPopup: OpenModalService, public formsValidation: FormValidationsService,
    private predefinedThemesService: PredefinedThemesService) { }

   async ngOnInit() {
    this.intilaizeChangePasswordForm();
    this.intializeGetStartedForm();
    this.empinfo = JSON.parse(localStorage.getItem('currentUser') || '{}');
    this.employeeName = this.empinfo.name;
    this.getUserPreference(this.empinfo.employeeId);
    await this.predefinedThemesService.initTheme();
    await this.predefinedThemesService.initFont();
  }

  getUserPreference(employeeId: number) {
    this.http.getData(`Employeedata/get-user-preference/${employeeId}`).subscribe({
      next: (res: any) => {
        if (!res.data.isUserRegistred) {
          this.openModal(this.getstarted);
        }
        else if (this.empinfo?.loginType?.toLowerCase() === 'classic login' && !res.data.isPasswordChanged) {
          // Open change password modal
          this.modalService.open(this.changepasswordModal, {centered: true, backdrop: 'static', keyboard: false, size: 'xl'});
        }
      }
    })
  }

  openModal(modal: any) {
    this.modalService.open(modal, { centered: true, backdrop: 'static', keyboard: false, size: 'xl' });
  }

  getStartYourLogin() {
    if (this.empinfo.employeeId) {
      this.updateAcceptanceStatus(this.empinfo.employeeId);
    }
  }

  updateAcceptanceStatus(employeeId: number) {
    this.subscription = this.http.postbyId(`Employeedata/update-registration/${employeeId}`).subscribe({
      next: (res: any) => {
        this.modalService.dismissAll();
        this.getUserPreference(this.empinfo.employeeId);
      },
      error: (err) => {
        console.error('Error updating registration status:', err);
      }
    });
  }

  intilaizeChangePasswordForm() {
    this.changePasswordForm = this.fb.group(
      {
        newPassword: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(this.StrongPasswordRegx)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  intializeGetStartedForm() {
    this.getStartedForm = this.fb.group({
      terms: [false, Validators.requiredTrue]
    });
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    const payload = {
      password: this.changePasswordForm.value.newPassword,
      employeeId: this.empinfo.employeeId,
    };
    this.http.postdata('Employeedata/internal-update-password', payload).subscribe({
      next: (response: any) => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Your password has been reset successfully. Please log in again using your new password.');
        this.resetPasswordIcons();
        setTimeout(() => {
          this.onLogout();
        }, 3000);
      },
      error: (error: any) => {
        this.conformationPopup.openErrorModal('Failed to change password. Please try again later.');
      },
    });
  }

  onLogout() {
    this.modalService.dismissAll();
    this.router.navigate(['/login']);
    localStorage.clear();
  }

  togglePasswordVisibility1() {
    this.showPassword1 = !this.showPassword1;
  }

  togglePasswordVisibility2() {
    this.showPassword2 = !this.showPassword2;
  }

  resetPasswordIcons() {
    this.showPassword1 = false;
    this.showPassword2 = false;
  }

  closeModal() {
    this.modalService.dismissAll();
    this.changePasswordForm.reset();
    this.resetPasswordIcons();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
} 