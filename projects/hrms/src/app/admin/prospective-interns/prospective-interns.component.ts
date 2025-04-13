import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProspectiveInternComponent } from './add-prospective-intern/add-prospective-intern.component';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { ITrainee } from './Prospective-interns-modules';
import { FormsModule } from '@angular/forms';
import { IServe } from '../../Interfaces/letters-model';
import { ActiveEmployeePipe } from '../../Pipes/active-employee.pipe';

@Component({
  selector: 'app-prospective-interns',
  imports: [CommonModule, TranslateModule, ActiveEmployeePipe, FormsModule],
  templateUrl: './prospective-interns.component.html',
  styleUrl: './prospective-interns.component.scss'
})
export class ProspectiveInternsComponent implements OnInit, OnDestroy{
  subscription!: Subscription;
  searchValue: any;
  Trainee = [] as any;
  jobLocationDropDownData = {} as any;
  emp = {} as any;
  Prospective = [] as any;
  JobroleDetails = [] as any;
  AllJobRoles: any;
  serveDetails = [] as IServe[];
  singleValue: IServe | null = null;
  gradeIdValue: any;
  selectedValueJobRoledrop: string = '';
  optionsFound: boolean = true;
  constructor(private router: Router, private http: HttpService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.empdata();
    this.getJobrole();
    this.jobLocationList();
    this.http.activeTabSubject
      .subscribe((selectedObj) => {
        console.log('Received designation from child via Observable:', selectedObj);
        this.empdata();
      });
    this.getservingperiod();
  }
  empdata() {
    this.subscription = this.http.getData(`Employeedata/TrainingEmployees`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.Trainee = data as ITrainee[];
      },

      error: (reason: any) => console.log(reason)
    });

  }
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
  openAddProspective() {
    this.modalService.open(AddProspectiveInternComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }
  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    console.log(this.emp);
    this.router.navigate(['/personalinfo']);
  }

  checkaccess(rba: string): boolean {
    let access = JSON.parse(localStorage.getItem('fusionroleClaims') || '{}');
    if (access.includes(rba)) return true
    else return false

  }

  filterByDuration(duration: string) {
    this.serveDetails = this.serveDetails.filter((item: any) => item.servingPeriodType === 'Trainee Duration Period');
  }

  getJobrole() {
    this.subscription = this.http.getData("DesignationGradeMapper").subscribe({
      next: (data: any) => {
        console.log(data);
        this.JobroleDetails = data;
        this.AllJobRoles = this.JobroleDetails.map((item: { designationName: any; }) => item.designationName)
      }
    });
  }

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
  buttondisable = false;
  disablebutton: boolean = false
  initialLocationId: any;

  //function to get sublocation by id
  subLocationsDropdown = {} as any;
  getSubLocationByid(ValuesForSublocation: any) {
    this.subscription = this.http.getData(`JobLocation/sub-location-by-joblocation/${ValuesForSublocation.id} `).subscribe({
      next: (data: any) => {
        console.log(data);
        this.subLocationsDropdown = data.jobSubLocations
        console.log(this.subLocationsDropdown);
      }
    })
  }
  
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
