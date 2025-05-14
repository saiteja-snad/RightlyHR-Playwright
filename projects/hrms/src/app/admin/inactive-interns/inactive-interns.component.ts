import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { HttpService } from '../../services/http.service';
import { Subscription } from 'rxjs';
import { Iinactivetrainee } from './inactive-trainee-mod';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { ActiveEmployeePipe } from '../../Pipes/active-employee.pipe';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-inactive-interns',
  imports: [CommonModule, ActiveEmployeePipe, TranslateModule, FormsModule, DataLoaderContentComponent, NoDataFoundComponent],
  templateUrl: './inactive-interns.component.html',
  styleUrl: './inactive-interns.component.scss'
})

export class InactiveInternsComponent {
  subscription!: Subscription;
  InActiveTrainee = [] as any;
  emp = {} as any;
  searchValue: any;
  loader = false;

  constructor(private router: Router, private http: HttpService, private modalService: NgbModal,private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empdata('Trainee Inactive');
  }

  //function for inactive employees
  empdata(status: string) {
    this.loader = true;
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
      next: (data: any) => {
        this.InActiveTrainee = data as Iinactivetrainee[];
        this.loader = false;
      },
      error: (reason: any) => console.log(reason)
    });
  }

  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    // this.router.navigate(['/personalinfo']);
     this.goToAccessibleRoute('/personalinfo');
  }
 goToAccessibleRoute(actualRoute: string) {
    const route = this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
    if (route) {
      this.router.navigate([route]);
    }else {
      this.router.navigate(['/unauthorized']);
    }
  }

  isActiveRoute(link: string): boolean {
    return this.router.url.includes(link);
  }
  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}