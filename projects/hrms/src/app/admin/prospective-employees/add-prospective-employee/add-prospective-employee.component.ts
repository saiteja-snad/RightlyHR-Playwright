import { CommonModule } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { NgForm, ReactiveFormsModule,FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Select } from 'primeng/select';
import { HttpService } from '../../../services/http.service';
import { AuthServiceService } from '../../../services/auth-service.service';
@Component({
  selector: 'app-add-prospective-employee',
  imports: [CommonModule,ReactiveFormsModule,FormsModule,Select],
  templateUrl: './add-prospective-employee.component.html',
  styleUrl: './add-prospective-employee.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class AddProspectiveEmployeeComponent {
  postProspectiveEmpDetails = {} as any; //variable to post the details
  Prospectiveemp: any;
  subscription: any;
  result: any;
  Status: any;
  islistedItem: boolean = true;
  jobLocationDropDownData = {} as any;
  subLocationsDropdown = {} as any;
  buttondisable: boolean = false;
  disablebutton: boolean = false;
  JobroleDetails = [] as any;
  gradeIdValue: any;
  emp = {} as any;
  selectedValueJobRoledrop: string = ''; //to post the data
  AllJobRoles: any;
  patern: any;
  emailErroremail = false;
  emailErrorweb = false; //array to store all the jobroles
    //function to get the job rol details
    initialLocationId: any;
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

     //function to get the job rol details
  getJobrole() {
    this.subscription = this.http.getData('DesignationGradeMapper').subscribe({
      next: (data: any) => {
        console.log(data);
        this.JobroleDetails = data;
        this.AllJobRoles = this.JobroleDetails.map(
          (item: { designationName: any }) => item.designationName
        );
      },
    });
  }
     //function to get joblocations in to a dropdown
  jobLocationList() {
    this.subscription = this.http
      .getData(`JobLocation/getAllLocations`)
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.jobLocationDropDownData = data;
        },
      });
  }
    OnClickLocation() {
      console.log(this.postProspectiveEmpDetails.locationid);
      console.log(this.postProspectiveEmpDetails.sublocationid);
  
      if (this.postProspectiveEmpDetails.locationid) {
        console.log(this.postProspectiveEmpDetails.locationid);
        if (
          this.initialLocationId !== this.postProspectiveEmpDetails.locationid
        ) {
          this.disablebutton = true;
        } else {
          this.disablebutton = false;
        }
  
        this.initialLocationId = this.postProspectiveEmpDetails.locationid;
        let locationName = this.postProspectiveEmpDetails.locationid;
  
        console.log(locationName);
        let joblocationdetails = this.jobLocationDropDownData.find(
          (c: any) => c.id == locationName
        );
  
        console.log(this.jobLocationDropDownData);
        console.log(joblocationdetails);
        this.getSubLocationByid(joblocationdetails);
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
            console.log(this.subLocationsDropdown);
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

designation: { id: number; name: string }[] = [
  { id: 1, name: 'Software Engineer' },
  { id: 2, name: 'Project Manager' },
  { id: 3, name: 'HR Executive' },
  { id: 4, name: 'Data Analyst' }
];

location: { id: number; name: string }[] = [
  { id: 1, name: 'New York' },
  { id: 2, name: 'Los Angeles' },
  { id: 3, name: 'Chicago' },
  { id: 4, name: 'Houston' }
];

sublocation: { id: number; name: string; locationId: number }[] = [
  { id: 1, name: 'Brooklyn', locationId: 1 },
  { id: 2, name: 'Downtown', locationId: 1 },
  { id: 3, name: 'Hollywood', locationId: 2 },
  { id: 4, name: 'South Side', locationId: 3 }
];

  @ViewChild('success') success: any;

  constructor(private router: Router,
    private http: HttpService,
    private authService: AuthServiceService,
    private modalService: NgbModal ) { }
close(){
  this.modalService.dismissAll();
}
    onclose(f: NgForm){
    //  this.modalService.dismissAll();
    this.JobroleDetails = []
    const modalElement = document.getElementById('requestdoc');
    if (modalElement) {
      modalElement.classList.remove('show');
      modalElement.style.display = 'none';
    }
  }
  
   //function to refresh the form
   onclosepopup(){
    location.reload();
  }
  // postEmpData(f: NgForm) {
  //   // let loggedInUser = this.authService.getToken();
  //   const data = this.postProspectiveEmpDetails;
  //   let postdata = {
  //     firstName: data.firstName,
  //     lastName: data.lastName,
  //     employeeStatus: 'Prospective',
  //     emailaddress: data.personalEmail,
  //     // createdBy: loggedInUser.employeeId,
  //     middleName: data.middleName,
  //     experienceType: data.experienceType,
  //   };
  //   this.subscription = this.http
  //     .postdata('Employeedata/createEmployee', postdata)
  //     .subscribe({
  //       next: (res: any) => {
  //         console.log(res);
  //         alert('employee created')
         
  //       },
  //       error: (err: any) => {
  //         console.log(err);
  //         f.resetForm();
  //       },
  //     });
  // }
  postEmpData(f: NgForm) {
    let loggedInUser = this.authService.getToken();
    const data = this.postProspectiveEmpDetails;
    let postdata = {
      firstName: data.firstName,
      lastName: data.lastName,
      employeeStatus: 'Prospective',
      emailaddress: data.personalEmail,
      createdBy: loggedInUser.employeeId,
      middleName: data.middleName,
      experienceType: data.experienceType,
    };
    this.subscription = this.http
      .postdata('Employeedata/createEmployee', postdata)
      .subscribe({
        next: (res: any) => {
          console.log(res);
          //alert('employee created')
          if (res.statusCode == 201) {
            this.result = res.employeeData;
            // if (res) {
            //   const modalElement = document.getElementById('successhide');
            //   if (modalElement) {
            //     modalElement.classList.add('show');
            //     modalElement.style.display = 'block';
            //     this.Status = 'Prospective employee created successfully'
            //   }
            //   setTimeout(function () {
            //     location.reload();
            //     // f.resetForm();
            //   }, 9000);
    
            // }
            // this.toaster.success({
            //   detail: 'SUCCESS',
            //   summary: 'Prospective employee created successfully',
            //   duration: 5000,
            // });
            // this.emailForRequestDoc(this.result);
            console.log(this.result);
            if (this.result.employeeId != null) {
              const jobdata = {
                employeeId: this.result.employeeId,
                // effectiveDate: null,
                // reportsto: ,
                gradeId: this.gradeIdValue.gradeId,
                locationid: data.locationid,
                sublocationid: data.sublocationid,
                jobRole: this.selectedValueJobRoledrop,
              };
              this.subscription = this.http
                .postdata('JobDetails', jobdata)
                .subscribe({
                  next: (data: any) => {
                    console.log(data);
                    this.select(this.result);
                    //this.router.navigate(["/admin/personal"])
                    // window.location.reload();
                    //alert("job data successfully added")
                  },
                  error: (Reason) => console.log(Reason),
                });
            }
          } else if (res.statusCode == 409) {
            const modalElement = document.getElementById('errorpop');
            if (modalElement) {
              this.Status = res.message
              modalElement.classList.add('show');
              modalElement.style.display = 'block';
              setTimeout(() => {
                modalElement.classList.remove('show');
                modalElement.style.display = 'none';
              },2000)
            }
           
            setTimeout(() => {
              const modalElement = document.getElementById('errorpopup');
          if (modalElement) {
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
          } 
            },3000)
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
            },3000)
          }
        },
        error: (err: any) => {
          console.log(err);
          f.resetForm();
        },
      });
  }
  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    console.log(this.emp);

    this.router.navigate(['/admin/personal']);
  }
}
