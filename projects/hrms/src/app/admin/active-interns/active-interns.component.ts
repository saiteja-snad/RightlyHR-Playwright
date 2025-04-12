import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { ITrainee } from './active-interns-modules';
import { ActiveEmployeePipe } from "../../pipes/active-employee.pipe";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-active-interns',
  imports: [CommonModule, TranslateModule, ActiveEmployeePipe, FormsModule],
  templateUrl: './active-interns.component.html',
  styleUrl: './active-interns.component.scss'
})

export class ActiveInternsComponent {
  searchValue: any;
  subscription!: Subscription;
  emp = {} as any;
  TraineeActive = [] as any;
  constructor(private router: Router, private http: HttpService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.empdata('Trainee Active');
  }

  //function for active Employees
  empdata(status: string) {
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
      next: (data: any) => {
        console.log(data);
        this.TraineeActive = data as ITrainee[];
      },
      error: (reason: any) => console.log(reason)
    });
  }

  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    console.log(this.emp);
    this.router.navigate(['/personalinfo']);
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}
