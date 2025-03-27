import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { Iinactivetrainee } from './inactive-trainee-mod';
import { ActiveEmployeePipe } from "../../Pipes/active-employee.pipe";
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inactive-interns',
  imports: [CommonModule, ActiveEmployeePipe,TranslateModule,FormsModule],
  templateUrl: './inactive-interns.component.html',
  styleUrl: './inactive-interns.component.scss'
})
export class InactiveInternsComponent {
  subscription!: Subscription;
  InActiveTrainee=[] as any;
  emp={} as any;
  searchValue: any;
  constructor(private router: Router,    private http: HttpService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.empdata('Trainee Inactive');
  }
//function for inactive employees
empdata(status:string) {
  this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
    next: (data: any) => {
      console.log(data);

   this.InActiveTrainee = data as Iinactivetrainee[];


    },

    error: (reason: any) => console.log(reason)
  });

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
