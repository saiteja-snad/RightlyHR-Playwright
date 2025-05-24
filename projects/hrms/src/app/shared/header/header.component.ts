import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { DomSanitizer } from '@angular/platform-browser';
import { RbacService } from '../../services/rbac.service';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { MyinfoHeaderTabsComponent } from "../myinfo-tabs/myinfo-header-tabs/myinfo-header-tabs.component";
import { PersonalinfoHeaderTabsComponent } from "../personalinfo-tabs/personalinfo-header-tabs/personalinfo-header-tabs.component";
import { OpenModalService } from '../../services/open-modal.service';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { PmsSettingsTabsComponent } from "../pms-module-tabs/pms-settings-tabs/pms-settings-tabs.component";
import { PmsTabsComponent } from "../pms-module-tabs/pms-tabs/pms-tabs.component";
import { ItsuporrtHeaderTabsComponent } from "../itsuporrt-header-tabs/itsuporrt-header-tabs.component";
@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterModule, TranslateModule, MyinfoHeaderTabsComponent, PersonalinfoHeaderTabsComponent, PmsSettingsTabsComponent, PmsTabsComponent, ItsuporrtHeaderTabsComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})

export class HeaderComponent {
  empinfo: any;
  imageUrl: any;
  empdata={} as any;
  subscription!: Subscription;
  jobRole: any;
  profilePic: any;
  img:any
    spinnerLoader = false;
  @ViewChild('logoutpopup') logoutpopup: any;
  constructor(public readonly router: Router, private http: HttpService, private sanitizer: DomSanitizer,
    public rbac: RbacService,private authService: AuthService, private modalservie: NgbModal, private conformationPopup: OpenModalService,  private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.imageUrl = this.empinfo.profileUrl;
    this.onSelectprofilePicDownload(this.empinfo);
    this.http.profliepicadd$.subscribe(() => {
      this.imageUrl = this.empinfo.profileUrl;
    this.onSelectprofilePicDownload(this.empinfo);
    });
    this.getEmployeeId()
    this.getJobDetails()
  }

  onSelectprofilePicDownload(employee: any) {
    if (employee.profileUrl) {
      this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', employee.profileUrl).subscribe({
        next: (res: any) => {
          let blob = new Blob([res['body']], { type: 'image/png' });
          let objectURL = URL.createObjectURL(blob);
          this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        },
        error: (reason) => {
          //console.log(reason),
        }
      });
    }
  }
  getEmployeeId() {
    let employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empdata = data;
       
      },
      error: reason => console.log(reason)
    });
  }
  getJobDetails() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`JobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        let jobdetails = data
        this.jobRole = jobdetails[0]?.jobRole
      
    }
  })}

    chooseNewProfile(event: any) {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const maxSize = 1024 * 1024; // 1MB
  
      if (!allowedTypes.includes(file.type)) {
        this.conformationPopup.openErrorModal('Invalid file type. Only PNG, JPG, and JPEG are allowed.');
        input.value = '';
        return;
      }
  
      if (file.size > maxSize) {
        this.conformationPopup.openErrorModal('Please choose a file smaller than 1MB.');
        input.value = '';
        return;
      }
  
      this.img = file;
      input.value = ''; // clear input if needed to allow same file re-selection
      this.onProfilepicSelected(this.img);
    }
  }
 
  

  onProfilepicSelected(img: any) {
    let file = img;
    let d: Date = new Date()
    this.profilePic = this.renameFile(file, `${this.empinfo.employeeId}_${d.getTime()}_${file.name}`)
    this.postUploadprofilePic()
  }

  private renameFile(originalFile: File, newName: string) {
    return new File([originalFile], newName, {
      type: originalFile.type,
      lastModified: originalFile.lastModified,
    });
  }

  postUploadprofilePic() {
    let filePath = `/Profilepics/${this.empinfo.employeeId}`;
    this.subscription = this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filePath, this.profilePic).subscribe({
      next: (data: any) => {
        if (data) {
          this.empinfo.employeeId = this.empinfo.employeeId
          this.empinfo.profileUrl = data.path;
          this.subscription = this.http.postdata("Employeedata/UPDATER", this.empinfo).subscribe({
            next: (data: any) => {
              this.http.setprofileDetails()
              this.conformationPopup.openSuccessModal('Profile picture updated successfully')
              this.getEmployeeId();
            
            },
            error: (reason: any) => {
              this.conformationPopup.openErrorModal(reason.error.message || 'Profile picture update failed')

            },
          });
        }
      },

    });
  }
  isActive(route: string): boolean {
    return this.router.url.includes(route); //based on the route, header tab will be changes
  }

  showPmsTabs(): boolean {
    const includeRoutes = [
      '/pms/review-cycle',
      '/pms/review-cycle/create',
      '/pms/review-cycle/update',
      '/pms/review-cycle/view',
      '/pms/apprisal',
      '/pms/myPerformance/pending-review',
      '/pms/myPerformance/completed-review',
      '/pms/team-performance/pending-review',
      '/pms/team-performance/completed-review',
    ];
    return includeRoutes.includes(this.router.url);
  }

  showPmsConfigurationTabs(): boolean {
    const includeRoutes = [
      '/pmsconfiguration/assessor',
      '/pmsconfiguration/increment',
    ];
    return includeRoutes.includes(this.router.url);
  }

  navigateToAccessedRoute(route: string) {
    const actualRoute = this.accessNav.navigateToAccessedHeaderRoute(route);
    if (actualRoute) {
      this.router.navigate([actualRoute]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  onLogout() {
    this.authService.removeToken();
    localStorage.clear();
    window.location.href = "https://login.microsoftonline.com/common/oauth2/v2.0/logout";
  }

  close() {
    this.modalservie.dismissAll();
  }

  openlogoutModal() {
    this.modalservie.open(this.logoutpopup, { centered: true });
  }
  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }
}