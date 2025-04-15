import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { OpenModalService } from '../../services/open-modal.service';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment.dev';
import { Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer } from '@angular/platform-browser';
import {  NgxDocViewerModule } from 'ngx-doc-viewer';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-companypolicies',
  imports: [CommonModule, ReactiveFormsModule,NgxDocViewerModule,Select],
  templateUrl: './companypolicies.component.html',
  styleUrl: './companypolicies.component.scss'
})
export class CompanypoliciesComponent {
  policiesform!: FormGroup;
  empinfo: any;
  Policies: any = [];
  subscription!: Subscription;
  jobshiftdetials: any;
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  years: { label: string; value: number }[] = [];

  filteredpolicy:any =[] 
  orgPolicyItemsArray: any[] = [];
  EduViewURL: string = ''; // URL for the document viewer
  EduImageUrl: string = '';
  attachmentUrl: any;
item: any;

  constructor(private fb: FormBuilder, private modalService: NgbModal, private http: HttpService, private location: Location, private sanitizer: DomSanitizer) { }
  @ViewChild('viewattamchment') private viewattamchment!: NgbModal;
  ngOnInit(): void {
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
      // Get the current year
      this.currentYear = new Date().getFullYear();

      // // Push the previous year, current year, and next year to the array
      // for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
      //     this.years.push(i);
      // }
      for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
        this.years.push({ label: i.toString(), value: i });
      }
      

  
      // Set the selectedYear to the current year
      this.selectedYear = this.currentYear;

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
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
  }
  toggleViewModal() {
    this.modalService.dismissAll();
    this.openModal(this.viewattamchment)
  }
  onViewClick(attachmentUrl: string) {
    // Check if the file is a PDF or an image (or other types)
    if (attachmentUrl.endsWith('.pdf')) {
      this.EduViewURL = attachmentUrl;  // for PDF viewing
      this.EduImageUrl = '';  // clear any image URL
    } else {
      this.EduImageUrl = attachmentUrl;  // for image viewing
      this.EduViewURL = '';  // clear any PDF URL
    }
  }
  
  
  
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
    let policies = {
        locationId: jobShiftDetails[0].locationid,
        subLocationId: jobShiftDetails[0].sublocationid,
        shiftId: jobShiftDetails[0].shiftId,
        Applicableyear: this.selectedYear 
    };
  
    console.log(policies);
  
    this.subscription = this.http.getDataWithQueryParams(`orgPolicies/getpolicybylocation`, policies).subscribe({
        next: (response: any) => {
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
