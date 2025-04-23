import { Component } from '@angular/core';
import { HttpService } from '../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Ipersonal } from '../../Interfaces/members-model';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { Subscription } from 'rxjs';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Select } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { OpenModalService } from '../../services/open-modal.service';
import { IDepartment } from '../../Interfaces/letters-model';


@Component({
  selector: 'app-my-tickets',
  imports: [CommonModule, Select, RouterModule,ReactiveFormsModule,NoDataFoundComponent, TranslateModule],
  templateUrl: './my-tickets.component.html',
  styleUrl: './my-tickets.component.scss'
})
export class MyTicketsComponent {
  subscription!: Subscription;
  empinfo = {} as Ipersonal;
  tickets: any = [];
  isLoading: boolean = false;
  itSupportForm!: FormGroup;
  employeedetails: any = [];
  ticketRaisedFor :any []=[];
  ticketFor : string = 'Self';
  allEmployeesself = [] as any [];
  empdata = {} as any;
  isColleagueSelected:boolean = true;
  ticketEmpData = {} as any;
  allEmployees = [] as any [];
  departmentDetails = [] as IDepartment[];
  employeeId : any;
  teamDropdownValues: any[] = [];
  postDetails: any = {};
  itTicketDetails = {} as any;
  selectedSubDepartmentId: any;
  typeDetails = [
    { value: 'Issue', label: 'Issue' },
    { value: 'Incident', label: 'Incident' },
    { value: 'Query', label: 'Query' }

  ];
  priorityDetails = [
    { value: 'Urgent', label: 'Urgent' },
    { value: 'High', label: 'High' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Low', label: 'Low' }

  ];



  constructor(
    private readonly http: HttpService,
    private readonly modalService: NgbModal,
    private fb: FormBuilder,
    private confirmation: OpenModalService
  ) {}

  

  ngOnInit() {
    this.ticketRaisedFor = [
      { value: 'Self', label: 'Self' },
      { value: 'Colleague', label: 'Colleague' }
    ];
    
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getSelfEmployee();
    this.getEmployee();
    this.getuserticketsbyempid();
    this.getDepartment(); 

    this.itSupportForm = this.fb.group({
      employee: ['', Validators.required],
      name: [null, Validators.required],
      email: [null, Validators.required],
      phoneNumber: [null, Validators.required], 
      deskdetails: ['', [Validators.required]],
      department: ['', [Validators.required]],
      team: ['', [Validators.required]],
      type: ['', [Validators.required]],
      priority: ['', [Validators.required]],
      subject: ['', [Validators.required]],
      description: ['', [Validators.required]],



    });
    this.itSupportForm.patchValue({
      employee: this.ticketFor
    });
  }


  getEmployee() {
    this.employeeId = this.empinfo.employeeId
    this.subscription = this.http.getData(`Employeedata/neglectself?employeeid=${this.employeeId}`).subscribe({
      next: (data: any) => {
        this.allEmployees = data;
        this.allEmployees = this.allEmployees.map(a => ({
          ...a,
          fullName: `${a.fusionEmpId} - ${a.firstName} ${a.middleName ?? ''} ${a.lastName}`.trim()
        }));
        console.log(this.allEmployees);  // Check the structure
      },
      error: (reason: any) => {
        console.log(reason);
      }
    });
  }


  getSelfEmployee() {
    this.subscription = this.http.getData('Employeedata/ActiveAllEmployees').subscribe({
      next: (data: any) => {
        this.allEmployeesself = data;
        this.allEmployeesself = this.allEmployeesself.map(a => ({
          ...a,
          fullName: `${a.fusionEmpId} - ${a.firstName} ${a.middleName ?? ''} ${a.lastName}`.trim()
        }));
        
        console.log(this.itSupportForm.value.name);

        console.log(this.allEmployeesself);
        this.onTicketRaisedForChange("Self");
      },
      error: (reason: any) => {
        console.log(reason);
      }
    });
 
  }


  
  onDepartmentChange(selectedDepartment: any): void {
    const selectedDepartmentId = selectedDepartment.sno; // Get the sno of the selected department
    // Fetch the teams based on the selected department ID
    this.subscription = this.http.getData(`Subdepartments/Getnames/${selectedDepartmentId}`).subscribe({
      next: (data: any) => {
        if (data) {
          this.teamDropdownValues = data; // Update the team dropdown values
        } else {
          this.teamDropdownValues = []; // Reset if no teams are found
        }
        this.itSupportForm.patchValue({ team: null }); // Reset the team selection
      },
      error: (err: any) => {
        this.teamDropdownValues = []; // Reset on error
        this.itSupportForm.patchValue({ team: null }); // Reset the team selection
      }
    });
  }


    getDepartment() {
      this.subscription = this.http.getData('Department').subscribe({
        next: (data: any) => {
          this.departmentDetails = data as IDepartment[];
        }
      });
    }
    
  
  onTicketRaisedForChange(event: any) {
    let value = event;
    this.ticketFor = value;
    console.log(value);
    this.itSupportForm.patchValue({
      name: null,
      email: null,
      phoneNumber: null,
      employeeId: null,
      deskdetails: null,
    });
    if (value === "Self") {
       
        let empid = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}').employeeId;
        this.empdata = this.allEmployeesself.find(employee => employee.employeeId == empid);
        console.log(this.empdata);
        if (this.empdata) {
            this.ticketEmpData.employeeId = this.empdata.employeeId;
            this.ticketEmpData.fusionEmpId = this.empdata.fusionEmpId;
            this.ticketEmpData.name = `${this.empdata.fusionEmpId} - ${this.empdata.firstName} ${this.empdata.middleName ?? ''} ${this.empdata.lastName}`;
            this.ticketEmpData.email = this.empdata.workEmail;
            this.ticketEmpData.mobile_number = this.empdata.contactnumber;
            this.ticketEmpData.deskId = this.empdata.deskId;

            if (this.allEmployeesself.length > 0) {
              this.itSupportForm.patchValue({
                name: this.ticketEmpData.name,
                email: this.ticketEmpData.email,
                phoneNumber: this.ticketEmpData.mobile_number,
                deskdetails: this.ticketEmpData.deskId,
              });
            }
            console.log(this.itSupportForm.value.name);
            

        }
        console.log(this.ticketEmpData);
        this.isColleagueSelected = true; 
    }
    else {
        this.ticketEmpData.EmployeeId = null;
        this.ticketEmpData.fusionEmpId = null;
        this.ticketEmpData.name = '';
        this.ticketEmpData.email = '';
        this.ticketEmpData.mobile_number = '';
        this.ticketEmpData.deskId='';
        this.isColleagueSelected = false; 
    }
 }

 colleagueDetails(event: any) {
  console.log(event);
  console.log(this.allEmployeesself);
  
  this.empdata = this.allEmployeesself.find((employee) => employee.employeeId == event);
  this.itSupportForm.patchValue({
    name: null,
    email: null,
    phoneNumber: null,
    employeeId: null,
    deskdetails: null,
  });
  console.log(this.empdata);
  
  if (this.empdata) {

    this.ticketEmpData.fusionEmpId = this.empdata.fusionEmpId;
    this.ticketEmpData.fullName = `${this.empdata.firstName} ${this.empdata.middleName} ${this.empdata.lastName}`;
    this.ticketEmpData.employeeId = this.empdata.employeeId;
    this.ticketEmpData.email = this.empdata.workEmail;
    this.ticketEmpData.mobile_number = this.empdata.contactnumber;
    this.ticketEmpData.assetName = this.empdata.assetName;
    this.ticketEmpData.deskId = this.empdata.deskId;
    if (this.allEmployees.length > 0) {
      this.itSupportForm.patchValue({
        name: this.allEmployeesself.find((employee) => employee.employeeId === event).fullName,
        email: this.ticketEmpData.email,
        phoneNumber: this.ticketEmpData.mobile_number,
        deskdetails: this.ticketEmpData.deskId,
      });
      console.log(this.itSupportForm.value.name);
      
    }

  } else {

    this.ticketEmpData.fusionEmpId = '';
    this.ticketEmpData.name = '';
    this.ticketEmpData.email = '';
    this.ticketEmpData.mobile_number = '';
    this.ticketEmpData.deskId='';
    this.ticketEmpData.assetName='';
  }

  console.log(this.ticketEmpData);
}
  
  
  getuserticketsbyempid(){
    let EmpId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http.getData(`Tickets/getnamesbyEmpId/${EmpId}`).subscribe({ 
      next: (data: any) => {
        console.log(data);
          this.tickets = data
          console.log(this.tickets)
      },
      error: (err: any) => {
        console.log(err);

      }
    })
  }
  
  onSubDepartmentNameChange(selectedSubDepartment: any): void {
    this.selectedSubDepartmentId = selectedSubDepartment.subdepartmentId;
    console.log(this.selectedSubDepartmentId);
  }
  onSubmit() {
    this.isLoading = true;
    console.log(this.itSupportForm.value);
    this.postDetails = this.itSupportForm.value

    this.itTicketDetails.empId = this.ticketEmpData.employeeId;
    this.itTicketDetails.subdeptId = this.selectedSubDepartmentId;
    this.itTicketDetails.deskNo = this.itSupportForm.value.deskdetails;
    this.itTicketDetails.type = this.itSupportForm.value.type;
    this.itTicketDetails.ticketStatus = "Open";
    this.itTicketDetails.priority = this.itSupportForm.value.priority;
    this.itTicketDetails.subject = this.itSupportForm.value.subject;
    this.itTicketDetails.description = this.itSupportForm.value.description;
    this.itTicketDetails.stepsToReplicate = this.itSupportForm.value.description;
    this.itTicketDetails.comments = null
    this.itTicketDetails.assigneeId = null;
    this.itTicketDetails.attachmentUrl = null;
    this.itTicketDetails.createdAt = new Date().toISOString();
    this.itTicketDetails.updatedAt = null;
    this.itTicketDetails.isdeleted = false
    this.subscription = this.http.postdata(`Tickets`, this.itTicketDetails).subscribe({
      next: (data: any) => {
       console.log(data);
       this.confirmation.openSuccessModal('Ticket raised successfully');
       localStorage.setItem('ticketDetails', JSON.stringify(data));
       setTimeout(() => {
        this.itSupportForm.reset();
        this.modalService.dismissAll();
        this.getuserticketsbyempid();
       }, 2000);
       this.isLoading = false;

      },
      error: (err: any) => {
        console.error(err);
        this.confirmation.openErrorModal(err.error.Message);
        this.isLoading = false;
      },
      complete: () => {

      }
    });

  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static' });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }


}
