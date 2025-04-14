import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { Iprospective } from '../../prospective-employees/Prospective-model';
@Component({
  selector: 'app-add-prospective-intern',
  imports: [CommonModule, Select, TranslateModule, ReactiveFormsModule],
  templateUrl: './add-prospective-intern.component.html',
  styleUrl: './add-prospective-intern.component.scss'
})
export class AddProspectiveInternComponent {
  postProspectiveEmpDetails = {} as any; //variable to post the details
  employeeForm!: FormGroup;
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
  Prospective = [] as any;
  initialLocationId: any;
  isLoading: boolean = false;
  @ViewChild('successhide') private readonly successhide!: NgbModal;
  @ViewChild('errorhide') private readonly errorhide!: NgbModal;
  @ViewChild('success') success: any;
  @ViewChild('pospectivecreate') private readonly pospectivecreate!:NgbModal;
  sublocation: any[] | undefined;
  employeementType: { id: number; name: string }[] = [
    { id: 1, name: 'Fresher' },
    { id: 2, name: 'Experienced' }
  ];

  constructor(private router: Router,
     private conformationPopup: OpenModalService,
     private authService: AuthService, 
     private http: HttpService, private fb: FormBuilder, private modalService: NgbModal) {
  }

  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view');
    this.initializeProspectiveEmpDetails();
    this.empdata();
    this.getJobrole();
    this.jobLocationList();
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
  
  empdata() {
    this.subscription = this.http
      .getData(`Employeedata/TrainingEmployees`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.Prospective = data as Iprospective[];
        },

        error: (reason: any) => console.log(reason),
      });
  }
  selectgradId(event:any){
    console.log(event);
    if(event){
      this.gradeIdValue = event.value;
      console.log(this.gradeIdValue);
    }
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

        this.JobroleDetails =data

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
    const selectedLocationId = event?.value;
    if (selectedLocationId) {
      console.log("Selected Location ID:", selectedLocationId); 
      this.postProspectiveEmpDetails.locationid = selectedLocationId;
      
      let selectedLocation = this.jobLocationDropDownData.find(
        (location: any) => location.id === event.value
      );
  
      console.log("Selected Job Location Details:", selectedLocation);
  
      if (selectedLocation) {
        this.getSubLocationByid(selectedLocation);
      } else {
        console.warn("No matching job location found for ID:", selectedLocationId);
      }

    } else {
      console.warn("No location ID selected.");
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

  openModal(content: any) {
    this.modalService.open(content, { centered: true,backdrop: 'static' });
  }

  postTraineeData() {
    this.isLoading = true;
    let loggedInUser = this.authService.getToken();
    let postdata = {
      firstName: this.employeeForm.get('firstName')?.value,
      middleName: this.employeeForm.get('middleName')?.value,
      lastName: this.employeeForm.get('lastName')?.value,
      experienceType: this.employeeForm.get('employmentType')?.value?.name,
      employeeStatus: 'Trainee Prospective',
      emailaddress: this.employeeForm.get('personalEmail')?.value,
      createdBy: loggedInUser.employeeId,
      empType: 'Trainee'

    }
    this.subscription = this.http.postdata('Employeedata/createEmployee', postdata).subscribe({
      next: (res: any) => {
        console.log(res);
        // this.result = res.employeeData;
        console.log(this.result);
        if (res.statusCode == 201) {
          this.result = res.employeeData;
          console.log(this.result);
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Prospective Intern created successfully');
          this.http.activeTabSubject.next(this.result.employeeId);
          // this.isLoading = false;
          if (this.result.employeeId != null) {
          const jobdata = {
            employeeId: this.result.employeeId,
            gradeId: this.gradeIdValue.gradeId,
            locationid: this.postProspectiveEmpDetails.locationid,
            sublocationid: parseInt(this.employeeForm.get('subLocation')?.value),
            jobRole: this.gradeIdValue.designationName,
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
        this.conformationPopup.openErrorModal(err.message);
      },
    });
  }

  close() {
    this.modalService.dismissAll();
  }
  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    console.log(this.emp);
    localStorage.setItem("routestatus", 'Prospective');
    this.router.navigate(['/admin/personal']);
  }
}
