import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgForm } from '@angular/forms';
import { IPolicies, Ipolicy } from '../../../../Interfaces/policies.model';
import { HttpService } from '../../../../services/http.service';
import { CommonModule } from '@angular/common';
import { DateformatPipe } from './../../../../Pipes/dateformat.pipe';
import { forkJoin, Subscription } from 'rxjs';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import moment from 'moment';


@Component({
  selector: 'app-pending-policies',
  imports: [CommonModule, DateformatPipe,ReactiveFormsModule, FormsModule,],
  templateUrl: './pending-policies.component.html',
  styleUrl: './pending-policies.component.scss'
})
export class PendingPoliciesComponent {
  Employeedetials = {} as any
  currentYear: number = new Date().getFullYear();
  selectedYear: number = this.currentYear;
  years: { name: string, value: number }[] = [];

  dataload = false;
  spinnerLoader=false
  selectedfileds = {} as any;
   subscription!: Subscription;
  list!: any[];
policyitems: any;
policiesForm!: FormGroup;
locationid!: number;
updataid!: number;
 policyheaderitems: Ipolicy[] = [];
  sublocationid!: number | undefined;
  shiftid: number | undefined;
  rows: any = [{
    policyName: '',
    policyDescription: '',
    policyAttachment: ''
  }];
@ViewChild('loading') lsoading: any;
Message:string = '';
  empinfo: any;
selectedItem: any;

  

  constructor(public router: Router, private http: HttpService, private modalService: NgbModal,private fb: FormBuilder) { }
  ngOnInit(): void {
    this.currentYear = new Date().getFullYear();
  this.selectedYear = this.currentYear;

  // Populate years dynamically
  for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
    this.years.push({ name: i.toString(), value: i });
  }
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const userDetails = localStorage.getItem("rightlyHrUser");
    this.Employeedetials = JSON.parse(userDetails || '{}');
    console.log(this.Employeedetials); 
    this.getlocation();  
    this.getAllPolicies();
    // for (let i = this.currentYear - 1; i <= this.currentYear + 1; i++) {
    //   this.years.push(i);
    // }

    this.policiesForm = this.fb.group({
      locationId: [null, Validators.required],
      subLocationId: [null, Validators.required],
      shiftID: [null, Validators.required],
      applicableyear: [null, Validators.required],
      policyName: ['', Validators.required],
  description: [''],
  policyAttachment: [null], // optional
      orgPolicyItems: this.fb.array([]) // initialize the FormArray
    });
 
    
  }
  nagvition(){
    this.router.navigate(['/settings/employee-fields/addpolices']);
  }
  createPoliciesItem(): FormGroup {
    return this.fb.group({
      policyName: [null,],
      item_Name: [null,],
      item_Color: [null, Validators.maxLength(250)],
      startTime: [null, Validators.required],
      endTime: [null,],
      allowedGracePeriod: [null, [Validators.required, Validators.maxLength(18)]],
      latestAllowed: [null,],
      allowedBreakTime: [null,],
      halfDayMinHrs: [null,],
      fullDayMinHrs: [null,],

    });
  }

  pendingPolicies=[] as Ipolicy[]
  filterPoliciesByStatus(status: string) {
    if (status == 'Pending for submission') {
      this.pendingPolicies = this.policiesData.filter((ele: Ipolicy) => {
        return ele.status === status
      }).reverse()
    }
    // if (status == 'Published') {
    //   this.publishedPolicies = this.policiesData.filter((ele: Ipolicy) => {
    //     return ele.status == status
    //   }).reverse()
    // }
  }
  policiesData: any
  getAllPolicies() {
    this.dataload = true;
    this.subscription = this.http.getData(`orgPolicies`).subscribe({
      next: (data: any) => {
      
        this.policiesData = data as IPolicies[]
        console.log(this.policiesData);
        this.dataload = false;
        console.log(data);
        this.filterPoliciesByStatus('Pending for submission')
        this.filterPoliciesByStatus('Published')
      },error: () => {
        this.dataload = false;
      },
      complete: () => {
        this.dataload = false;
      }
    });

  }
  // getdatabyentry() {
  //   const params = 'Expense';
  //   const param = 'approverEmails';
  //   this.subscription = this.http
  //     .getDatabyentriyvalue('entityAttributeValues', params, param)
  //     .subscribe({
  //       next: (data: any) => {
  //         if (data.length > 0) {
  //           // Split the string and map into { value: email, label: email } objects
  //           const emailArray = data[0].value.split(',');
  //           this.emails = emailArray.map((email: string) => ({
  //             value: email.trim(), // remove extra spaces
  //             label: email.trim()
  //           }));
  //         }
  //       },
  //       error: (err) => {
  //         console.log("errors", err);
  //       },
  //     });
  // }

  getlocation() {
    this.dataload=true
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.dataload=false
        console.log(data);
        this.list = data.map((item: any) => ({
          name: item.jobLocationName,
          checked: false,
          id: item.id,
          subLocations: item.subLocations.map((sub: any) => ({
            name: sub.jobSubLocationName,
            checked: false,
            id: sub.id
          }))
        }));
      },
      error: (reason: any) =>{
        console.log(reason)
        this.dataload=false
      },
      complete:()=> {
        this.dataload=false
      },
    });
  }
  submitpolicy(form: FormGroup): void {
    this.modalService.open(this.loading, { centered: true, size: 'md' });
   const payload = {
      locationId: this.locationid,
      subLocationId: this.sublocationid,
      shiftID: this.shiftid,
      applicableyear: this.selectedYear,
      status: "Pending for submission",
      addedby: this.Employeedetials.employeeId,
      addedDate: new Date(),
      lastModifedby: this.Employeedetials.employeeId,
      lastModifeddate: new Date(),
      orgPolicyItems: this.rows.map((row: any) => ({
        policyName: row.policyName,
        policyDescription: row.policyDescription,
        policyAttachment: row.policyAttachment,
        status: "Pending for submission"
      }))
    };
  
    const filepath = `/FusionDocuments/organizationPolicy/${this.Employeedetials.employeeId}`;
  
    // Validation: Check for null/empty fields
    // const nullFieldIndex = this.policy.orgPolicyItems.findIndex((policyitem: any) =>
    //   !policyitem.policyDescription ||
    //   !policyitem.policyAttachment ||
    //   !this.policy.subLocationId ||
    //   !this.policy.applicableyear ||
    //   !this.policy.shiftID
    // );
  
    // if (nullFieldIndex !== -1) {
    //   this.modalService.dismissAll();
    //   this.dataFailureMsg('Please fill all the mandatory fields.');
    //   return;
    // }
  
    // const uploadObservables = this.policy.orgPolicyItems.map((item: any) =>
    //   this.http.uploadFileWithQuery('FileSystem/uploadfiletodirectory', filepath, item.policyAttachment)
    // );
  
    // forkJoin(uploadObservables).subscribe({
    //   next: (uploadResults: any[]) => {
    //     uploadResults.forEach((res, i) => {
    //       this.policy.orgPolicyItems[i].policyAttachment = res.path;
    //     });
  
    //     this.subscription = this.http.postdata('orgPolicies/Post', this.policy).subscribe({
    //       next: (response: any) => {
    //         this.modalService.dismissAll();
    //         const modalElement = document.getElementById('successhide');
    //         if (modalElement) {
    //           modalElement.classList.add('show');
    //           modalElement.style.display = 'block';
    //           this.Message = 'Policy Added successfully';
    //         }
    //         setTimeout(() => {
    //           location.reload();
    //         }, 2000);
    //       },
    //       error: (error) => {
    //         this.modalService.dismissAll();
    //         console.error('Error during policy submission:', error);
    //       }
    //     });
    //   },
    //   error: (error) => {
    //     this.modalService.dismissAll();
    //     console.error('Error during file upload:', error);
    //   }
    // });
  }
  get orgPolicyItems(): FormArray {
    return this.policiesForm.get('orgPolicyItems') as FormArray;
  }
  

  addPolicy(): void {
    this.orgPolicyItems.push(this.createPoliciesItem());
    // this.calculateTotalExpensesAmount();

  }
  
  // viewItem(expid: number,) {
  //   console.log(expid);
  //   this.updataid = expid;
  //   this.subscription = this.http
  //     .getitembyid(`orgPolicies/getbyid`, expid).subscribe({

  //       next: (data: any) => {
  //         this.policyheaderitems = data.expenseitem
  //         this.getdatabyentriy();
  //         this.getExpensetype();
  //         this.populateForm(data)
  //       }, error(err) {
  //         console.log("expensesheadererror", err)
  //       },
  //     });

  // }
  // policy: any
  formatDate(date: Date): string {
    return moment(date).format('YYYY-MM-DD');
  }
  onClick(data: any) {
    console.log(data);

    this.selectedfileds = JSON.parse(JSON.stringify(data))
    this.selectedfileds.validupto = this.formatDate(this.selectedfileds.validupto)
  }
  loading(loading: any, arg1: { centered: true; size: string; }) {
    throw new Error('Method not implemented.');
  }
  openModal(content: any) {
    this.modalService.open(content, { centered: true, size: 'xl', backdrop: 'static' });
  }

  
}
