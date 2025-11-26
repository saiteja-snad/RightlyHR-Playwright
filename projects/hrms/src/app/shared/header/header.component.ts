import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { DomSanitizer } from '@angular/platform-browser';
import { RbacService } from '../../services/rbac.service';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { OpenModalService } from '../../services/open-modal.service';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Skeleton } from 'primeng/skeleton';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CalenderIconComponent } from "../../icons/calender-icon/calender-icon.component";
import { ItSupportIconComponent } from "../../icons/it-support-icon/it-support-icon.component";
import { ProfileIconComponent } from "../../icons/profile-icon/profile-icon.component";
@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, TranslateModule, Skeleton, ReactiveFormsModule, CalenderIconComponent, ItSupportIconComponent, ProfileIconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  empinfo: any;
  imageUrl: any;
  empdata = {} as any;
  subscription!: Subscription;
  jobRole: any;
  profilePic: any;
  img: any;
  spinnerLoader = false;
  isloading: boolean = false;
  currentUser: any;
  @ViewChild('logoutpopup') logoutpopup: any;

  constructor(
    public readonly router: Router,
    private http: HttpService,
    private sanitizer: DomSanitizer,
    public rbac: RbacService,
    private authService: AuthService,
    private modalservie: NgbModal,
    private conformationPopup: OpenModalService,
    private accessNav: AccessNavigationService,
    private fb: FormBuilder
  ) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') ?? '{}');
    if (!this.currentUser.loginType) {
      this.currentUser.loginType = '';
    }
    this.getEmployeeId();
    this.getJobDetails();
    this.http.profliepicadd$.subscribe(() => {
      this.getEmployeeId();
    });
  }

  goToAccessibleRoute(actualRoute: string) {
    const route = this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
    if (route) {
      this.router.navigate([route]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
    this.handleAction();
  }

  handleAction() {
    // Close dropdown manually via DOM
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    dropdownMenu?.classList.remove('show');
    dropdownToggle?.classList.remove('show');
  }

  onSelectprofilePicDownload(employee: any) {
    if (employee.profileUrl) {
      this.subscription = this.http
        .DownloadDataWithQuery('FileSystem/Downloadfile', employee.profileUrl)
        .subscribe({
          next: (res: any) => {
            let blob = new Blob([res['body']], { type: 'image/png' });
            let objectURL = URL.createObjectURL(blob);
            this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          },
          error: (reason) => {
            //console.log(reason),
          },
        });
    }
  }
  getEmployeeId() {
    this.isloading = true;
    let employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          this.isloading = false;
          this.empdata = data;
          this.imageUrl = this.empdata.profileUrl;
          this.onSelectprofilePicDownload(this.empdata);
        },
        error: (reason: any) => {
          this.isloading = false
        },
        complete: () => {
          this.isloading = false;
        },
      });
  }

  getJobDetails() {
    this.isloading = true;
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`JobDetails/Empname/${EmployeeId}`)
      .subscribe({
        next: (data: any) => {
          this.isloading = false;
          let jobdetails = data;
          this.jobRole = jobdetails[0]?.jobRole;
        },
        error: (reason: any) => {
          console.error(reason);
          this.isloading = false;
        },
        complete: () => {
          this.isloading = false;
        },
      });
  }

  chooseNewProfileHeader(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const maxSize = 1024 * 1024; // 1MB
      if (!allowedTypes.includes(file.type)) {
        this.conformationPopup.openErrorModal(
          'Invalid file type. Only PNG, JPG, and JPEG are allowed.'
        );
        input.value = '';
        return;
      }
      if (file.size > maxSize) {
        this.conformationPopup.openErrorModal(
          'Please choose a file smaller than 1MB.'
        );
        input.value = '';
        return;
      }
      this.img = file;
      input.value = ''; // clear input if needed to allow same file re-selection
      this.onProfilepicSelectedheader(this.img);
    }
  }

  onProfilepicSelectedheader(img: any) {
    let file = img;
    let d: Date = new Date();
    this.profilePic = this.renameFile(
      file,
      `${this.empinfo.employeeId}_${d.getTime()}_${file.name}`
    );
    this.postUploadprofilePicheader();
  }

  private renameFile(originalFile: File, newName: string) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  postUploadprofilePicheader() {
    let filePath = `/Profilepics/${this.empinfo.employeeId}`;
    this.subscription = this.http
      .uploadFileWithQuery(
        'FileSystem/uploadfiletodirectory',
        filePath,
        this.profilePic
      )
      .subscribe({
        next: (data: any) => {
          if (data) {
            this.empinfo.employeeId = this.empinfo.employeeId;
            this.empinfo.profileUrl = data.path;
            this.subscription = this.http
              .postdata('Employeedata/UPDATER', this.empinfo)
              .subscribe({
                next: (data: any) => {
                  this.http.setprofileDetails();
                  this.conformationPopup.openSuccessModal(
                    'Profile picture updated successfully'
                  );
                  this.getEmployeeId();
                },
                error: (reason: any) => {
                  this.conformationPopup.openErrorModal(
                    reason.error.message || 'Profile picture update failed'
                  );
                },
              });
          }
        },
      });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedHeaderRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  async onLogout() {
    this.spinnerLoader = true;
    this.authService.logout();
  }

  close() {
    this.modalservie.dismissAll();
  }

  openlogoutModal() {
    this.modalservie.open(this.logoutpopup, { centered: true, backdrop: 'static', keyboard: false });
  }

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }

  // Change Password
  changePasswordForm!: FormGroup;
  StrongPasswordRegx: RegExp = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])(?!.*\s).{8,}$/;
  intilaizeChangePasswordForm() {
    this.changePasswordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(this.StrongPasswordRegx)]],
        confirmPassword: ['', [Validators.required, Validators.maxLength(15), Validators.pattern(this.StrongPasswordRegx)]],
      }
    );

    this.changePasswordForm.valueChanges.subscribe(() => {
      this.backendError = '';
    })
  }

  openchangepasswordModal(content: any) {
    this.intilaizeChangePasswordForm();
    this.modalservie.open(content, { centered: true, backdrop: 'static', keyboard: false });
  }

  showPassword1 = false;
  showPassword2 = false;
  showPassword3 = false;
  togglePasswordVisibility1() {
    this.showPassword1 = !this.showPassword1;
  }

  togglePasswordVisibility2() {
    this.showPassword2 = !this.showPassword2;
  }

  togglePasswordVisibility3() {
    this.showPassword3 = !this.showPassword3;
  }

  resetPasswordIcons() {
    this.showPassword1 = false;
    this.showPassword2 = false;
    this.showPassword3 = false;
  }

  closeModal() {
    this.modalservie.dismissAll();
    this.changePasswordForm.reset();
    this.resetPasswordIcons();
  }

  backendError!: string;
  onSubmit(form: FormGroup): void {
    if (form.invalid) {
      form.markAllAsTouched();
      return;
    }
    this.spinnerLoader = true;
    const formData = form.value;
    const payload = {
      employeeId: this.empinfo.employeeId,
      password: formData.newPassword,
      currentPassword: formData.currentPassword,
      confirmPassword: formData.confirmPassword
    };
    this.http.postdata('Employeedata/internal-update-password', payload)
      .subscribe({
        next: (response: any) => {
          this.modalservie.dismissAll();
          this.conformationPopup.openSuccessModal('Password changed successfully');
          this.resetPasswordIcons();
          setTimeout(() => {
            this.spinnerLoader = false;
            this.modalservie.dismissAll()
            this.onLogout();
          }, 2000)
        },
        error: (error: any) => {
          this.spinnerLoader = false;
          if (error?.error?.message) {
            this.backendError = error.error.message;
          } else if (typeof error?.error === 'string') {
            this.backendError = error.error;
          } else {
            this.backendError = 'Failed to change password. Please try again later.';
          }
        }
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}