import { Component, OnDestroy, OnInit, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NgbModal, NgbOffcanvas, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { interval, Subscription } from 'rxjs';
import { switchMap, filter, distinctUntilChanged, map } from 'rxjs/operators';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IDepartment } from '../../Interfaces/letters-model';
import { Select } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../services/open-modal.service';
import { Assignee, Ticket } from '../../Interfaces/hierachy.modal';
import { ItsupportPipe } from "../../Pipes/itsupport.pipe";
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { SettingsUpdateIconComponent } from "../../icons/settings-update-icon/settings-update-icon.component";
import { ProfileIconComponent } from "../../icons/profile-icon/profile-icon.component";
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
import { HelpdeskPipe } from "../../Pipes/helpdesk.pipe";
import { environment } from '../../../environments/environment';
import { Paginator } from "primeng/paginator";
import { HelpdeskStatusUpdate } from '../helpdesk-model';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';
import { DomSanitizer, SafeResourceUrl, SafeUrl } from '@angular/platform-browser';
import { NgxDocViewerModule } from "ngx-doc-viewer";
import { DownloadIconComponent } from "../../icons/download-icon/download-icon.component";

@Component({
  selector: 'app-helpdesk-myqueries-details',
  imports: [CommonModule, ModuleInfoIconComponent, Select, RouterModule, NgbPopoverModule, NoDataFoundComponent, FormsModule, ReactiveFormsModule, TranslateModule, ItsupportPipe, DateformatPipe, DataLoaderContentComponent, SettingsUpdateIconComponent, ProfileIconComponent, InfoIconComponent, HelpdeskPipe, Paginator, ModuleInformationComponent, NgxDocViewerModule, DownloadIconComponent],
  templateUrl: './helpdesk-myqueries-details.component.html',
  styleUrl: './helpdesk-myqueries-details.component.scss'
})
export class HelpdeskMyqueriesDetailsComponent {
  subscription!: Subscription;
  searchValue!: string;
  empinfo = {} as Ipersonal;
  tickets: any;
  myqueriesdetails!: FormGroup;
  dataloading: boolean = false;
  pollingSubscription!: Subscription;
  status = [
    { value: 'Open', label: 'Open' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Await On User', label: 'Await On User' },
    { value: 'Rejected', label: 'Rejected' }
  ];
  priorityDetails = [
    { value: 'Urgent', label: 'Urgent' },
    { value: 'High', label: 'High' },
    { value: 'Medium', label: 'Medium' },
    { value: 'Low', label: 'Low' }
  ];
  allAssigneeEmployees = [] as Assignee[];
  selectedAssigneeId: any;
  commentPopup: any
  dataloader: boolean = false;
  selectedTicket: any;
  editableStatus: string = '';
  editableAssignee: number | null = null;
  departmentDetails: any[] = [];
  statusList: any;
  priorityList: any;
  selectdata: any;
  getmessage: any;
  isSending = false;
  auditLog: any;
  newMessage: string = '';
  lastMessageCount = 0;
  conversationHistory: any[] = [];
  viewAttachmentname: any;
  selectedItem: any;
  ackCheckboxChecked: any;
  ackForm: any;
  loading = false;
  constructor(
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private confirmation: OpenModalService,
    private offcanvasService: NgbOffcanvas,
    private fb: FormBuilder,
    public rbac: RbacService,
    private router: Router,
    private sanitizer: DomSanitizer,
  ) { }
  @ViewChild('viewattamchment') viewattamchment!: TemplateRef<any>;
  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.selectdata = JSON.parse(localStorage.getItem('selectedTicket') || '{}');
    console.log('Selected ticket data:', this.selectdata);

    this.myqueriesdetails = this.fb.group({
      messageBody: ['', [Validators.required, Validators.maxLength(1000)]],
      additionalNotes: ['']
    });

    if (!this.isChatEnabled()) {
      this.myqueriesdetails.get('messageBody')?.disable();
    }

    this.getmessagedata();
    this.startPolling();
    this.auditlogqueries();
  }

  goToMyQueries() {
    this.router.navigate(['/help-desk/employee-desk']);
  }
  // get image url for profile
  getImageUrl(imagePath: string): string | null {
    if (!imagePath) {
      return null;
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    if (imagePath.startsWith('Profilepics/')) {
      return `${environment.viewUrl}${imagePath}`;
    }
    return `${environment.ApiUrl}EmployeeData/DownloadProfilePic?filename=${imagePath}`;
  }

  getProfileImage(imagePath: string): string | null {
    return this.getImageUrl(imagePath);
  }

  // update the modify status
  isStatusClosed(): boolean {
    return this.selectdata?.status?.toLowerCase() === 'closed';
  }

  isChatEnabled(): boolean {
    if (this.isStatusClosed()) return false;
    const assignedTo = this.selectdata?.assignedTo;
    if (!assignedTo || assignedTo === 0) return false;
    return assignedTo === parseInt(this.empinfo.employeeId);
  }

  sendMessage() {
    if (!this.isChatEnabled()) return;
    if (this.myqueriesdetails.invalid) {
      this.myqueriesdetails.markAllAsTouched();
      return;
    }
    this.isSending = true;   // optional (good practice)
    const payload = {
      messageBody: this.myqueriesdetails.value.messageBody,
      additionalNotes: this.myqueriesdetails.value.additionalNotes
    };
    this.subscription = this.http.postdata(`helpdesk/queries/${this.selectdata?.id}/messages`, payload).subscribe({
      next: (response: any) => {
        // this.confirmation.openSuccessModal('Query sent successfully');
        // CLEAR INPUT FIELD
        this.myqueriesdetails.reset();
        this.myqueriesdetails.markAsPristine();
        this.myqueriesdetails.markAsUntouched();
        this.isSending = false;
        // this.getmessagedata();
        this.http.notifyMessageUpdate();
        this.auditlogqueries(); // refresh messages
      },
      error: (err: any) => {
        this.isSending = false;
        console.error(err);
        this.confirmation.openErrorModal(err.error?.message || 'An error occurred while sending the message');
      }
    });
  }

  startPolling() {
    if (!this.selectdata?.id) return;

    this.pollingSubscription = interval(5000)
      .pipe(

        // Stop if tab inactive
        filter(() => !document.hidden),

        // Stop if ticket closed
        filter(() => this.selectdata?.status !== 'Closed'),

        switchMap(() =>
          this.http.getData(`helpdesk/queries/${this.selectdata?.id}/messages`)
        ),

        filter((response: any) => !!response?.data),

        map((response: any) => response.data)
      )
      .subscribe({
        next: (messages: any[]) => {

          const latestId = messages[messages.length - 1]?.id;
          const currentLatestId = this.conversationHistory[this.conversationHistory.length - 1]?.id;

          // 🔥 Only update if new message arrived
          if (latestId !== currentLatestId) {
            this.conversationHistory = messages.map((msg: any) => ({
              id: msg.id,
              sender: msg.sentByName,
              time: this.formatTime(msg.sentAt),
              text: msg.messageBody,
              isMine: msg.isMine
            }));
          }
        },
        error: (err) => console.error(err)
      });
  }
  trackByMessage(index: number, item: any) {
    return item.id;
  }
  getmessagedata() {
    this.loading = true;
    this.subscription = this.http
      .getData(`helpdesk/queries/${this.selectdata?.id}/messages`)
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response?.data) {
            this.conversationHistory = response.data.map((msg: any) => ({
              sender: msg.sentByName,
              time: this.formatTime(msg.sentAt),
              text: msg.messageBody,
              isMine: msg.isMine
            }));
          }
        },
        error: (err: any) => {
          this.loading = false;
          console.error(err);
        }
      });
  }
  fullConversation(): any[] {
    const descriptionMessage = this.selectdata?.description
      ? [{
        id: 'ticket-description',
        sender: this.selectdata?.employeeName,
        time: this.formatTime(this.selectdata?.createdDate),
        text: this.selectdata?.description,
        isMine: true
      }]
      : [];

    return [...descriptionMessage, ...this.conversationHistory];
  }
  formatTime(dateString: string): string {
    // Force UTC parsing
    const date = new Date(dateString + 'Z');
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const formattedHours = hours < 10 ? '0' + hours : hours;
    const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${formattedHours}.${formattedMinutes} ${ampm}`;
  }

  auditlogqueries() {
    this.loading = true;
    this.subscription = this.http
      .getData(`helpdesk/queries/${this.selectdata?.id}/audit-logs`)
      .subscribe({
        next: (response: any) => {
          this.loading = false;
          if (response?.data) {

            this.auditLog = response.data.map((log: any) => ({
              ...log,
              date: new Date(log.createdAt + 'Z') // UTC fix
            }));

          }
        },
        error: (err: any) => {
          this.loading = false;
          console.error(err);
          this.confirmation.openErrorModal(
            err.error?.message || 'Error fetching audit logs'
          );
        }
      });
  }


  getStatusClass(status: string): string {
    if (!status) return '';

    return status
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-');  // replace spaces with hyphen
  }


  isViewableFile(filePath: string | null | undefined): boolean {
    if (!filePath) return false;

    const lowerFile = filePath.toLowerCase();

    return (
      /\.(jpg|jpeg|png|gif|webp)$/i.test(lowerFile) ||
      /\.(mp4|webm|ogg)$/i.test(lowerFile)
    );
  }
  downloadFile(filePath: string, name: string) {

    const fullUrl = `${environment.viewUrl}${filePath}`;

    const link = document.createElement('a');
    link.href = fullUrl;
    link.download = name || 'download';
    link.target = '_blank';
    link.click();
  }
  ExpenseImageUrl!: SafeUrl | null;
  ExpenseViewURL!: SafeResourceUrl | null;
  videoUrl!: SafeResourceUrl | null;

  viewPolicyname: string = '';
  // selectedItem: any;
  onViewAttachement(filePath: string, name: string, selectedItem: any) {

    if (!filePath) return;

    this.viewPolicyname = name;
    this.selectedItem = selectedItem;

    // Reset viewers
    this.ExpenseImageUrl = null;
    this.videoUrl = null;

    const lowerFile = filePath.toLowerCase();
    const fullUrl = `${environment.viewUrl}${filePath}`;

    // ===============================
    // IMAGE → SHOW
    // ===============================
    if (lowerFile.match(/\.(jpg|jpeg|png|gif|webp)$/)) {

      this.http
        .DownloadDataWithQuery('FileSystem/Downloadfile', filePath)
        .subscribe({
          next: (res: any) => {

            const blob = new Blob([res.body], { type: res.body.type });
            const objectURL = URL.createObjectURL(blob);

            this.ExpenseImageUrl =
              this.sanitizer.bypassSecurityTrustUrl(objectURL);

            this.openAttachmentModal();
          },
          error: (err) => console.error('Image download error:', err)
        });
    }

    // ===============================
    // 🎥 VIDEO → SHOW & PLAY
    // ===============================
    else if (lowerFile.match(/\.(mp4|webm|ogg)$/)) {

      this.videoUrl =
        this.sanitizer.bypassSecurityTrustResourceUrl(fullUrl);

      this.openAttachmentModal();
    }

    // ===============================
    //  PDF / EXCEL / DOC → DOWNLOAD
    // ===============================
    else {

      // force download
      const link = document.createElement('a');
      link.href = fullUrl;
      link.download = name || 'download';
      link.target = '_blank';
      link.click();
    }
  }
  toggleViewModal() {
    this.modalService.dismissAll();
    this.modalService.open(this.viewattamchment, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
  }

  openAttachmentModal() {

    this.modalService.dismissAll();

    this.modalService.open(this.viewattamchment, {
      size: 'xl',
      centered: true,
      backdrop: 'static',
      keyboard: false
    });
  }
  isFormValid(): boolean {
    return (
      this.myqueriesdetails?.get('status')?.value &&
      this.myqueriesdetails?.get('priority')?.value &&
      this.myqueriesdetails?.get('comment')?.value
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}

