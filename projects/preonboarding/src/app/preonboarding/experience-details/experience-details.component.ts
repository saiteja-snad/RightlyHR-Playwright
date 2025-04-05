import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpService } from '../../http-services/http.service';
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
  getempexpdata = [] as any;
  prosempdata = {} as any;
  ExperienceDetails !: File;

  constructor(private http: HttpService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.prosempdata = JSON.parse(localStorage.getItem("prospectiveemppersonaldata") || '{}');
    this.getexperiencedetails();
  }

  openExperience() {
    this.modalService.open(AddExperienceDetailtsComponent, { centered: true, backdrop: 'static', size: 'lg' });
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
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        let filename = file.split('/')[file.split('/').length - 1];
        a.download = filename;
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}