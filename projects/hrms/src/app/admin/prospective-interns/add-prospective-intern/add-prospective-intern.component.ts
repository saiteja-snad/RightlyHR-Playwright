import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
@Component({
  selector: 'app-add-prospective-intern',
  imports: [CommonModule, Select, TranslateModule, ReactiveFormsModule],
  templateUrl: './add-prospective-intern.component.html',
  styleUrl: './add-prospective-intern.component.scss'
})
export class AddProspectiveInternComponent {
  postProspectiveEmpDetails = {} as any; //variable to post the details
  employeeForm: FormGroup;
  Prospectiveemp: any;
  subscription: any;
  result: any;
  Status: any;
  islistedItem: boolean = true;
  jobLocationDropDownData = {} as any;
  subLocationsDropdown = {} as any;
  buttondisable: boolean = false;
  disablebutton: boolean = false;
  gradeIdValue: any;
  emp = {} as any;
  selectedValueJobRoledrop: string = '';
  AllJobRoles: any;
  patern: any;
  emailErroremail = false;
  JobroleDetails: any[] = [];
  emailErrorweb = false;
  initialLocationId: any;

  @ViewChild('success') success: any;
  sublocation: any[] | undefined;

  constructor(private router: Router, private authService: AuthService, private http: HttpService, private fb: FormBuilder, private modalService: NgbModal) {

    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      middleName: ['', Validators.required],
      lastName: ['', Validators.required],
      personalEmail: ['', [Validators.required, Validators.email]],
      designation: ['', Validators.required],
      employmentType: ['', Validators.required],
      location: ['', Validators.required],
      subLocation: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.getJobrole();
    this.jobLocationList();
  }

  //function to check the email pattren
  changepaternemail() {
    this.patern = '[A-Za-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,4}$';
    this.emailErroremail = true;
    this.emailErrorweb = false;
    this.postProspectiveEmpDetails.personalEmail = true;
    console.log(this.postProspectiveEmpDetails.personalEmail);
  }

  getJobrole() {
    this.subscription = this.http.getData('DesignationGradeMapper').subscribe({
      next: (data: any) => {
        console.log('API Response:', data);

        this.JobroleDetails = data.map((item: { id: number; designationName: string }) => ({
          id: item.id,
          designationName: item.designationName,
        }));

        console.log('Dropdown Options:', this.JobroleDetails);
      },
      error: (error) => console.error('Error fetching job roles:', error),
    });
  }

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


  OnClickLocation(event: any) {
    console.log("Selected Location ID:", event.value); // PrimeNG sends event.value instead of ngModel directly
    // Assign selected value properly
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

  isItemIntheList(isitem: boolean) {
    console.log(isitem);
    this.islistedItem = isitem;
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

  onSubmit() {
    this.postTraineeData();
    const requestBody = this.employeeForm.value;
    console.log('Request Body:', requestBody);
  }

  postTraineeData() {
    let loggedInUser = this.authService.getToken();
    let postdata = {

      firstName: this.employeeForm.get('firstName')?.value,
      lastName: this.employeeForm.get('lastName')?.value,
      employeeStatus: 'Trainee Prospective',
      empType: 'Trainee',
      emailaddress: this.employeeForm.get('emailaddress')?.value,
      createdBy: loggedInUser.employeeId,
      middleName: this.employeeForm.get('middlename')?.value,
      experienceType: this.employeeForm.get('experienceType')?.value
    }
    console.log(postdata)
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
            setTimeout(() => {
              this.router.navigate(['/prospective-interns']); // Navigate after UI update
            }, 500);
          } else if (res.statusCode == 409) {
            const modalElement = document.getElementById('errorpop');
            if (modalElement) {
              this.Status = res.message
              modalElement.classList.add('show');
              modalElement.style.display = 'block';
              setTimeout(() => {
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
              }, 2000)
            }
            setTimeout(() => {
              const modalElement = document.getElementById('errorpopup');
              if (modalElement) {
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
              }
            }, 3000)
            //f.resetForm();
            this.selectedValueJobRoledrop = '';
          } else {
            const modalElement = document.getElementById('errorpop');
            if (modalElement) {
              this.Status = res.message
              modalElement.classList.add('show');
              modalElement.style.display = 'block';
            }
            setTimeout(() => {
              location.reload();
            }, 3000)
          }
        },
        error: (err: any) => {
          console.log(err);
        },
      });
  }

  close() {
    this.modalService.dismissAll();
  }
}
