import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddEducationDetailsComponent } from './add-education-details/add-education-details.component';
import { Ieducation, Ipersonal } from '../../models/education.model';
import { Subscription } from 'rxjs';
import { HttpService } from '../../http-services/http.service';
import moment from 'moment';
import { DateFormatPipe } from "../../pipes/date-format.pipe";
import { PopupService } from '../../common-services/popup.service';
import { UpdateEducationDetailsComponent } from './update-education-details/update-education-details.component';
@Component({
  selector: 'app-education-details',
  imports: [CommonModule, DateFormatPipe],
  templateUrl: './education-details.component.html',
  styleUrl: './education-details.component.scss'
})

export class EducationDetailsComponent {
  subscription!: Subscription;
  getEducationData = [] as any;
  empinfo = {} as Ipersonal;

  constructor(private http: HttpService, private router: Router, private modalService: NgbModal, private openPopup:PopupService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getEducationEmpid();
  }

  openEducation() {
    this.modalService.open(AddEducationDetailsComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  openUpdate(data:any) {
    console.log(data);
    const modalRef = this.modalService.open(UpdateEducationDetailsComponent, { centered: true, backdrop: 'static', size: 'lg' });
    // Pass data to the modal component instance
    modalRef.componentInstance.educationData = data;
    // this.modalService.open(UpdateEducationDetailsComponent, { centered: true,  backdrop: 'static', size: 'lg' });
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  reload() {
    window.location.reload()
  }

  blockTyping(event: KeyboardEvent): void {
    event.preventDefault();
  }

  navigatePrevious() {
    const storedstep = 1;
    localStorage.setItem('currentStep', storedstep.toString());
    this.router.navigate(['/preonboarding/offerletter']);
  }

  navigatePrevioustoTranineeofferletter() {
    const storedstep = 1;
    localStorage.setItem('currentStep', storedstep.toString());
    this.router.navigate(['/preonboarding/traineeofferletter']);
  }

  redirectToNextPage() {
    this.router.navigate(['/preonboarding/emergency-details'])
  }

  //function to formate the data
  formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }

  disablebutton: boolean = false;
  //function to get the education details
  getEducationEmpid() {
    let EmployeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`PreonboardingEducation/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        localStorage.setItem("educationinfodata", JSON.stringify(data));
        this.getEducationData = data as Ieducation;
        this.getEducationData.degreeStartDate = this.formatDate(this.getEducationData.degreeStartDate);
        this.getEducationData.degreeEndDate = this.formatDate(this.getEducationData.degreeEndDate)
      },
      error: (err: any) => {
        console.log(err);
        if (err.status = 401) {
          this.http.logOut();
        }
      }
    })
  }

  onSelectDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('PreonboardingFilesystem/Downloadfile', file).subscribe({
      next: (res: any) => {
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a')
        a.href = window.URL.createObjectURL(blob)
        let filename = file.split('/')[file.split('/').length - 1];
        a.download = filename
        a.click()
      },
      error: reason => console.log(reason)
    })
  }

  //function to delete the data
  deleteeducation(id: number, employeeId: number, degree: string, university: string, specialization: string,
    gpa: number, degreeStartDate: any, degreeEndDate: any) {
    let edudata = { "status": "Void", "id": id, "employeeId": employeeId, "degree": degree, "university": university, "specialization": specialization,
       "gpa": gpa, "degreeStartDate": degreeStartDate, "degreeEndDate": degreeEndDate,
    }
    this.subscription = this.http.postData("PreonboardingEducation/UPDATER", edudata).subscribe({
      next: (data: any) => {
        this.openPopup.openSuccess("Data Deleted successfully");
        this.getEducationEmpid();
      },
    })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}