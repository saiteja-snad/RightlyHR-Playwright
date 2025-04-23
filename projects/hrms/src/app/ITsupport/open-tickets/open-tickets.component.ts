import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { IDepartment } from '../../Interfaces/letters-model';

@Component({
  selector: 'app-open-tickets',
  imports: [CommonModule, Select,RouterModule,NoDataFoundComponent, TranslateModule, ReactiveFormsModule],
  templateUrl: './open-tickets.component.html',
  styleUrl: './open-tickets.component.scss'
})
export class OpenTicketsComponent {
  subscription!: Subscription;
  empinfo = {} as Ipersonal;
  tickets: any = [];
  isLoading: boolean = false;
  itSupportForm!: FormGroup;
  ticketRaisedFor :any []=[];
  status :any []=[];

  departmentDetails = [] as IDepartment[];
  teamTicketDetails: any = {};
  allEmployees = [] as any [];
  selectedTickets: any = {};

  constructor(
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private fb: FormBuilder,
  ) {}

  

  ngOnInit() {
    this.ticketRaisedFor = [
      { value: 'Self', label: 'Self' },
      { value: 'Colleague', label: 'Colleague' }
    ];
    this.status = [
      { value: 'Open', label: 'Open' },
      { value: 'Closed', label: 'Closed' },
      { value: 'Await On User', label: 'Await On User' },
      { value: 'Rejected', label: 'Rejected' }

    ];
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    
    this.teamTicketDetails = JSON.parse(localStorage.getItem('ticketDetails') || '{}');
    this.getEmployee(this.teamTicketDetails.empId);

    this.getuserticketsbyempid();
    this.itSupportForm = this.fb.group({
      employee: [{ value: '', disabled: true }, Validators.required],
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
      comments : ['', [Validators.required]],
      assignedto : [null, [Validators.required]],



    });
  }
  
  

  openModal(content: any, ticket: any) {
    this.selectedTickets = ticket;
    this.itSupportForm.patchValue({
      name: this.selectedTickets.employeeName,
      email: this.selectedTickets.emailaddress,
      phoneNumber: this.selectedTickets.contactnumber,
      deskdetails: this.selectedTickets.deskNo,
      department: this.selectedTickets.departmentName,
      team : this.selectedTickets.subdepartmentName,
      type: this.selectedTickets.type,
      priority: this.selectedTickets.priority,
      subject : this.selectedTickets.subject,
      description: this.selectedTickets.description,
      ticketStatus: this.selectedTickets.ticketStatus,
    });
    console.log(ticket);
    
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }
  
  getuserticketsbyempid(){
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Tickets/getTicketsByReportingId/${EmpId}`).subscribe({ 
      next: (data: any) => {
        console.log(data);
          this.tickets = data.filter((ticket: any) => ticket.ticketStatus === 'Open')
          console.log(this.tickets);
          
      },
      error: (err: any) => {
        console.log(err);

      }
    })
  }

  getEmployee(empId:any) {
    // this.employeeid = this.employeeinfos.empId
    console.log(empId);
    this.subscription = this.http.getData(`JobDetails/getRMTM?EmployeeId=${empId}`).subscribe({
      next: (data: any) => {
        this.allEmployees = data;
        console.log(this.allEmployees);
        this.allEmployees = this.allEmployees.map(a => ({
          ...a,
          fullName: `${a.fusionEmpId} - ${a.assigneeName}`.trim()
        }));
      },
      error: (reason: any) => {
        console.log(reason);
      }
    });
 
 
  }

  selectedAssigneeId: any ;

  assigneeDetails(id: any) {
    console.log(id);
    this.selectedAssigneeId = id;
  }
  onUpdate(){

  }
  

}
