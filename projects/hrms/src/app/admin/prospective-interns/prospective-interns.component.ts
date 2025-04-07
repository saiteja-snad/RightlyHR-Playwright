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
import { FormsModule } from '@angular/forms';

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
  jobLocationDropDownData = {} as any;
  emp={} as any;
  constructor(private router: Router,private http: HttpService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.empdata();
    this.jobLocationList();
      this.http.activeTabSubject
      .subscribe((selectedObj) => {
        console.log('Received designation from child via Observable:', selectedObj);
        this.empdata();
      });
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
    this.modalService.open(AddProspectiveInternComponent, { centered: true, backdrop: 'static', size:'lg' });
  }
  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    console.log(this.emp);

    this.router.navigate(['/personalinfo']);
  }
}
