import { CommonModule } from '@angular/common';
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';
import { OpenModalService } from '../../services/open-modal.service';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment.dev';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import {  NgxDocViewerModule } from 'ngx-doc-viewer';
import { Select } from 'primeng/select';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { TranslateModule } from '@ngx-translate/core';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-companypolicies',
  imports: [CommonModule, ReactiveFormsModule, NgxDocViewerModule, Select, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent],
  templateUrl: './companypolicies.component.html',
  styleUrl: './companypolicies.component.scss'
})
export class CompanypoliciesComponent {
  policiesform!: FormGroup;
  ExpenseViewURL: any;
  ExpenseImageUrl: any;
  empinfo: any;
  Policies: any = [];
  subscription!: Subscription;
  jobshiftdetials: any;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  years: { label: string; value: number }[] = [];
  loading=false
  filteredpolicy:any =[] 
  orgPolicyItemsArray: any[] = [];
  EduViewURL: any; 
  EduImageUrl: any;
  attachmentUrl: any;
  item: any;
  showViewDetailsModal = false;
  isViewingAttachment = false;
  shouldOpenModal = false;


  constructor(private fb: FormBuilder, private modalService: NgbModal, private http: HttpService, private location: Location, private sanitizer: DomSanitizer,private cdr: ChangeDetectorRef) { }
  // @ViewChild('viewattamchment') private viewattamchment!: TemplateRef<any>;
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  ngOnInit(): void {
    this.selectedYear = this.currentYear;
    this.policiesform = this.fb.group({
      selectedYear: [this.currentYear]
    });
    this.policiesform.get('selectedYear')?.valueChanges.subscribe((year: number) => {
      this.selectedYear = year;
      this.getpolicys(this.jobshiftdetials);
    });
    
    
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    console.log(this.empinfo.employeeId);
    this.getjobDetails();
    this.currentYear = new Date().getFullYear();

      // // Push the previous year, current year, and next year to the array
      // for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      //     this.years.push(i);
      // }
      for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
        this.years.push({ label: i.toString(), value: i });
      }
  }
  // openModal(content: any) {
  //   this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
  // }
  openupdateModal(content: any) {
    this.modalService.open(content, { centered: true,size:'lg', backdrop: 'static' });
  }
  openModal(content: any) {
    this.modalService.open(this.viewattamchment, {
      size: 'xl', // optional, helps initially
      centered: true,
      windowClass: 'wide-modal'
    });
    
  }
  
  private handleImage(url: string) {
    const baseUrl = this.location.normalize('/');
    const imageUrl = `${baseUrl}${url}`;
    this.EduImageUrl = `${environment.viewUrl}${imageUrl}`;


    // Log imageUrl to console
    console.log(`Image URL: ${this.EduImageUrl}`);
  }
  private handlePDF(url: string) {
    // Assuming NgxDocViewerModule supports PDFs directly
    const baseUrl = this.location.normalize('/');
    const pdfUrl = `${baseUrl}${url}`;
    this.EduViewURL = `${environment.viewUrl}${pdfUrl}`;

    // Log pdfUrl to console
    console.log(`PDF URL: ${this.EduViewURL}`);
  }
  
  
  // onViewClick(attachmentUrl: string) {
  //   // Clear existing URLs
  //   this.EduImageUrl = '';
  //   this.EduViewURL = '';
  
  //   const isImage = /\.(jpg|jpeg|png)$/i.test(attachmentUrl);
  //   const isPDF = attachmentUrl.toLowerCase().endsWith('.pdf');
  
  //   if (isImage) {
  //     this.handleImage(attachmentUrl);
  //     this.toggleViewModal();
  //   } else if (isPDF) {
  //     this.handlePDF(attachmentUrl);
  //     this.toggleViewModal();
  //   } else {
  //     console.log(`Unsupported file type: ${attachmentUrl}`);
  //   }
  // }
  onViewClick(policyAttachment: string) {
    console.log('Opening modal');
    this.shouldOpenModal = true;
    this.EduImageUrl = '';
    this.EduViewURL = '';

    const isImage = /\.(jpg|jpeg|png)$/i.test(policyAttachment);
    const isPDF = policyAttachment.toLowerCase().endsWith('.pdf');

    console.log('Dismiss all modals');
    this.modalService.dismissAll();

    if (isImage) {
        this.handleImage(policyAttachment);
    } else if (isPDF) {
        this.handlePDF(policyAttachment);
    } else {
        console.log(`Unsupported file type: ${policyAttachment}`);
        return;
    }

    console.log('Opening modal again');
    this.openModal(this.viewattamchment);
}

 onViewAttachement(url: any) {
    const lowerUrl = url?.toLowerCase();
  
    if (lowerUrl?.endsWith('jpg') || lowerUrl?.endsWith('jpeg') || lowerUrl?.endsWith('png')) {
      this.subscription = this.http
        .DownloadDataWithQuery('FileSystem/Downloadfile', url)
        .subscribe({
          next: (res: any) => {
            const blob = new Blob([res['body']], { type: 'image/png' });
            const objectURL = URL.createObjectURL(blob);
            this.ExpenseImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
            this.ExpenseViewURL = null;
            this.toggleViewModal();
          },
          error: (err) => console.error('Error downloading image:', err),
        });
    } else if (lowerUrl?.endsWith('pdf')) {
      this.ExpenseImageUrl = null;
      this.ExpenseViewURL = `${environment.viewUrl}${url}`; // assumed to be full URL
      this.toggleViewModal();
    } else {
      // fallback for other types if needed
      this.ExpenseImageUrl = null;
      this.ExpenseViewURL = `${environment.viewUrl}${url}`;
      this.toggleViewModal();
    }
  }
toggleViewModal() {
  this.modalService.dismissAll();
  this.openModal(this.viewattamchment)
}

  handleClose(modal: any) {
    this.shouldOpenModal = false; 
    this.EduViewURL = null;
    this.EduImageUrl = null;
    modal.dismiss();
    
    
    this.cdr.detectChanges();
}
  
  // toggleViewModal() {
  //   this.modalService.dismissAll();
  //   if (this.viewattamchment) {
  //     this.openModal(this.viewattamchment);
  //   } else {
  //     console.warn('Modal template reference is not available.');
  //   }
  // }
  
  

  getjobDetails() {
    let EmployeeId = this.empinfo.employeeId;
    console.log(EmployeeId);
    this.subscription = this.http.getData(`JobDetails/${EmployeeId}`).subscribe({
        next: (data: any) => {
            console.log(data);
            this.jobshiftdetials = data;
            console.log(this.jobshiftdetials);
            this.getpolicys(data); 
        }
    });

  }
  getpolicys(jobShiftDetails: any) {
    this.loading=true
    let policies = {
        locationId: jobShiftDetails[0].locationid,
        subLocationId: jobShiftDetails[0].sublocationid,
        shiftId: jobShiftDetails[0].shiftId,
        Applicableyear: this.selectedYear 
    };
  
    console.log(policies);
  
    this.subscription = this.http.getDataWithQueryParams(`orgPolicies/getpolicybylocation`, policies).subscribe({
        next: (response: any) => {
          this.loading=false
            this.Policies = response;
            console.log(this.Policies);
            this.filteredpolicy = response.map((policy: any) => policy.orgPolicyItems);
            this.orgPolicyItemsArray = [].concat(...this.filteredpolicy);
            console.log(this.orgPolicyItemsArray);
        },
        error: (reason: any) => console.log(reason)
    });
  }

}
