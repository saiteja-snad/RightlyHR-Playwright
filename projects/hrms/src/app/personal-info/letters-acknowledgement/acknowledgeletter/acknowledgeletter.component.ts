import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
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

@Component({
  selector: 'app-acknowledgeletter',
  imports: [NgbNavModule, TranslateModule, CommonModule, NoDataFoundComponent, DataLoaderContentComponent, DateformatPipe, LastValuePipe, PromotionLetterAcknowedgementComponent, AppointmentLetterAcknowledgementComponent, ApprisalLetterAcknowedgementComponent, TraineeAppointmentLetterAcknowledgementComponent, ProbationExtensionLetterAcknowledgementComponent, NgbPopoverModule, DownloadIconComponent, InfoIconComponent, SaleryRevisionLetterAcknowedgementComponent, ProbationConformitionLetterAcknowledgementComponent],
  templateUrl: './acknowledgeletter.component.html',
  styleUrl: './acknowledgeletter.component.scss'
})
export class AcknowledgeletterComponent {
  active!: number; // Default active tab index
  loading = false; // Loading state
  documents = [] as any[];
  subscription!: Subscription;
  empdata = {} as any;
  selectedData: any;
  generated = [] as any[];
  acknowleged = [] as any[];
  rejected = [] as any[];
  @Input() folder: any;
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
         this.acknowleged = this.documents.filter(
           (ele: any) => ele.status === 'Accepted'
         );
         this.rejected = this.documents.filter(
           (ele: any) => ele.status === 'Rejected'
         );
          console.log(this.documents);
        },
        error: (reason: any) => {
          this.documents = [];
          this.rejected = [];
          this.generated = [];
          this.acknowleged = [];
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

}
