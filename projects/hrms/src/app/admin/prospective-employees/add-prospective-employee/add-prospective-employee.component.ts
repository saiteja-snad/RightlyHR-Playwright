import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm, ReactiveFormsModule, FormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import { AuthServiceService } from '../../../services/auth-service.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { ProspectiveEmployeesComponent } from '../prospective-employees.component';
@Component({
  selector: 'app-add-prospective-employee',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Select, TranslateModule],
  templateUrl: './add-prospective-employee.component.html',
  styleUrl: './add-prospective-employee.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class AddProspectiveEmployeeComponent {
  postProspectiveEmpDetails = {} as any; //variable to post the details
  employeeForm!: FormGroup ;
  Prospectiveemp: any;
  subscription: any;
  result: any;
  Status: any;
  islistedItem: boolean = true;
  jobLocationDropDownData = [] as any;
  subLocationsDropdown = [] as any;
  buttondisable: boolean = false;
  disablebutton: boolean = false;
  // JobroleDetails = [] as any;
  gradeIdValue: any;
  emp = {} as any;
  selectedValueJobRoledrop: string = ''; //to post the data
  AllJobRoles: any;
  patern: any;
  emailErroremail = false;
  JobroleDetails=[] as any;
  emailErrorweb = false; //array to store all the jobroles
  //function to get the job rol details
  initialLocationId: any;
designation: any;
@ViewChild('success') success: any;
  constructor(private router: Router,private authService: AuthService,private conformationPopup: OpenModalService, private http: HttpService,private fb: FormBuilder,private modalService: NgbModal ) { 
  
    
  }
  ngOnInit(): void {
    this.getJobrole();
    this.jobLocationList();
    // this.initializeProspectiveEmpDetails();
    this.createForm();
  }
  
  initializeProspectiveEmpDetails() {
    this.employeeForm = this.fb.group({
      firstName: [ '',[ Validators.required,  Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$')]],
      middleName: [ '', [   Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$') ]],
      lastName: [ '',[ Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$') ]  ],
      personalEmail: [ '', [Validators.required,Validators.email]],
      designation: ['', Validators.required],
      employmentType: ['', Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required]
    });
  }

  //function to create the form template
  createForm() {
    this.employeeForm = this.fb.group({
      firstName: [ '',[ Validators.required,  Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$')]],
      middleName: [ '', [   Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$') ]],
      lastName: [ '',[ Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$') ]  ],
      personalEmail: [ '', [Validators.required,Validators.email]],
      designation: ['', Validators.required],
      employmentType: ['', Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required]
    });
  }
  //function to check the email pattren
  changepaternemail() {
    this.patern = '[A-Za-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$';
    this.emailErroremail = true;
    this.emailErrorweb = false;
    this.postProspectiveEmpDetails.personalEmail = true;
    console.log(this.postProspectiveEmpDetails.personalEmail);
  }
//functio to select grad id
selectgradId(event:any){
    console.log(event.value); // PrimeNG sends event.value instead of ngModel directly

    // Assign selected value properly
    if(event){
      this.gradeIdValue = event.value;
      console.log(this.gradeIdValue);
    }
  
}
//function to get the jobdetails
  getJobrole() {
    this.subscription = this.http.getData('DesignationGradeMapper').subscribe({
      next: (data: any) => {
        console.log('API Response:', data);

        this.JobroleDetails = data;
      },
      error: (error) => console.error('Error fetching job roles:', error),
    });
  }
  //function to check the grade id

  //function to get joblocations in to a dropdown
  jobLocationList() {
    this.subscription = this.http.getData('JobLocation/getAllLocations').subscribe({
      next: (data: any) => {
        console.log('API Response:', data);
        this.jobLocationDropDownData = data.map((item: { id: number; jobLocationName: string }) => ({
          id: item.id,
          jobLocationName: item.jobLocationName,
        }));
        console.log('Dropdown Options:', this.jobLocationDropDownData);
      },
      error: (error) => {
        console.error('Error fetching locations:', error);
      },
    });
  }
  //function to get the location
  OnClickLocation(event: any) {
    console.log("Selected Location ID:", event.value); // PrimeNG sends event.value instead of ngModel directly

    // Assign selected value properly
    if(event){
      this.postProspectiveEmpDetails.locationid = event.value;

      // Find selected location details
      let selectedLocation = this.jobLocationDropDownData.find(
        (c: any) => c.id == event.value
      );
  
      console.log("Selected Job Location Details:", selectedLocation);
  
      if (selectedLocation) {
        this.getSubLocationByid(selectedLocation);
      } else {
        console.warn("No matching job location found!");
      }
    }
   
  }


  onClickValue() {
    this.disablebutton = false;
  }
  //function to get sublocation by id
  getSubLocationByid(ValuesForSublocation: any) {
    this.subscription = this.http
      .getData(
        `JobLocation/sub-location-by-joblocation/${ValuesForSublocation.id} `
      )
      .subscribe({
        next: (data: any) => {
          console.log(data);

          this.subLocationsDropdown = data.jobSubLocations;       
          console.log('sub-Dropdown Options:', this.subLocationsDropdown);
        },
      });
  }
  letters(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if (
      (charCode < 65 || charCode > 90) &&
      (charCode < 97 || charCode > 122) &&
      charCode !== 32
    ) {
      return false;
    }
    return true;
  }
  // Dummy data for dropdowns
  employeementType: { id: number; name: string }[] = [
    { id: 1, name: 'Fresher' },
    { id: 2, name: 'Experienced' }
  ];

  
  close() {
    this.modalService.dismissAll();
  }
  onclose() {
    this.modalService.dismissAll();
  }

  //function to refresh the form
  onclosepopup() {
    location.reload();
  }
  postEmpData() {
    let loggedInUser = this.authService.getToken();
    let postdata = {
      firstName: this.employeeForm.get('firstName')?.value,
      middleName: this.employeeForm.get('middleName')?.value,
      lastName: this.employeeForm.get('lastName')?.value,
      employeeStatus: 'Prospective',
      emailaddress: this.employeeForm.get('personalEmail')?.value,
      createdBy: loggedInUser.employeeId,
      experienceType:this.employeeForm.get('employmentType')?.value,
    };
    this.subscription = this.http
      .postdata('Employeedata/createEmployee', postdata)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          //alert('employee created')
          if (res.statusCode == 201) {
            this.result = res.employeeData;
            console.log(this.result);
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Prospective Employee Created Successfully');
            this.http.activeTabSubject.next(this.result.employeeId);
            if (this.result.employeeId != null) {
              const jobdata = {
                employeeId: this.result.employeeId,
                // effectiveDate: null,
                // reportsto: ,
                gradeId: this.gradeIdValue.gradeId,
                locationid: this.postProspectiveEmpDetails.locationid,
                sublocationid: this.employeeForm.get('subLocation')?.value,
                jobRole: this.employeeForm.get('designation')?.value,
              };
              this.subscription = this.http
                .postdata('JobDetails', jobdata)
                .subscribe({
                  next: (data: any) => {
                    console.log(data);
                    this.select(this.result);
                  },
                  error: (Reason) => console.log(Reason),
                });
            }
          }
          else if (res.statusCode == 409) {
            this.conformationPopup.openErrorModal(res.message);
         
          } else {
            this.conformationPopup.openErrorModal(res.message); 
            setTimeout(() => {
              this.modalService.dismissAll();
            }, 3000);
          }
        },
        error: (err: any) => {
          console.log(err);
        this.conformationPopup.openErrorModal(err.error.message);
        },
      });
  }
  
  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    console.log(this.emp);

    this.router.navigate(['/admin/personal']);
  }
}
