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

@Component({
  selector: 'app-prospective-interns',
  imports: [CommonModule, TranslateModule, ActiveEmployeePipe],
  templateUrl: './prospective-interns.component.html',
  styleUrl: './prospective-interns.component.scss'
})
export class ProspectiveInternsComponent {
  subscription!: Subscription;
  searchValue: any;
  Trainee =[] as any;
  emp={} as any;
  constructor(private router: Router,private http: HttpService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.empdata();
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
}
