import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DocumentHistoryLayoutComponent } from '../document-history/document-history-layout/document-history-layout.component';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../services/rbac.service';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, DocumentHistoryLayoutComponent, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})

export class DashboardComponent {
  subscription!: Subscription;
  Inactive!: number;
  ACTDATA!: number;
  Active!: number;
  Trainee!: number;
  traineeactive!: number;
  traineeInactive!: number;
  PROBDATA!: number;
  active = 'Active';
  activeCount: number = 0;
  jobdata = {} as any;
  filtredActivedata = {} as any;
  filteredTabs: any[] = [];
  trackByFn(index: number, item: any): number {
    return index;
  }
  cardItems: any[] = [];

  constructor(private router: Router, private http: HttpService, private cdr: ChangeDetectorRef, 
    public rbac: RbacService) { }

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.empdata();
    this.activeEmpData();
    this.InActiveEmpData();
    this.empdataTrainee();
    this.empdataTraineeActive('Trainee Active');
    this.empdataTraineeInActive('Trainee Inactive');
    this.getjobList();
    this.probationemployees();
  }

  //function for prospective employee
  empdata() {
    this.subscription = this.http.getData(`Employeedata/ProspectiveEmployees`).subscribe({
      next: (data: any) => {
        this.ACTDATA = data.length;
        this.updateCardItems();
      },
      error: (reason) => console.log(reason),
    });
  }

  //   function for active Employees
  activeEmpData() {
    this.subscription = this.http.getData(`Employeedata/ActiveEmployees`).subscribe({
      next: (data: any) => {
        this.Active = data.length;
        this.updateCardItems();
      },
      error: (reason) => console.log(reason),
    });
  }

  // function for Inactive Employees
  InActiveEmpData() {
    this.subscription = this.http.getData(`Employeedata/InactiveEmployees`).subscribe({
      next: (data: any) => {
        this.Inactive = data.length;
        this.updateCardItems();
      },
      error: (reason) => console.log(reason),
    });
  }

  //  function for prospective employee
  empdataTrainee() {
    this.subscription = this.http.getData(`Employeedata/TrainingEmployees`).subscribe({
      next: (data: any) => {
        let actdat = data.filter((ele: any) => {
          if (ele.empstatus === 'Trainee Prospective') {
            return ele;
          }
        });
        this.Trainee = actdat.length;
        this.updateCardItems();
      },
      error: (reason) => console.log(reason),
    });
  }

  //  function for Active Trainee employee
  empdataTraineeActive(status: string) {
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
      next: (data: any) => {
        this.traineeactive = data.length;
        this.updateCardItems();
      },
      error: (reason: any) => console.log(reason),
    });
  }

  //  function for InActive Trainee employee
  empdataTraineeInActive(status: string) {
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
      next: (data: any) => {
        this.traineeInactive = data.length;
        this.updateCardItems();
      },
      error: (reason: any) => console.log(reason),
    });
  }

  // function to get getjobList Current Openings
  getjobList() {
    this.subscription = this.http.getData(`JobPosting`).subscribe({
      next: (data: any) => {
        this.jobdata = data;
        this.filtredActivedata = this.filterJobsByStatus(this.active).reverse();
        this.activeCount = this.getStatusCount(this.active);
        this.updateCardItems();
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  filterJobsByStatus(status: string): any[] {
    return this.jobdata.filter(
      (job: { status: string }) => job.status === status
    );
  }

  getStatusCount(status: string): number {
    return this.jobdata.reduce((count: number, job: { status: string }) => {
      if (job.status === status) {
        return count + 1;
      }
      return count;
    }, 0);
  }

  probationemployees() {
    this.subscription = this.http.getData(`ProbationFlow/getProbationEmployeesStatus`).subscribe({
      next: (data: any) => {
        this.PROBDATA = data.length;
        this.updateCardItems();
      },
      error: (reason) => console.log(reason),
    });
  }

  generateDocument() {
    this.router.navigate(['/admin/letters/offer-letter']);
  }

  updateCardItems() {
    this.cardItems = [
      {
        label: 'Prospective Employees',
        link: '/admin/prospective-employees',
        count: this.ACTDATA,
        backgroundColor: '#E1E8FE',
        profileColor: '#06274F', permission: { feature: 'Dashboard Prospective Employees Card', action: 'view' }
      },
      {
        label: 'Active Employees',
        link: '/admin/active-employees',
        count: this.Active,
        backgroundColor: '#FEEFE1',
        profileColor: '#A95200', permission: { feature: 'Dashboard Active Employees Card', action: 'view' }
      },
      {
        label: 'Inactive Employees',
        link: '/admin/inactive-employees',
        count: this.Inactive,
        backgroundColor: '#E1FEF4',
        profileColor: '#2B8D6B', permission: { feature: 'Dashboard Inactive Employees Card', action: 'view' }
      },
      {
        label: 'Prospective Trainees',
        link: '/admin/prospective-interns',
        count: this.Trainee,
        backgroundColor: '#FEE1F7',
        profileColor: '#95267A', permission: { feature: 'Dashboard Prospective Trainee Card', action: 'view' }
      },
      {
        label: 'Active Trainees',
        link: '/admin/active-interns',
        count: this.traineeactive,
        backgroundColor: '#FEE7E1',
        profileColor: '#994530', permission: { feature: 'Dashboard Active Trainees Card', action: 'view' }
      },
      {
        label: 'Inactive Trainees',
        link: '/admin/inactive-interns',
        count: this.traineeInactive,
        backgroundColor: '#FEE1F1',
        profileColor: '#760C46', permission: { feature: 'Dashboard Inactive Trainees Card', action: 'view' }
      },
      {
        label: 'Current Openings',
        link: '/admin/timeoff',
        count: this.activeCount,
        backgroundColor: '#FEEFE1',
        profileColor: '#A95200', permission: { feature: 'Dashboard Current Openings Card', action: 'view' }
      },
      {
        label: 'Probation Employees',
        link: '/admin/probation-employees',
        count: this.PROBDATA,
        backgroundColor: '#E1FEE1',
        profileColor: '#0A850A', permission: { feature: 'Dashboard Probation Employees Card', action: 'view' }
      },
    ];
    this.filterTabsByRbac();
    this.cdr.detectChanges();
  }

  filterTabsByRbac(): void {
    this.cardItems = this.cardItems.filter(tab => {
      if (!tab.permission) return true;

      const { feature, action } = tab.permission;
      const permissionString = `${feature}.${action}`;
      return this.rbac.allowedToAccess(permissionString);
    });
  }
}