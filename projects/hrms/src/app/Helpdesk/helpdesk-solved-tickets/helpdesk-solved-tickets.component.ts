import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { debounceTime, distinctUntilChanged, Subject, Subscription, takeUntil } from 'rxjs';
import { Assignee, Ticket } from '../../Interfaces/hierachy.modal';
import { ItsupportPipe } from "../../Pipes/itsupport.pipe";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateformatPipe } from "../../Pipes/dateformat.pipe";
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { InfoIconComponent } from "../../icons/info-icon/info-icon.component";
import { HelpdeskPipe } from "../../Pipes/helpdesk.pipe";
import { Paginator } from "primeng/paginator";
import { Router, RouterModule, ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-helpdesk-solved-tickets',
  imports: [CommonModule, RouterModule, Select, RouterModule, NgbPopoverModule, NoDataFoundComponent, FormsModule, ReactiveFormsModule, ItsupportPipe, DateformatPipe, TranslateModule, DataLoaderContentComponent, InfoIconComponent, HelpdeskPipe, Paginator],
  templateUrl: './helpdesk-solved-tickets.component.html',
  styleUrl: './helpdesk-solved-tickets.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class HelpdeskSolvedTicketsComponent {
  subscription!: Subscription;
  searchValue!: string;
  empinfo = {} as Ipersonal;
  tickets = [] as any[];
  dataloader: boolean = false;
  isLoading: boolean = false;
  status = [
    { value: 'Open', label: 'Open' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Await On User', label: 'Await On User' },
    { value: 'Rejected', label: 'Rejected' }
  ];
  selectedAssigneeId: any;
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  totalRecords = 0;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  searchSubject = new Subject<string>();
  destroy$ = new Subject<boolean>();
  constructor(
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private fb: FormBuilder,
    private confirmation: OpenModalService,
    public rbac: RbacService,
    public readonly router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getuserticketsbyempid();
    this.searchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.page = 1;
      this.first = 0;
      this.getuserticketsbyempid(this.page, this.pageSize);
    });
  }

  openConfirmationModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }

  cleardata() {
    this.modalService.dismissAll();
  }

  onSearchChange() {
    this.searchSubject.next(this.searchValue || '');
  }

  // Called when first size changes
  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize;
    this.page = 1;
    this.first = 0;
    this.getuserticketsbyempid(this.page, this.pageSize);
  }
  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getuserticketsbyempid(this.page, this.pageSize);
  }

  onRowsChange() {
    this.page = 1;
    this.first = 0;
    this.getuserticketsbyempid(this.page, this.pageSize);

  }
  getuserticketsbyempid(page?: number, size?: number) {
    this.dataloader = true;
    let EmpId = parseInt(this.empinfo.employeeId);
    let url= `HelpDeskQueries/AssignedTo/${EmpId}?pageNumber=${this.page}&pageSize=${this.pageSize}&status=Closed`;

    // Add search only when value exists
    if (this.searchValue && this.searchValue.trim() !== '') {
      url += `&search=${this.searchValue}`;
     }
    this.subscription = this.http.getData(url).subscribe({
      next: (response: any) => {
        this.dataloader = false;
        if (response.success && response.data.data) {
          this.tickets = response.data.data// optional
          this.collectionSize = response.data.totalClosed;

        } else {
          this.tickets = [];
        }
      },
      error: (err: any) => {
        this.dataloader = false;
        this.tickets = [];
      }
    });
  }

  assigneeDetails(id: any) {
    this.selectedAssigneeId = id;
  }

  openEnd(ticket: any) {
    if (!this.rbac.allowedToAccess('Support Helpdesk Queries Tab.update')) return;
    // Save current tab route
    localStorage.setItem('previousTab', this.router.url);
    localStorage.setItem("temselectdata", JSON.stringify(ticket));
    this.router.navigate(
      ['../teamqueries', ticket.id],
      { relativeTo: this.route }
    );
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
