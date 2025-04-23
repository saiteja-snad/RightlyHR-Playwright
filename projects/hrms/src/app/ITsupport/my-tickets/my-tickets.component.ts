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
  employeeId : any;
  typeDetails = [
    { value: 'Issue', label: 'Issue' },
    { value: 'Incident', label: 'Incident' },
    { value: 'Query', label: 'Query' }

  ];


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
    
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getSelfEmployee();
    this.getEmployee();
    this.getuserticketsbyempid();
    this.getjobLocationList();

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

  subLocationsDropdown: any = [];
  jobLocationDropDownData: any = [];
  getSubLocationByid(selectedLocation: any): void {
    if (selectedLocation && selectedLocation.id) {
      this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${selectedLocation.id}`).subscribe({
        next: (data: any) => {
          if (data.length === 0) {
            this.subLocationsDropdown = [];
          } else {
            this.subLocationsDropdown = data.jobSubLocations; // Update the sub-location dropdown values
          }
        },
        error: (err: any) => {
        },
      });
    } else {
      this.subLocationsDropdown = [];
    }
  }

  getjobLocationList() {
      this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
        next: (locations: any) => {
          this.jobLocationDropDownData = locations;
          // Fetch sub-locations for each location
          const subLocationRequests = locations.map((location: { id: any; }) =>
            this.http.getData(`JobLocation/sub-location-by-joblocation/${location.id}`)
          );
          
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
            this.ticketEmpData.EmployeeId = this.empdata.employeeId;
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
    this.ticketEmpData.EmployeeId = this.empdata.employeeId;
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

  onSubmit() {
console.log(this.itSupportForm.value);

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
