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
import { TranslateModule } from '@ngx-translate/core';
import { Location } from '@angular/common';
@Component({
  selector: 'app-employe-off-boarding',
  imports: [RouterModule, ReactiveFormsModule, CommonModule, Select, DateformatPipe,TranslateModule],
  templateUrl: './employe-off-boarding.component.html',
  styleUrl: './employe-off-boarding.component.scss'
})
export class EmployeOffBoardingComponent {
  offBoardingForm!: FormGroup;
  subscription!: Subscription;
  terminationDetails = [] as ITermination[];
  empinfo = {} as any;
  popupMsg!: string;
  islastworking: boolean = false;
  lastworkingdisplay: any;
  successstatus: any;
  rehireDetails = [] as IRehiredata[];
  currentDate = new Date().toISOString().slice(0, 10);
  Statusdetails = [] as IStatus[]
  joiningDate: any;
  dateOfJoining: any
//    exitTypeOptions = [
//   { label: 'Resignation', value: 'Resignation' },
//   { label: 'Termination', value: 'Termination' },
//   { label: 'Abscond', value: 'Abscond' }
// ];
  exitTypeOptions :any;

  constructor(private modalService: NgbModal, private fb: FormBuilder, private conformationPopup: OpenModalService, private http: HttpService, private router: Router,private location:Location) { }


  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('personaldata') ?? '{}');
    this.initializeForm();
    this.dateOfJoining = this.formatDateToLocal(this.empinfo.dateOfJoining);
    if (this.empinfo?.lastworkingday) {
      const formattedDate = this.formatDateToLocal(this.empinfo.lastworkingday);
      this.offBoardingForm.patchValue({
        lastdate: formattedDate
      });
    }
    this.getTermination();
    this.getRehire();
    this.getStatus();
    this.getExitTypeDetails();
    this.getEmployeeId();
  }



  initializeForm() {
    this.offBoardingForm = this.fb.group({
      exitType: [null, Validators.required],
      exit: [null, Validators.required],
      eligiblefor: [null, Validators.required],
      status: [null, Validators.required],
      lastdate: ['', Validators.required],
      contractorLastDate: ['']
    });
  }

  offBoardingEmp!: any
  getEmployeeId(): void {
    const employeeId = parseInt(this.empinfo.employeeId);
    this.subscription = this.http
      .getData(`Employeedata/${employeeId}`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.offBoardingEmp = data;
          this.joiningDate = this.formatDateToLocal(data.dateOfJoining);
          if ((data.substatus?.toLowerCase() === 'cleared no due'||data.substatus?.toLowerCase() === 'notice period') && data.empstatus === "Active") {
            const lastWorking = this.formatDateToLocal(data.lastworkingday);
            this.offBoardingForm?.patchValue({ lastdate: lastWorking });
            const lastDateControl = this.offBoardingForm.get('lastdate');
            if (lastDateControl) {
              lastDateControl.disable();
            }
          }
          const isActiveContract =(data.substatus?.toLowerCase() === 'cleared no due' ||data.substatus?.toLowerCase() === 'notice period') && data.empstatus?.toLowerCase() === 'active contract';
          const contractorLastDateControl = this.offBoardingForm.get('contractorLastDate');
          if (isActiveContract) {
            const lastWorking = this.formatDateToLocal(data.contractorLastWorkingDate);
            this.offBoardingForm.patchValue({
              lastdate: lastWorking,
              contractorLastDate: lastWorking,
            });
            // Disable fields
            this.offBoardingForm.get('lastdate')?.disable();
            contractorLastDateControl?.disable();
            //  Make required
            contractorLastDateControl?.setValidators([Validators.required]);
          } else {
            //  Remove required
            contractorLastDateControl?.clearValidators();
          }
          // Important: update validity
          contractorLastDateControl?.updateValueAndValidity();

          const selectedStatus = this.Statusdetails.find(
            (item: any) => item.statusname === data.empstatus
          );
          this.offBoardingForm?.patchValue({
              exitType: data.termtypeoffboard ,
              exit: data.termreasonoffboard,
              eligiblefor: data.eligibleforrehire,
              status: selectedStatus,

            });
        },
        error: (reason: any) =>
          console.error('Error fetching employee data:', reason),
      });
  }

  getExitTypeDetails() {
    this.subscription = this.http.getData('entityAttributeValues/getv1?entity=Offboarding&attribute=ExitType').subscribe({
      next: (data: any) => this.exitTypeOptions = data
    });
  }
  formatDateToLocal(date: string): string {
 if (date) {
      return moment(date).format('YYYY-MM-DD');
    }
    return date;
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' });
  }
  cleardata() {
    this.offBoardingForm.reset();
    this.modalService.dismissAll();
    this.router.navigate(['/personalinfo/job/employmentType/offboarding-details']);

  }
  navigationtoPrevious(){
  this.location.back();
 }
  getStatus() {
    this.subscription = this.http.getData(`Status`).subscribe({
      next: (data: any) => {
        this.Statusdetails = data as IStatus[]
        console.log(this.Statusdetails);
        if (this.empinfo?.empstatus === 'Prospective' || this.empinfo?.empstatus === 'Active') {
          this.Statusdetails = data.filter((status: IStatus) => status?.statusname?.toLowerCase() === 'inactive');
        } else if (this.empinfo?.empstatus === 'Trainee Prospective' || this.empinfo?.empstatus === 'Trainee Active') {
          this.Statusdetails = data.filter((status: IStatus) => status?.statusname?.toLowerCase() === 'trainee inactive');
        }
        else if (this.empinfo?.empstatus === 'Active Contract') {
          this.Statusdetails = data.filter((status: IStatus) => status?.statusname?.toLowerCase() === 'inactive contract');
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
  postOffBoardingDetails() {
    if (this.offBoardingForm.valid) {
      const lastDateControl = this.offBoardingForm.get('lastdate');
      if (lastDateControl) {
          lastDateControl.enable();
        }
      const formdata=this.offBoardingForm.value
      if(formdata.status.statusname === 'Inactive Contract'){
        this.offBoardingEmp.contractorLastWorkingDate=formdata.lastdate;
      }
      else{
        this.offBoardingEmp.lastworkingday=formdata.lastdate;
      }
      this.offBoardingEmp.termtypeoffboard=formdata.exitType
      this.offBoardingEmp.termreasonoffboard=formdata.exit;
      this.offBoardingEmp.empstatus=formdata.status.statusname;
      this.offBoardingEmp.eligibleforrehire=formdata.eligiblefor;
      this.offBoardingEmp.separationType = this.offBoardingEmp.separationType;
      this.subscription = this.http.postdata(`Employeedata/UPDATER`, this.offBoardingEmp).subscribe({
        next: (res: any) => {
          console.log(res);
       if (res.statusCode === 200) {

            this.conformationPopup.openSuccessModal('Employee Inactived successfully')
            if (this.offBoardingEmp.empstatus === 'Inactive') {
              this.router.navigate(['/employee-management/inactive/employees']);
              //this.InactiveEmail(this.empinfo.employeeId);
            }
            else if (this.offBoardingEmp.empstatus === 'Trainee Inactive') {
              this.router.navigate(['/employee-management/inactive/interns']);
            }
            else if (this.offBoardingEmp.empstatus === 'Inactive Contract') {
              this.router.navigate(['/employee-management/inactive/contract']);
            }

          } else if (res.statusCode === 409) {

            this.conformationPopup.openErrorModal(res.message);

          }
          //this.InactiveEmail(this.empinfo.employeeId);
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


  InactiveEmail(employeeId: any) {
    let EmployeeId = parseInt(this.empinfo.employeeId)
    console.log(employeeId)
    this.subscription = this.http
      .postdata(`CustomEmail/InactivEmployee/${this.empinfo.employeeId}`, this.empinfo)
      .subscribe({
        next: (data: any) => {
          console.log(data);
        },
      });
  }
}
