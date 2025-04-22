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
  allEmployeesself = [] as any [];
  empdata = {} as any;
  isColleagueSelected:boolean = true;
  ticketEmpData = {} as any;


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
    this.getSelfEmployee();
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getuserticketsbyempid();
   

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
  }


  getSelfEmployee() {
    this.subscription = this.http.getData('Employeedata/ActiveAllEmployees').subscribe({
      next: (data: any) => {
        this.allEmployeesself = data;
        console.log(this.allEmployeesself);
        //this.onTicketRaisedForChange("Self");
      },
      error: (reason: any) => {
        console.log(reason);
      }
    });
 
  }

  
  onTicketRaisedForChange(event: any) {
    let value = event;
    console.log(value);
    if (value === "Self") {
       
        let empid = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}').employeeId;
        this.empdata = this.allEmployeesself.find(employee => employee.employeeId == empid);
        console.log(this.empdata);
        if (this.empdata) {
            this.ticketEmpData.EmployeeId = this.empdata.employeeId;
            this.ticketEmpData.fusionEmpId = this.empdata.fusionEmpId;
            this.ticketEmpData.name = this.empdata.firstName;
            this.ticketEmpData.email = this.empdata.workEmail;
            this.ticketEmpData.mobile_number = this.empdata.contactnumber;
            this.ticketEmpData.deskId = this.empdata.deskId;

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
