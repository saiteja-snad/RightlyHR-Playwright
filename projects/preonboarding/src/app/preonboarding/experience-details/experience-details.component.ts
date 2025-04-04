import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { AddEducationDetailsComponent } from '../education-details/add-education-details/add-education-details.component';
import { CommonModule } from '@angular/common';
import moment from 'moment';
import { Subscription } from 'rxjs';
import { HttpService } from '../../http-services/http.service';
import { IRole, IJobtype, IEmpExperience } from '../../models/experience.model';
import { Ipersonal } from '../../models/personal-details.model';
import { AddExperienceDetailtsComponent } from './add-experience-detailts/add-experience-detailts.component';
import { DateFormatPipe } from "../../pipes/date-format.pipe";

@Component({
  selector: 'app-experience-details',
  imports: [CommonModule, DateFormatPipe],
  templateUrl: './experience-details.component.html',
  styleUrl: './experience-details.component.scss'
})
export class ExperienceDetailsComponent {
  subscription!: Subscription;
  empinfo = {} as Ipersonal;
  JobroleDetails = [] as IRole[];
  JobemploymenttypeDetails = [] as IJobtype[];
  selectedfieldsexperience = {} as any;
  // posttotalExperience = {} as any;
  Experiencedoc!: File
  getempexpdata = [] as any;
  prosempdata = {} as any;
  ExperienceDetails !: File;
  toatlexp = {} as any;

  constructor(private http: HttpService, private modalService: NgbModal) {


  }
  ngOnInit(): void {
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getJobrole();
    this.getexperiencedetails();
    this.getemploymenttype();
    this.getAllemployees();
  }

  openExperience() {
    this.modalService.open(AddExperienceDetailtsComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  formatDate(data: any): any {
    if (data) {
      return moment(data).format('YYYY-MM-DD');
    }
    return data
  }

  //function to get jobtype dropdown
  getemploymenttype() {
    this.subscription = this.http.getData("PreonboardingJobtype").subscribe({
      next: (data: any) => {
        this.JobemploymenttypeDetails = data as IJobtype[]
      },
      error: (reason: any) => {
        console.log(reason);
      }
    })
  }

  //function to get all experiences 
  getexperiencedetails() {
    let EmployeeId = parseInt(this.prosempdata.employeeId)
    this.subscription = this.http.getData(`PreonboardingExperience/${EmployeeId}`).subscribe({
      next: (data: any) => {
        this.getempexpdata = data;
      },
      error: (err: any) => {
        console.log(err);
        if (err.status = 401) {
          this.http.logOut();
        }
      }
    })
  }

  onSelectDownload(file: any) {
    this.subscription = this.http.DownloadDataWithQuery('PreonboardingFilesystem/Downloadfile', file).subscribe({
      next: (res: any) => {
        let blob: Blob = res.body as Blob;
        let a = document.createElement('a')
        a.href = window.URL.createObjectURL(blob)
        let filename = file.split('/')[file.split('/').length - 1];
        a.download = filename
        a.click()
      },
      error: reason => console.log(reason)
    })
  }


  //function to delete the data
  deleteExperienceDetails(item: any) {
    this.subscription = this.http.getData(`PreonboardingExperience/Deletebyid/${item.id}`).subscribe({
      next: (data: any) => {
        console.log(data);
      },
      error: (err: any) => {
        console.log(err);
      },
    })
  }

  AllJobRoles: any;//array to store all the jobroles
  getJobrole() {
    this.subscription = this.http.getData("PreonboardingJobRole").subscribe({
      next: (data: any) => {
        console.log(data);
        this.JobroleDetails = data as IRole[];
        this.AllJobRoles = this.JobroleDetails.map(item => item.jobRole1)
      }
    })
  }

  //function to get all employees from employeedata
  getAllemployees() {
    let employeeId = parseInt(this.prosempdata.employeeId);
    console.log(employeeId)
    this.subscription = this.http.getData(`PreonboardingEmployeedata/${employeeId}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.toatlexp = data as Ipersonal;
      },
      error: reason => console.log(reason)
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}