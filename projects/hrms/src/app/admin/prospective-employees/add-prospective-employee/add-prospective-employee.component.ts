import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../../../services/auth.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
@Component({
  selector: 'app-add-prospective-employee',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, Select, TranslateModule],
  templateUrl: './add-prospective-employee.component.html',
  styleUrl: './add-prospective-employee.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class AddProspectiveEmployeeComponent {
  postProspectiveEmpDetails = {} as any; //variable to post the details
  employeeForm!: FormGroup;
  Prospectiveemp: any;
  subscription: any;
  result: any;
  Status: any;
  islistedItem: boolean = true;
  jobLocationDropDownData = [] as any;
  subLocationsDropdown = [] as any;
  buttondisable: boolean = false;
  disablebutton: boolean = false;
  gradeIdValue: any;
  emp = {} as any;
  selectedValueJobRoledrop: string = '';
  AllJobRoles: any;
  patern: any;
  emailErroremail = false;
  JobroleDetails = [] as any;
  emailErrorweb = false;
  initialLocationId: any;
  designation: any;
  @ViewChild('success') success: any;

  constructor(private router: Router, private authService: AuthService, private conformationPopup: OpenModalService, 
    private http: HttpService, private fb: FormBuilder, private modalService: NgbModal,public rbac: RbacService) { }

  ngOnInit(): void {
    this.getJobrole();
    this.jobLocationList();
    this.createForm();
  }

  initializeProspectiveEmpDetails() {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$')]],
      middleName: ['', [Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$')]],
      lastName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$')]],
      personalEmail: ['', [Validators.required, Validators.email]],
      designation: ['', Validators.required],
      employmentType: ['', Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required]
    });
  }

  //function to create the form template
  createForm() {
    this.employeeForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$')]],
      middleName: ['', [Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$')]],
      lastName: ['', [Validators.required, Validators.maxLength(50), Validators.pattern('^[a-zA-Z][a-zA-Z\\s]{0,50}$')]],
      personalEmail: ['', [Validators.required, Validators.email]],
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
  }

  //functio to select grad id
  selectgradId(event: any) {
    if (event) {
      this.gradeIdValue = event.value;
    }
  }

  //function to get the jobdetails
  getJobrole() {
    this.subscription = this.http.getData('DesignationGradeMapper').subscribe({
      next: (data: any) => {
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
        this.jobLocationDropDownData = data.map((item: { id: number; jobLocationName: string }) => ({
          id: item.id,
          jobLocationName: item.jobLocationName,
        }));
      },
      error: (error) => {
        console.error('Error fetching locations:', error);
      },
    });
  }

  //function to get the location
  OnClickLocation(event: any) {
    // Assign selected value properly
    if (event) {
      this.postProspectiveEmpDetails.locationid = event.value;
      // Find selected location details
      let selectedLocation = this.jobLocationDropDownData.find(
        (c: any) => c.id == event.value
      );
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

  closepopup(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static' })
  }
  //function to get sublocation by id
  getSubLocationByid(ValuesForSublocation: any) {
    this.employeeForm.get('subLocation')?.setValue(null);
    this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${ValuesForSublocation.id} `).subscribe({
      next: (data: any) => {
        this.subLocationsDropdown = data.jobSubLocations;
      },
    });
  }

  letters(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if ((charCode < 65 || charCode > 90) && (charCode < 97 || charCode > 122) && charCode !== 32) {
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
      experienceType: this.employeeForm.get('employmentType')?.value,
    };
    this.subscription = this.http.postdata('Employeedata/createEmployee', postdata).subscribe({
      next: (res: any) => {
        //alert('employee created')
        if (res.statusCode == 201) {
          this.result = res.employeeData;
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Prospective Employee Created Successfully');
          this.http.activeTabSubject.next(this.result.employeeId);
          if (this.result.employeeId != null) {
            const jobdata = {
              employeeId: this.result.employeeId,
              gradeId: this.gradeIdValue.gradeId,
              locationid: this.postProspectiveEmpDetails.locationid,
              sublocationid: this.employeeForm.get('subLocation')?.value,
              jobRole: this.employeeForm.get('designation')?.value?.designationName,
            };
            this.subscription = this.http.postdata('JobDetails', jobdata).subscribe({
              next: (data: any) => {
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
        this.conformationPopup.openErrorModal(err.error.Message);
      },
    });
  }

  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    this.router.navigate(['/admin/personal']);
  }
}
