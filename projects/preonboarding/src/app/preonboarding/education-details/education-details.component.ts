import { CommonModule } from '@angular/common';
import { Component, effect, ViewChild } from '@angular/core';
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
import { DataService } from '../../common-services/data.service';
import { environment } from '../../../../environments/environment.dev';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
@Component({
  selector: 'app-education-details',
  imports: [CommonModule, DateFormatPipe,NgxDocViewerModule],
  templateUrl: './education-details.component.html',
  styleUrl: './education-details.component.scss'
})

export class EducationDetailsComponent {
  subscription!: Subscription;
  getEducationData = [] as any;
  empinfo = {} as Ipersonal;
  DocViewURL!: any;
  DocImageUrl!: any;
  @ViewChild('viewpopup') viewpopup: any;
  constructor(private http: HttpService, private router: Router, private modalService: NgbModal, private openPopup: PopupService, private getData: DataService) {
    effect(() => {
      if (this.getData.getEducation()) {
        this.getEducationEmpid();
        getData.getEducation.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getEducationEmpid();
  }

  openEducation() {
    this.modalService.open(AddEducationDetailsComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  openUpdate(data:any) {
    const modalRef = this.modalService.open(UpdateEducationDetailsComponent, { centered: true, backdrop: 'static', size: 'lg' });
    // Pass data to the modal component instance
    modalRef.componentInstance.educationData = data;
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
  navigateNext() {
    this.router.navigate(['/emergency-details']);
  }
  reload() {
    window.location.reload()
  }

  blockTyping(event: KeyboardEvent): void {
    event.preventDefault();
  }

  navigatePrevious() {
    // const storedstep = 1;
    // localStorage.setItem('currentStep', storedstep.toString());
    // this.router.navigate(['offer-letter']);
    this.router.navigate(['/offer-letter']);
  }

  navigatePrevioustoTranineeofferletter() {
    // const storedstep = 1;
    // localStorage.setItem('currentStep', storedstep.toString());
    this.router.navigate(['/trainee-offerletter']);
  }

  redirectToNextPage() {
    this.router.navigate(['/preonboarding/emergency-details'])
  }
  close() {
    this.modalService.dismissAll();
  }
  //function to view the doc
  onViewClick(url: string) {
    const isImage = url.match(/\.(jpg|jpeg|png)$/i);
    const isPDF = url.toLowerCase().endsWith('pdf');
    if (isImage) {
      // Generate absolute URL for image
      this.handleImage(url);
    } else if (isPDF) {
      // Generate absolute URL for PDF
      this.handlePDF(url);
    } else {
      // Handle other document types
      console.log(`Unsupported file type: ${url}`);
    }
    this.modalService.open(this.viewpopup, { centered: true, backdrop: 'static', size: 'lg' });
  }

  private handleImage(url: string) {
    const baseUrl = '/';
    const imageUrl = `${baseUrl}${url}`;
    this.DocImageUrl = `${environment.viewUrl}${imageUrl}`;
    console.log(`Image URL: ${this.DocImageUrl}`);
  }

  private handlePDF(url: string) {
    // Assuming NgxDocViewerModule supports PDFs directly
    const baseUrl = '/';
    const pdfUrl = `${baseUrl}${url}`;
    this.DocViewURL = `${environment.viewUrl}${pdfUrl}`;
    // Log pdfUrl to console
    console.log(`PDF URL: ${this.DocViewURL}`);
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
        if (data.length <= 0) {
          this.disablebutton = true
        }
        else {
          this.disablebutton = false
        }
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