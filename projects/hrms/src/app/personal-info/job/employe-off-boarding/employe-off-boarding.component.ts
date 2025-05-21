import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../../services/open-modal.service';
import { HttpService } from '../../../services/http.service';
import { CommonModule } from '@angular/common';
import { IRehiredata, ITermination } from '../../../Interfaces/job-model';
import { Subscription } from 'rxjs';
import { IStatus } from '../../../Interfaces/personal-modal';
import { IJobdetails } from '../../../admin/active-employees/active-model';
import { Select } from 'primeng/select';
import { DateformatPipe } from "../../../Pipes/dateformat.pipe";
import moment from 'moment';

@Component({
  selector: 'app-employe-off-boarding',
  imports: [RouterModule, ReactiveFormsModule, CommonModule, Select, DateformatPipe],
  templateUrl: './employe-off-boarding.component.html',
  styleUrl: './employe-off-boarding.component.scss'
})
export class EmployeOffBoardingComponent {
  offBoardingForm!: FormGroup;
  subscription!: Subscription;
  terminationDetails = [] as ITermination[];
  jobdetails = [] as any;
  empinfo = {} as any;
  popupMsg!: string;
  islastworking: boolean = false;
  lastworkingdisplay: any;
  successstatus:any;
  rehireDetails = [] as IRehiredata[];
  currentDate = new Date().toISOString().slice(0, 10);
  Statusdetails = [] as IStatus[]
  joiningDate: any;
  dateOfJoining :any

  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService, private router: Router) { }


  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem("offBoardingemplist") || '{}');
    console.log(this.empinfo);
    this.initializeForm()
    this.getTermination();
    this.getJobDetails();
    this.getRehire();
    this.getStatus();
    this.getEmployeeId()
    
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.dateOfJoining = this.formatDateToLocal(this.empinfo.dateOfJoining)
    console.log(this.dateOfJoining);
    



    if (this.empinfo?.lastworkingday) {
      const formattedDate = this.formatDateToLocal(this.empinfo.lastworkingday);
      this.offBoardingForm.patchValue({
        lastdate: formattedDate
      });
    }
  }



  initializeForm() {
    this.offBoardingForm = this.fb.group({
      exit: [null, Validators.required],
      eligiblefor: [null, Validators.required],
      status: [null, Validators.required],
      lastdate: [null]
    });
  }
  
  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          this.joiningDate =this.formatDateToLocal(data.dateOfJoining)
        },
        error: (reason: any) =>
          console.error('Error fetching employee data:', reason),
      });
  }
  formatDateToLocal(dateString: string): string {
   
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  openModal(content: any) {
    this.modalService.open(content, {centered: true,backdrop: 'static'});
  }
  cleardata() {
    this.offBoardingForm.reset();
    this.modalService.dismissAll();
    this.router.navigate(['/personalinfo/job/employmentType']);

  }
  getStatus() {
    this.subscription = this.http.getData(`Status`).subscribe({
      next: (data: any) => {
        this.Statusdetails = data as IStatus[]
        console.log(this.Statusdetails);
        if (this.empinfo.empstatus === 'Prospective' || this.empinfo.empstatus === 'Active') {
          this.Statusdetails = data.filter((status: IStatus) => status.statusname.toLowerCase() === 'inactive');
        } else if (this.empinfo.empstatus === 'Trainee Prospective' || this.empinfo.empstatus === 'Trainee Active') {
          this.Statusdetails = data.filter((status: IStatus) => status.statusname.toLowerCase() === 'trainee inactive');
        }
        console.log(this.Statusdetails);
      }

    })
  }
  //function to get termination dropdown
  getTermination() {
    this.subscription = this.http.getData("TerminationReason").subscribe({
      next: (data: any) => {
        console.log(data);
        this.terminationDetails = data as ITermination[]
      }
    })
  }
  //function to get rehire dropdown
  getRehire() {
    this.subscription = this.http.getData("Eligibleforrehire").subscribe({
      next: (data: any) => {
        console.log(data);
        this.rehireDetails = data as IRehiredata[]
      }
    })
  }
  //function to get the jobdetails based on emp id
  getJobDetails() {
    let EmployeeId = parseInt(this.empinfo.employeeId)
    console.log(EmployeeId);
    this.subscription = this.http.getData(`JobDetails/Empname/${EmployeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.jobdetails = data[0] as IJobdetails[];
        console.log(this.jobdetails);

      }
    })
  }
  postOffBoardingDetails() {
    if (this.offBoardingForm.valid) {
      const formdata=this.offBoardingForm.value

      this.empinfo.termreasonoffboard=formdata.exit.reason;
      this.empinfo.empstatus=formdata.status.statusname;
      this.empinfo.lastworkingday=formdata.lastdate;
      this.empinfo.eligibleforrehire=formdata.eligiblefor.eligibleforrehire1;
      this.subscription = this.http.postdata(`Employeedata/UPDATER`, this.empinfo).subscribe({
        next: (res: any) => {
          console.log(res);
          this.successstatus = 'Employee Inactived successfully';
          this.conformationPopup.openSuccessModal(this.successstatus)
          this.router.navigate(['/admin/inactive-employees']);
          this.InactiveEmail(this.empinfo.employeeId);
        },
        error: (err: any) => {
          console.log(err);
          if(err.status==500){
            this.conformationPopup.openErrorModal( err.error.message);
          }
          else if(err.status==400){
          this.conformationPopup.openErrorModal('Http failure response')
          }

        }
      })
    }
  }

  InactiveEmail(employeeId:any) {
    let EmployeeId = parseInt(this.empinfo.employeeId)
    console.log(employeeId)
    this.subscription = this.http
      .postdata(`CustomEmail/InactivEmployee/${this.empinfo.employeeId}`,this.empinfo)
      .subscribe({
        next: (data: any) => {
          console.log(data);
        },
      });
  }
}
