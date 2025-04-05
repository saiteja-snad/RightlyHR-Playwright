import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProspectiveInternComponent } from './add-prospective-intern/add-prospective-intern.component';
import { TranslateModule } from '@ngx-translate/core';
import { ActiveEmployeePipe } from "../../Pipes/active-employee.pipe";
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { ITrainee } from './Prospective-interns-modules';
import { FormGroup, FormsModule } from '@angular/forms';
import { IServe } from '../../Interfaces/letters-model';
import { AuthService } from '../../services/auth.service';
import { OpenModalService } from '../../services/open-modal.service';

@Component({
  selector: 'app-prospective-interns',
  imports: [CommonModule, TranslateModule, ActiveEmployeePipe,FormsModule],
  templateUrl: './prospective-interns.component.html',
  styleUrl: './prospective-interns.component.scss'
})
export class ProspectiveInternsComponent {
  subscription!: Subscription;
  searchValue: any;
  Trainee =[] as any;
  emp={} as any;
  postTraineeEmpDetails={} as any 
  JobroleDetails = [] as any;
  result = {} as any;
  gradeIdValue:any;
  selectedValueJobRoledrop: string = '';
  optionsFound: boolean = true;
  jobLocationDropDownData={} as any;
   serveDetails = [] as IServe[];

  constructor(private router: Router,private http: HttpService, private modalService: NgbModal, private authService: AuthService,private conformationPopup: OpenModalService,) { }

  ngOnInit(): void {
    // this._userAcessService.checkRouteAccess('Dashboard.view')
    this.empdata();
    this.getJobrole();
    this.jobLocationList();
     this.getservingperiod();
  }

  openAddProspective() {
    this.modalService.open(AddProspectiveInternComponent, { centered: true, backdrop: 'static', size:'lg' });
  }
  select(act: any) {
    this.emp=localStorage.setItem("personaldata", JSON.stringify(act));
    console.log(this.emp);

    this.router.navigate(["/admin/personal"])

  }
  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
  getJobrole() {
    this.subscription = this.http.getData("DesignationGradeMapper").subscribe({
      next: (data: any) => {
        console.log(data);
        this.JobroleDetails = data;
        this.AllJobRoles = this.JobroleDetails.map((item: { designationName: any; })=> item.designationName)
      }
    });
  }
  buttondisable=false;
  onOptionSelected(option: string) {
   console.log(option);
    if (option) {
      this.selectedValueJobRoledrop = option
      this.gradeIdValue = this.JobroleDetails.find((ele: { designationName: string; }) => ele.designationName == this.selectedValueJobRoledrop)
      console.log(this.gradeIdValue.gradeId);
    }
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
  checkaccess(rba: string): boolean {
    let access = JSON.parse(localStorage.getItem('fusionroleClaims') || '{}');
    if (access.includes(rba)) return true
    else return false

  }
  numbers(event: KeyboardEvent): boolean {
    const charCode = event.key.charCodeAt(0);
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  updateOptionsFound(found: boolean) {
    this.optionsFound = found;
  }
  islistedItem: boolean = true;
  isItemIntheList(isitem: boolean) {
    console.log(isitem);
    this.islistedItem = isitem;
  }
  //function to get joblocations in to a dropdown 
jobLocationList(){
  this.subscription=this.http.getData(`JobLocation/getAllLocations`).subscribe({
    next:(data:any)=>{
      console.log(data);
      this.jobLocationDropDownData=data
    }
  })
}
filterByDuration(duration: string) {

  this.serveDetails = this.serveDetails.filter((item:any) => item.servingPeriodType === 'Trainee Duration Period');
}
singleValue: IServe | null = null;
getservingperiod() {
  this.subscription = this.http.getData("ServingPeriods").subscribe({
    next: (data: any) => {
      console.log(data);
      this.serveDetails = data as IServe[]
      console.log(this.serveDetails);
      const filteredServeDetails = this.serveDetails.filter((serve: IServe) => {
       
        return serve.servingPeriodType === 'Trainee Duration Period';
      });

      
      this.singleValue = filteredServeDetails.length > 0 ? filteredServeDetails[0] : null;
      
      console.log(this.singleValue);
    }
    
  })
}
  //function to get the job rol details 
  AllJobRoles: any;//array to store all the jobroles
  empdata() {
    this.subscription = this.http.getData(`Employeedata/TrainingEmployees`).subscribe({
      next: (data: any) => {
        console.log(data);
     this.Trainee = data as ITrainee[];
      },

      error: (reason: any) => console.log(reason)
    });

  }
   //function to refresh the form 
 onclose(f: FormGroup) {
  // location.reload();
   this.JobroleDetails = []
   const modalElement = document.getElementById('requestdoc');
   if (modalElement) {
     modalElement.classList.remove('show');
     modalElement.style.display = 'none';
   }

}
onclosepopup(){
  location.reload();
}
onClickValue(){
  this.disablebutton = false;
}
//function to get SubLocation
disablebutton:boolean=false
initialLocationId: any;
OnClickLocation(){
  console.log(this.postTraineeEmpDetails.locationid);
  console.log(this.postTraineeEmpDetails.sublocationid);
  
 
  if(this.postTraineeEmpDetails.locationid){
    console.log(this.postTraineeEmpDetails.locationid);
    if (this.initialLocationId !== this.postTraineeEmpDetails.locationid) {
      this.disablebutton = true;
    } else {
      this.disablebutton = false;
    }

    this.initialLocationId = this.postTraineeEmpDetails.locationid;
    let locationName=this.postTraineeEmpDetails.locationid
   
    console.log(locationName);
     let joblocationdetails = this.jobLocationDropDownData.find(
       (c: any) => c.id ==locationName
     );
   
     console.log(this.jobLocationDropDownData);
     console.log(joblocationdetails);
     this.getSubLocationByid(joblocationdetails)
  }
}
//function to get sublocation by id
subLocationsDropdown={} as any;
getSubLocationByid(ValuesForSublocation:any){

  this.subscription=this.http.getData(`JobLocation/sub-location-by-joblocation/${ValuesForSublocation.id} `).subscribe({
  next:(data:any)=>{
    console.log(data);
   
    this.subLocationsDropdown=data.jobSubLocations
    console.log(this.subLocationsDropdown);
  
    
  }
  })
}

openprospective(){
  const modalElement = document.getElementById('requestdoc');
          if (modalElement) {
            modalElement.classList.add('show');
            modalElement.style.display = 'block';
          }
}
Status!: string;
  //function to post the Trainee employee details 
  postTraineeData(f:FormGroup){
    let loggedInUser = this.authService.getToken();
     const data=this.postTraineeEmpDetails
     let postdata={
    firstName: data.firstName,
    lastName: data.lastName,
    employeeStatus: 'Trainee Prospective',
    empType:'Trainee',
    emailaddress: data.personalEmail,
    createdBy:loggedInUser.employeeId,
    middleName:data.middleName,
    experienceType:data.experienceType,
   // durationOfTrainee:data.durationOfTrainee
    // durationOfTrainee:this.singleValue?.duration
  }
  console.log(postdata)
  this.subscription = this.http.postdata('Employeedata/createEmployee', postdata).subscribe({
    next: (res: any) => {
      console.log(res);
      //alert('employee created')
      if (res.statusCode == 201) {
        this.result = res.employeeData; 
        
          // const modalElement = document.getElementById('successhide');
          // if (modalElement) {
          //   modalElement.classList.add('show');
          //   modalElement.style.display = 'block';
          //   this.Status = 'Trainee created successfully'
          // }
      this.conformationPopup.openSuccessModal('Trainee created successfully')
      this.modalService.dismissAll();
        console.log(this.result);
        if (this.result.employeeId != null) {
          const jobdata = {
            employeeId: this.result.employeeId,
            // effectiveDate: null,
            // reportsto: ,
            gradeId:this.gradeIdValue.gradeId,
            locationid: data.locationid,
            sublocationid:data.sublocationid,
            jobRole: data.designationName,
          };
          this.subscription = this.http
            .postdata('JobDetails', jobdata)
            .subscribe({
              next: (data: any) => {
                console.log(data);
                setTimeout(() => {
                  this.select(this.result);
                }, 2000);
               
              
              },
              error: (Reason) => console.log(Reason),
            });
        }
      } else if (res.statusCode == 409) {
        // alert(res.message );
        // const modalElement = document.getElementById('errorpopup');
        //   if (modalElement) {
        //     modalElement.classList.add('show');
        //     modalElement.style.display = 'block';
        //     this.Status = res.message;
        //   }
        this.conformationPopup.openErrorModal(res.message);
          setTimeout(function () {
            const modalElement = document.getElementById('errorpopup');
          if (modalElement) {
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
          }
          }, 4000);
        // f.resetForm();
        this.selectedValueJobRoledrop=''
      } else {
        alert(res.message);
      }
    },
    error: (err: any) => {
      console.log(err);
      f.reset();
    },
  });
  }
}
