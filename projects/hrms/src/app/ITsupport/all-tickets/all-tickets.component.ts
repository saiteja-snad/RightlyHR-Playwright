import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { IDepartment } from '../../Interfaces/letters-model';
import { Select } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../services/open-modal.service';
import { Assignee, Ticket } from '../../Interfaces/hierachy.modal';
import { ItsupportPipe } from "../../Pipes/itsupport.pipe";
import { DateformatPipe } from "../../pipes/dateformat.pipe";
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { SettingsUpdateIconComponent } from "../../icons/settings-update-icon/settings-update-icon.component";
import { Table, TableModule } from 'primeng/table';
import moment from 'moment';

@Component({
  selector: 'app-all-tickets',
  imports: [CommonModule, Select, RouterModule, NoDataFoundComponent, FormsModule, ReactiveFormsModule, TranslateModule, ItsupportPipe, DateformatPipe, DataLoaderContentComponent, SettingsUpdateIconComponent, TableModule],
  templateUrl: './all-tickets.component.html',
  styleUrl: './all-tickets.component.scss'
})
export class AllTicketsComponent implements OnInit,OnDestroy{

  subscription!: Subscription;
  searchValue!:string;
  empinfo = {} as Ipersonal;
  tickets= [] as Ticket[];
  originalTickets: Ticket[] = [];
  currentSortField = '';
  currentSortOrder = 0;
  @ViewChild('dt') dt!: Table;
  isLoading: boolean = false;
  itSupportForm!: FormGroup;
  ticketRaisedFor: any[] = [];
  dataloading: boolean = false;
  status = [
    { value: 'Open', label: 'Open' },
    { value: 'Closed', label: 'Closed' },
    { value: 'Await On User', label: 'Await On User' },
    { value: 'Rejected', label: 'Rejected' }

  ];
  teamTicketDetails: any = {};
  allAssigneeEmployees = [] as Assignee[];
  selectedTickets: any = {};
  itTicketDetails = {} as any;
  selectedAssigneeId: any;


  constructor(
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private confirmation: OpenModalService,
    private fb: FormBuilder,
    public rbac: RbacService
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
      // type: [{ value: '', disabled: true }, [Validators.required]],
      category: [{ value: '', disabled: true }, [Validators.required]],
      subcategory: [{ value: '', disabled: true }, [Validators.required]],
      priority: [{ value: '', disabled: true }, [Validators.required]],
      subject: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^\S.*$/)]],
      description: [{ value: '', disabled: true }, [Validators.required, Validators.pattern(/^\S.*$/)]],
      comments: [''],
      assignedto: [null],
      ticketStatus: ['', [Validators.required]]
    });
  }

  getuserticketsbyempid() {
    this.dataloading = true;
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Tickets/getTicketsByReportingId/${EmpId}`).subscribe({
      next: (data: any) => {
        this.dataloading = false;
        this.tickets = data;
        this.originalTickets = Array.isArray(this.tickets) ? [...this.tickets] : [];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.dt) {
          this.dt.reset();
        }
      },
      error: (err: any) => {
        this.dataloading = false;
        console.error(err);
        this.tickets = [];
        this.originalTickets = [];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.dt) {
          this.dt.reset();
        }
      },
      complete: () => {
        this.dataloading = false;

      }

    })
  }

  customSort(event: any): void {
    const field = event.field;

    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
        event.order = -1;
      } else if (this.currentSortOrder === -1) {
        this.tickets = [...this.originalTickets];
        this.currentSortField = '';
        this.currentSortOrder = 0;
        if (this.dt) this.dt.reset();
        return;
      } else {
        this.currentSortOrder = 1;
        event.order = 1;
      }
    } else {
      this.currentSortField = field;
      this.currentSortOrder = 1;
      event.order = 1;
    }

    event.data.sort((a: any, b: any) => {
      let val1 = a[field];
      let val2 = b[field];

      if (field === 'id') {
        const n1 = Number(val1 ?? 0) || 0;
        const n2 = Number(val2 ?? 0) || 0;
        return event.order * (n1 - n2);
      }
      
      if (field === 'createdAt' || field === 'updatedAt') {
        const date1 = moment(val1);
        const date2 = moment(val2);
        return event.order * date1.diff(date2);
      }

      if (val1 == null && val2 != null) return 1;
      if (val1 != null && val2 == null) return -1;
      if (val1 == null && val2 == null) return 0;

      if (typeof val1 === 'string' && typeof val2 === 'string') {
        return val1.localeCompare(val2) * event.order;
      }

      if (val1 < val2) return -1 * event.order;
      if (val1 > val2) return 1 * event.order;
      return 0;
    });
  }

  getAllAssigneeEmployees(empId: any) {
    console.log(empId);

    this.subscription = this.http.getData(`JobDetails/getRMTM?EmployeeId=${empId}`).subscribe({
      next: (data: any) => {
        this.allAssigneeEmployees = data;
        this.allAssigneeEmployees = this.allAssigneeEmployees.map(a => ({
          ...a,
          fullName: `${a.fusionEmpId} - ${a.assigneeName}`.trim()
        }));
        this.itSupportForm.patchValue({
          assignedto : this.allAssigneeEmployees.find((emp) => emp.assigneeId == this.selectedTickets.assigneeId),
        });
      },
      error: (reason: any) => {
      }
    });
  }



  assigneeDetails(id: any) {
    this.selectedAssigneeId = id;
  }

  openModal(content: any, ticket: any) {
    this.selectedTickets = ticket;
    this.getAllAssigneeEmployees(this.selectedTickets.empId);
    console.log(this.selectedTickets);
    console.log(this.allAssigneeEmployees);


    this.itSupportForm.patchValue({
      employee: this.selectedTickets.employee === 'Self' ? 'Self' : 'Self',
      name: this.selectedTickets.employeeName,
      email: this.selectedTickets.emailaddress,
      phoneNumber: this.selectedTickets.contactnumber,
      deskdetails: this.selectedTickets.deskNo,
      department: this.selectedTickets.departmentName,
      team: this.selectedTickets.subdepartmentName,
      // type: this.selectedTickets.type,
      category: this.selectedTickets.categoryName,
      subcategory: this.selectedTickets.subcategoryName,
      priority: this.selectedTickets.priority,
      subject: this.selectedTickets.subject,
      description: this.selectedTickets.description,
      ticketStatus: this.status.find((status) => status.label === this.selectedTickets.ticketStatus),
    });
      this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
    console.log(this.itSupportForm);



  }

  openConfirmationModal(content: any) {
    this.modalService.open(content, {centered: true,backdrop: 'static'});
  }

  cleardata(){
    this.modalService.dismissAll();
  }

  onUpdate() {
    this.isLoading = true;
    this.itTicketDetails.id = this.selectedTickets.id;
    this.itTicketDetails.empId = this.selectedTickets.empId;
    this.itTicketDetails.subdeptId = this.selectedTickets.subdeptId;
    this.itTicketDetails.deskNo = this.selectedTickets.deskNo;
    // this.itTicketDetails.type = this.selectedTickets.type;
    this.itTicketDetails.ticketStatus = this.itSupportForm.value.ticketStatus.label;
    this.itTicketDetails.priority = this.selectedTickets.priority;
    this.itTicketDetails.subject = this.selectedTickets.subject;
    this.itTicketDetails.description = this.selectedTickets.description;
    this.itTicketDetails.stepsToReplicate = this.selectedTickets.stepsToReplicate;
    this.itTicketDetails.comments = this.itSupportForm.value.comments;

    this.itTicketDetails.attachmentUrl = null;
    this.itTicketDetails.createdAt = this.selectedTickets.createdAt;
    this.itTicketDetails.updatedAt = new Date().toISOString();
    this.itTicketDetails.isdeleted = false;
    this.itTicketDetails.categoryId= this.selectedTickets.categoryId,
    this.itTicketDetails.subcategoryId=this.selectedTickets.subcategoryId,
    this.itTicketDetails.categoryName= this.selectedTickets.categoryName,
    this.itTicketDetails.subcategoryName= this.selectedTickets.subcategoryName
    if(this.itSupportForm.value.assignedto !== null && this.itSupportForm.value.assignedto !== "" && this.itSupportForm.value.assignedto !== undefined){
      this.itTicketDetails.assigneeId = this.itSupportForm.value.assignedto.assigneeId.toString();
    }
    if(this.itSupportForm.value.assignedto === undefined){
      this.itTicketDetails.assigneeId = null;
    }
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
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
