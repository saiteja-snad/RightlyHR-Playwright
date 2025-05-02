import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { DomSanitizer } from '@angular/platform-browser';
import { OpenModalService } from '../../services/open-modal.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-profile-info-details',
  imports: [CommonModule],
  templateUrl: './profile-info-details.component.html',
  styleUrl: './profile-info-details.component.scss'
})

export class ProfileInfoDetailsComponent {
  empinfo: any;
  subscription!: Subscription;
  jobdata: any;
  reportesto = [] as any;
  jobRole!: string;
  shift!: string;
  firstName!: string
  lastName!: string
  Reportees = {} as any;
  imageUrl: any;
  Reportingmanager!: any;
  img: any;
  empdata = {} as any;
  profilePic: any;

  constructor(private http: HttpService, private sanitizer: DomSanitizer, private conformationPopup: OpenModalService,) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.getJobDetails();
    this.getEmployeeId();
    this.http.basicDetailesadded$.subscribe(() => {
      this.getJobDetails();
      this.getEmployeeId();
    });

  }

  getJobDetails() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`JobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        let jobdetails = data;
        this.jobdata = jobdetails[0]
        this.jobRole = jobdetails[0]?.jobRole
        this.shift = jobdetails[0]?.shiftName
        this.reportesto.fistname = jobdetails[0]?.firstName
        this.reportesto.middlename = jobdetails[0]?.middleName
        this.reportesto.lastname = jobdetails[0]?.lastName
        this.reportesto.middleName = jobdetails[0]?.middleName
        if (jobdetails[0]?.mName && jobdetails[0]?.fName && jobdetails[0]?.lName) {
          this.Reportingmanager = `${jobdetails[0]?.fName} ${jobdetails[0]?.mName} ${jobdetails[0]?.lName}`
        }
        else if (jobdetails[0]?.lName) {
          this.Reportingmanager = `${jobdetails[0]?.fName}  ${jobdetails[0]?.lName}`
        }
        else if (jobdetails[0]?.fName) {
          this.Reportingmanager = `${jobdetails[0]?.fName}  ${jobdetails[0]?.mName}`
        }
      }
    })
  }

  chooseNewProfile(event: any) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.img = input.files[0];
      const maxSize = 1024 * 1024; // 1 MB
      if (file.size < maxSize) {
        input.value = '';
        this.onProfilepicSelected(this.img)
      } else {
        this.conformationPopup.openErrorModal('Please Choose File Size Below 1024 KB')
      }
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
              if (data.statusCode === 409) { }
              else if (data.statusCode === 200) {
                this.conformationPopup.openSuccessModal('Basic Info updated successfully')
                this.getEmployeeId();
              }
            },
            error: (reason: any) => {
              this.conformationPopup.openErrorModal('Basic Info update failed')

            },
          });
        }
      },

    });
  }

  onSelectprofilePicDownload(employee: any) {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', employee.profileUrl).subscribe({
      next: (res: any) => {
        let blob = new Blob([res['body']], { type: 'image/png' });
        let objectURL = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: (reason) => console.log(reason),
    });
  }

  getEmployeeId() {
    let employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Employeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        this.empdata = data;
        if (this.empdata.profileUrl) this.onSelectprofilePicDownload(this.empdata)
      },
      error: reason => console.log(reason)
    });
  }
}