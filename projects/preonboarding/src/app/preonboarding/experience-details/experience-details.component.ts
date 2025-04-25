import { Component, effect, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpService } from '../../http-services/http.service';
import { AddExperienceDetailtsComponent } from './add-experience-detailts/add-experience-detailts.component';
import { DateFormatPipe } from "../../Pipes/date-format.pipe";
import { PopupService } from '../../common-services/popup.service';
import { DataService } from '../../common-services/data.service';
import { UpdateExperienceDetailsComponent } from './update-experience-details/update-experience-details.component';
import { Router } from '@angular/router';
import { DetailedStepProgressbarComponent } from "../../shared/detailed-step-progressbar/detailed-step-progressbar.component";
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { environment } from '../../../../environments/environment.dev';
@Component({
  selector: 'app-experience-details',
  imports: [CommonModule, DateFormatPipe,NgxDocViewerModule, DetailedStepProgressbarComponent],
  templateUrl: './experience-details.component.html',
  styleUrl: './experience-details.component.scss'
})

export class ExperienceDetailsComponent {
  subscription!: Subscription;
  getempexpdata = [] as any;
  prosempdata = {} as any;
  ExperienceDetails !: File;
  selectExperience: any;
  DocViewURL!: any;
  DocImageUrl!: any;
  @ViewChild('viewpopup') viewpopup: any;
  @ViewChild('deletepopup') deletepopup: any;

  constructor(private http: HttpService, private router: Router, private modalService: NgbModal, private openPopup: PopupService, private getData: DataService) {
    effect(() => {
      if (this.getData.getExperience()) {
        this.getexperiencedetails();
        getData.getExperience.set(false);
      }
    });
  }

  ngOnInit(): void {
    const storedstep = 6;
    localStorage.setItem('currentStep', storedstep.toString());
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getexperiencedetails();
  }

  openExperience() {
    this.modalService.open(AddExperienceDetailtsComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  openUpdate(data: any) {
    console.log(data)
    const modalRef = this.modalService.open(UpdateExperienceDetailsComponent, { centered: true, backdrop: 'static', size: 'lg' });
    // Pass data to the modal component instance
    modalRef.componentInstance.experienceData = data;
  }

  openDelete(event: any) {
    this.selectExperience = event;
    this.modalService.open(this.deletepopup, { centered: true, backdrop: 'static' });
  }

  navigateNext() {
    this.router.navigate(['/review']);
  }

  navigateemergency() {
    this.router.navigate(['/emergency-details']);
  }

  //function to get all experiences 
  getexperiencedetails() {
    let EmployeeId = parseInt(this.prosempdata.employeeId)
    this.subscription = this.http.getData(`PreonboardingExperience/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.getempexpdata = data;
      },
      error: (err: any) => {
        console.log(err);
        if (err.status = 401) {
          this.http.logOut();
        }
      }
    })
  }
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
  onSelectDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('PreonboardingFilesystem/Downloadfile', file).subscribe({
      next: (res: any) => {
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        let filename = file.split('/')[file.split('/').length - 1];
        a.download = filename;
        a.click()
      },
      error: reason => console.log(reason)
    })
  }

  //function to delete the data
  deleteExperienceDetails(item: any) {
    this.subscription = this.http.getData(`PreonboardingExperience/Deletebyid/${item.id}`).subscribe({
      next: (data: any) => {
        this.modalService.dismissAll();
        this.openPopup.openSuccess("Data Deleted Successfully!");
      },
      error: (err: any) => {
        this.modalService.dismissAll();
        this.openPopup.openError("Error Occured");
      },
      complete: () => {
        this.getexperiencedetails();
      }
    })
  }

  close() {
    this.modalService.dismissAll();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}