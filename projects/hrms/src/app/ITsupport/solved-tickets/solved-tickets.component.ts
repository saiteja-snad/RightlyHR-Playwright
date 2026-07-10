import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { Assignee, Ticket } from '../../Interfaces/hierachy.modal';
import { ItsupportPipe } from "../../Pipes/itsupport.pipe";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateformatPipe } from "../../pipes/dateformat.pipe";
import { OpenModalService } from '../../services/open-modal.service';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { Table, TableModule } from 'primeng/table';
import moment from 'moment';

@Component({
  selector: 'app-solved-tickets',
  imports: [CommonModule, RouterModule, Select, NoDataFoundComponent, FormsModule, ReactiveFormsModule, ItsupportPipe, DateformatPipe, TranslateModule, DataLoaderContentComponent, TableModule],
  templateUrl: './solved-tickets.component.html',
  styleUrl: './solved-tickets.component.scss'
})
export class SolvedTicketsComponent implements OnInit,OnDestroy {
  subscription!: Subscription;
  searchValue!:string;
  empinfo = {} as Ipersonal;
  tickets= [] as Ticket[];
  originalTickets: Ticket[] = [];
  currentSortField = '';
  currentSortOrder = 0;
  @ViewChild('dt') dt!: Table;
  dataloader: boolean = false;
  isLoading: boolean = false;
  itSupportForm!: FormGroup;
  ticketRaisedFor: any[] = [];
  status = [
    { value: 'Open', label: 'Open' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Await On User', label: 'Await On User' },
    { value: 'Rejected', label: 'Rejected' }
  ];
  teamTicketDetails: any = {};
  allEmployees = [] as Assignee[];
  selectedTickets: any = {};
  itTicketDetails = {} as any;
  selectedAssigneeId: any;

  constructor(
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private fb: FormBuilder,
    private confirmation: OpenModalService,
    public rbac : RbacService
  ) { }

  ngOnInit() {
    this.ticketRaisedFor = [
      { value: 'Self', label: 'Self' },
      { value: 'Colleague', label: 'Colleague' }
    ];
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.teamTicketDetails = JSON.parse(localStorage.getItem('ticketDetails') || '{}');

    this.getuserticketsbyempid();
    this.itSupportForm = this.fb.group({
      employee: [{ value: 'Self', disabled: true }, Validators.required],
      name: [{ value: '', disabled: true }, Validators.required],
      email: [{ value: '', disabled: true }, Validators.required],
      phoneNumber: [{ value: '', disabled: true }, Validators.required],
      deskdetails: [{ value: '', disabled: true }, [Validators.required]],
      department: [{ value: '', disabled: true }, [Validators.required]],
      team: [{ value: '', disabled: true }, [Validators.required]],
      type: [{ value: '', disabled: true }, [Validators.required]],
      priority: [{ value: '', disabled: true }, [Validators.required]],
      subject: [{ value: '', disabled: true }, [Validators.required]],
      description: [{ value: '', disabled: true }, [Validators.required]],
      comments: [''],
      assignedto: [null],
      ticketStatus: ['', [Validators.required]]
    });
  }

  openModal(content: any, ticket: any) {
    this.selectedTickets = ticket;
    this.getEmployee(this.selectedTickets.empId)
    this.itSupportForm.patchValue({
      employee: this.selectedTickets.employee === 'Self' ? 'Self' : 'Self',
      name: this.selectedTickets.employeeName,
      email: this.selectedTickets.emailaddress,
      phoneNumber: this.selectedTickets.contactnumber,
      deskdetails: this.selectedTickets.deskNo,
      department: this.selectedTickets.departmentName,
      team: this.selectedTickets.subdepartmentName,
      type: this.selectedTickets.type,
      priority: this.selectedTickets.priority,
      subject: this.selectedTickets.subject,
      description: this.selectedTickets.description,
      ticketStatus: this.status.find((status) => status.label === this.selectedTickets.ticketStatus),
    });
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  openConfirmationModal(content: any) {
    this.modalService.open(content, {centered: true,backdrop: 'static'});
  }

  cleardata(){
    this.modalService.dismissAll();
  }

  getuserticketsbyempid() {
    this.dataloader = true;
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Tickets/getTicketsByReportingId/${EmpId}`).subscribe({
      next: (data: any) => {
        this.dataloader = false;
        this.tickets = data.filter((ticket: any) => ticket.ticketStatus === 'Closed');
        this.originalTickets = Array.isArray(this.tickets) ? [...this.tickets] : [];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.dt) {
          this.dt.reset();
        }
      },
      error: (err: any) => {
        this.dataloader = false;
        console.error(err);
        this.tickets = [];
        this.originalTickets = [];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.dt) {
          this.dt.reset();
        }
      }
    })
  }

  customSort(event: any): void {
    const field = String(event.field ?? '');
    const nextOrder = event.order === 1 ? 1 : -1;

    if (this.currentSortField === field && this.currentSortOrder === -1 && nextOrder === 1) {
      this.tickets = [...this.originalTickets];
      this.currentSortField = '';
      this.currentSortOrder = 0;
      if (this.dt) {
        this.dt.reset();
      }
      return;
    }

    this.currentSortField = field;
    this.currentSortOrder = nextOrder;

    const priorityRank: Record<string, number> = { Urgent: 4, High: 3, Medium: 2, Low: 1 };

    const compare = (a: any, b: any): number => {
      if (field === 'id') {
        const n1 = Number(a?.id ?? 0) || 0;
        const n2 = Number(b?.id ?? 0) || 0;
        return n1 - n2;
      }
      if (field === 'priority') {
        const p1 = priorityRank[String(a?.priority ?? '')] ?? 0;
        const p2 = priorityRank[String(b?.priority ?? '')] ?? 0;
        return p1 - p2;
      }
      if (field === 'createdAt' || field === 'updatedAt') {
        const getDateOnly = (value: any) => {
          if (!value) return 0;
          const date = new Date(value);
          // Ignore time
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        };
        return getDateOnly(a?.[field]) - getDateOnly(b?.[field]);
      }
      const s1 = String(a?.[field] ?? '').trim();
      const s2 = String(b?.[field] ?? '').trim();
      return s1.localeCompare(s2, undefined, { sensitivity: 'base' });
    };

    this.tickets = [...this.tickets].sort((a, b) => this.currentSortOrder * compare(a, b));
  }

  getEmployee(empId: any) {
    this.subscription = this.http.getData(`JobDetails/getRMTM?EmployeeId=${empId}`).subscribe({
      next: (data: any) => {
        this.allEmployees = data;
        this.allEmployees = this.allEmployees.map(a => ({
          ...a,
          fullName: `${a.fusionEmpId} - ${a.assigneeName}`.trim()
        }));
        this.itSupportForm.patchValue({
          assignedto : this.allEmployees.find((emp) => emp.assigneeId == this.selectedTickets.assigneeId),
        });
      },
      error: (reason: any) => {
      }
    });
  }

  assigneeDetails(id: any) {
    this.selectedAssigneeId = id;
  }

  onUpdate() {
    this.isLoading = true;
    this.itTicketDetails.id = this.selectedTickets.id;
    this.itTicketDetails.empId = this.selectedTickets.empId;
    this.itTicketDetails.subdeptId = this.selectedTickets.subdeptId;
    this.itTicketDetails.deskNo = this.selectedTickets.deskNo;
    this.itTicketDetails.type = this.selectedTickets.type;
    this.itTicketDetails.ticketStatus = this.itSupportForm.value.ticketStatus.label;
    this.itTicketDetails.priority = this.selectedTickets.priority;
    this.itTicketDetails.subject = this.selectedTickets.subject;
    this.itTicketDetails.description = this.selectedTickets.description;
    this.itTicketDetails.stepsToReplicate = this.selectedTickets.stepsToReplicate;
    this.itTicketDetails.comments = this.itSupportForm.value.comments;
    this.itTicketDetails.attachmentUrl = null;
    this.itTicketDetails.createdAt = this.selectedTickets.createdAt;
    this.itTicketDetails.updatedAt = new Date().toISOString();;
    this.itTicketDetails.isdeleted = false;
    if(this.itSupportForm.value.assignedto !== null && this.itSupportForm.value.assignedto !== "" && this.itSupportForm.value.assignedto !== undefined){
      this.itTicketDetails.assigneeId = this.itSupportForm.value.assignedto.assigneeId.toString();
    }
    if(this.itSupportForm.value.assignedto === undefined){
      this.itTicketDetails.assigneeId = null;
    }
    console.log(this.itTicketDetails);

    this.subscription = this.http.postdata(`Tickets/Update`, this.itTicketDetails).subscribe({
      next: (data: any) => {
        this.confirmation.openSuccessModal('Ticket updated successfully');
         this.http.requestRefresh();
        localStorage.removeItem('ticketDetails');
        setTimeout(() => {
          this.itSupportForm.reset();
          this.modalService.dismissAll();
          this.getuserticketsbyempid();
        }, 2000);
        this.isLoading = false;
      },
      error: (err: any) => {
        this.confirmation.openErrorModal(err.error.Message);
        this.isLoading = false;
      },
      complete: () => {
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
