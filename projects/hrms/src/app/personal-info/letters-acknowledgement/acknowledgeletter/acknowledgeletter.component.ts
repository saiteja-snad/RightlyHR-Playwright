import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { NgbModal, NgbNavModule,NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { Router } from '@angular/router';
import { OpenModalService } from '../../../services/open-modal.service';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { DateformatPipe } from "../../../pipes/dateformat.pipe";
import { LastValuePipe } from "../../../Pipes/last-value/last-value.pipe";
import { PromotionLetterAcknowedgementComponent } from "../promotion-letter-acknowedgement/promotion-letter-acknowedgement.component";
import { AppointmentLetterAcknowledgementComponent } from "../appointment-letter-acknowledgement/appointment-letter-acknowledgement.component";
import { ApprisalLetterAcknowedgementComponent } from '../apprisal-letter-acknowedgement/apprisal-letter-acknowedgement.component';
import { TraineeAppointmentLetterAcknowledgementComponent } from "../trainee-appointment-letter-acknowledgement/trainee-appointment-letter-acknowledgement.component";
import { ProbationExtensionLetterAcknowledgementComponent } from "../probation-extension-letter-acknowledgement/probation-extension-letter-acknowledgement.component";
import { AccessForEmployeeinfoService } from '../../../services/access-for-employeeinfo.service';
import { DownloadIconComponent } from "../../../icons/download-icon/download-icon.component";
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { SaleryRevisionLetterAcknowedgementComponent } from "../salery-revision-letter-acknowedgement/salery-revision-letter-acknowedgement.component";
import { ProbationConformitionLetterAcknowledgementComponent } from "../probation-conformition-letter-acknowledgement/probation-conformition-letter-acknowledgement.component";
import { LetterFooterComponent } from "../../../shared/letters-shared-content/letter-footer/letter-footer.component";
import { TableModule } from 'primeng/table';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-acknowledgeletter',
  imports: [NgbNavModule, TranslateModule, CommonModule, NoDataFoundComponent, DataLoaderContentComponent, DateformatPipe, LastValuePipe, PromotionLetterAcknowedgementComponent, AppointmentLetterAcknowledgementComponent, ApprisalLetterAcknowedgementComponent, TraineeAppointmentLetterAcknowledgementComponent, ProbationExtensionLetterAcknowledgementComponent, NgbPopoverModule, DownloadIconComponent, InfoIconComponent, SaleryRevisionLetterAcknowedgementComponent, ProbationConformitionLetterAcknowledgementComponent, LetterFooterComponent,TableModule],
  templateUrl: './acknowledgeletter.component.html',
  styleUrl: './acknowledgeletter.component.scss'
})
export class AcknowledgeletterComponent {
  @ViewChild('generatedTable') generatedTable!: Table;
  @ViewChild('acceptedTable') acceptedTable!: Table;
  @ViewChild('rejectedTable') rejectedTable!: Table;
  
  active!: number; // Default active tab index
  loading = false; // Loading state
  documents = [] as any[];
  subscription!: Subscription;
  empdata = {} as any;
  selectedData: any;
  generated = [] as any[];
  originalGenerated = [] as any[];
  acknowleged = [] as any[];
  originalAcknowledged = [] as any[];
  rejected = [] as any[];
  originalRejected = [] as any[];
  @Input() folder: any;
  
  // Sorting properties for each table
  generatedCurrentSortField: string = '';
  generatedCurrentSortOrder: number = 0;
  acceptedCurrentSortField: string = '';
  acceptedCurrentSortOrder: number = 0;
  rejectedCurrentSortField: string = '';
  rejectedCurrentSortOrder: number = 0;
  constructor(
    private http: HttpService,
    private router: Router,
    private modalService: NgbModal,
    public permissionRouteService: AccessForEmployeeinfoService
  ) { }
  ngOnInit() {
    this.active = 1; // Default active tab
    this.getEmpInfoFromRoute();
    // console.log(this.folder);
    this.getEmployeeDocuments(this.empdata.employeeId);
    this.subscription = this.http.refresh$.subscribe(() => {
      this.getEmployeeDocuments(this.empdata.employeeId);
    });
  }



  canAccess(action: 'view' | 'create' | 'update' | 'delete', permission: string) {
    return this.permissionRouteService.canAccessField(action, permission);
  }

  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/personalinfo')) {
      this.empdata = JSON.parse(localStorage.getItem("personaldata") || '{}');
    } else if (fullPath.startsWith('/myinfo')) {
      this.empdata = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    }
  }

  //function to get the employee documents details
  getEmployeeDocuments(employeeId: any) {
    this.subscription = this.http
      .getData(
        `LetterAcknowledgementDetails/getByLetterType?letterType=${this.folder}&employeeId=${employeeId}`
      )
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.documents = data;
         this.documents = data.map((ele: any) => {
           if (ele.status === 'Generated')
             return { ...ele, status: 'Waiting for Review' };
            if (ele.status === 'Extended')
             return { ...ele, status: 'Waiting for Review' };
           if (ele.status === 'Acknowledged')
             return { ...ele, status: 'Accepted' };
           return ele;
         });

         this.generated = this.documents.filter(
           (ele: any) => ele.status === 'Waiting for Review'
         );
         this.originalGenerated = [...this.generated];
         
         this.acknowleged = this.documents.filter(
           (ele: any) => ele.status === 'Accepted'
         );
         this.originalAcknowledged = [...this.acknowleged];
         
         this.rejected = this.documents.filter(
           (ele: any) => ele.status === 'Rejected'
         );
         this.originalRejected = [...this.rejected];
          console.log(this.documents);
        },
        error: (reason: any) => {
          this.documents = [];
          this.rejected = [];
          this.originalRejected = [];
          this.generated = [];
          this.originalGenerated = [];
          this.acknowleged = [];
          this.originalAcknowledged = [];
          console.log(reason);
        },
      });
  }
  openpopup(content: any, letterDetails: any) {
    this.selectedData = letterDetails;
    this.modalService.open(content, { size: 'xl', centered: true });
  }
  onSelectDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('FileSystem/Downloadfile', file).subscribe({
      next: (res: any) => {
        // const fileName = res.headers.get('content-disposition')
        //   ?.split(':')[1].split('=')[1];
        const blob: Blob = res.body as Blob;
        const filename = file.split('/').pop()!;

        const a = document.createElement('a')
        const objectUrl = window.URL.createObjectURL(blob);
        a.href = objectUrl
        // const filename = file.name.split('/')[file.name.split('/').length - 1];
        a.download = filename
        a.click()

        window.URL.revokeObjectURL(objectUrl);
      },
      error: reason => console.log(reason)
    })
  }

  // Custom sort function for Generated table
  customSortGenerated(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.generatedCurrentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.generatedCurrentSortOrder === 1) {
        // Currently ascending, change to descending
        this.generatedCurrentSortOrder = -1;
        event.order = -1;
      } else if (this.generatedCurrentSortOrder === -1) {
        // Currently descending, reset to original order
        this.generated = [...this.originalGenerated];
        this.generatedCurrentSortField = '';
        this.generatedCurrentSortOrder = 0;
        if (this.generatedTable) {
          this.generatedTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.generatedCurrentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.generatedCurrentSortField = field;
      this.generatedCurrentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any = a[field];
      let val2: any = b[field];

      // Handle date fields
      if (['generatedDate', 'acknowledgedDate'].includes(field)) {
        const date1 = val1 ? new Date(val1).getTime() : 0;
        const date2 = val2 ? new Date(val2).getTime() : 0;
        return event.order * (date1 - date2);
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  // Custom sort function for Accepted table
  customSortAccepted(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.acceptedCurrentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.acceptedCurrentSortOrder === 1) {
        // Currently ascending, change to descending
        this.acceptedCurrentSortOrder = -1;
        event.order = -1;
      } else if (this.acceptedCurrentSortOrder === -1) {
        // Currently descending, reset to original order
        this.acknowleged = [...this.originalAcknowledged];
        this.acceptedCurrentSortField = '';
        this.acceptedCurrentSortOrder = 0;
        if (this.acceptedTable) {
          this.acceptedTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.acceptedCurrentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.acceptedCurrentSortField = field;
      this.acceptedCurrentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any = a[field];
      let val2: any = b[field];

      // Handle date fields
      if (['generatedDate', 'acknowledgedDate'].includes(field)) {
        const date1 = val1 ? new Date(val1).getTime() : 0;
        const date2 = val2 ? new Date(val2).getTime() : 0;
        return event.order * (date1 - date2);
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }

  // Custom sort function for Rejected table
  customSortRejected(event: any): void {
    const field = event.field;
    
    // Track current sort state for the clicked field
    if (this.rejectedCurrentSortField === field) {
      // Same field clicked - cycle through: asc (1) -> desc (-1) -> reset (0)
      if (this.rejectedCurrentSortOrder === 1) {
        // Currently ascending, change to descending
        this.rejectedCurrentSortOrder = -1;
        event.order = -1;
      } else if (this.rejectedCurrentSortOrder === -1) {
        // Currently descending, reset to original order
        this.rejected = [...this.originalRejected];
        this.rejectedCurrentSortField = '';
        this.rejectedCurrentSortOrder = 0;
        if (this.rejectedTable) {
          this.rejectedTable.reset();
        }
        return;
      } else {
        // Currently reset, change to ascending
        this.rejectedCurrentSortOrder = 1;
        event.order = 1;
      }
    } else {
      // New field clicked - start with ascending
      this.rejectedCurrentSortField = field;
      this.rejectedCurrentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1: any = a[field];
      let val2: any = b[field];

      // Handle date fields
      if (['generatedDate', 'acknowledgedDate'].includes(field)) {
        const date1 = val1 ? new Date(val1).getTime() : 0;
        const date2 = val2 ? new Date(val2).getTime() : 0;
        return event.order * (date1 - date2);
      }

      // Handle string sorting for all other fields
      val1 = String(val1 ?? '').trim();
      val2 = String(val2 ?? '').trim();
      return event.order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
    });
  }
}
