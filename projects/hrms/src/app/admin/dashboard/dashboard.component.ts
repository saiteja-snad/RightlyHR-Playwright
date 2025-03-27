
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, TrackByFunction } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { DocumentHistoryLayoutComponent } from "../document-history/document-history-layout/document-history-layout.component";
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, DocumentHistoryLayoutComponent, TranslateModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
 })

  export class DashboardComponent {
    subscription!: Subscription;
    actemployees = [] as any[];
    Inactiveemp = [] as any;
    Inactive!: number;
    ACTDATA!: number;
    activeemp = [] as any[];
    Active!: number;
    Trainee!: number;
    TraineeActive = [] as any[];
    traineeactive!: number;
    TraineeInactive = [] as any[];
    traineeInactive!: number;
    PROBDATA!: number;
    probemployees = [] as any;
    active = 'Active';
    activeCount: number = 0;
    jobdata = {} as any;
    filtredActivedata = {} as any;
	 trackByFn(index: number, item: any): number {
    return index;
  }
   constructor(private router: Router, private http: HttpService,private cdr: ChangeDetectorRef) {
    }
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
      this.subscription = this.http
        .getData(`Employeedata/ProspectiveEmployees`)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.actemployees = data;
            console.log(this.actemployees);
            let actdat = data.filter((ele: any) => {
              if (ele.empstatus === 'Prospective') {
                return ele;
              }
            });
            console.log(actdat);
            this.ACTDATA = actdat.length;         
            console.log(this.ACTDATA);
			     this.updateCardItems();
          },

          error: (reason) => console.log(reason),
        });
    }
  //   function for active Employees
    activeEmpData() {
      this.subscription = this.http
        .getData(`Employeedata/ActiveEmployees`)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.activeemp = data;
            console.log(this.activeemp);
            let activedat = data.filter((ele: any) => {
              if (ele.empstatus === 'Active') {
                return ele;
              }
            });
            console.log(activedat);

            this.Active = activedat.length;
            console.log(this.Active);
			this.updateCardItems();
          },

          error: (reason) => console.log(reason),
        });
    }
    // function for Inactive Employees
    InActiveEmpData() {
      this.subscription = this.http
        .getData(`Employeedata/InactiveEmployees`)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.Inactiveemp = data;
            console.log(this.Inactiveemp);
            let actdata = data.filter((ele: any) => {
              if (ele.empstatus === 'Inactive') {
                return ele;
              }
            });
            console.log(actdata);
            this.Inactive = actdata.length;
            console.log(this.Inactive);
			this.updateCardItems();
          },

          error: (reason) => console.log(reason),
        });
    }
   //  function for prospective employee
    empdataTrainee() {
      this.subscription = this.http
        .getData(`Employeedata/TrainingEmployees`)
        .subscribe({
          next: (data: any) => {
            console.log(data);
            this.actemployees = data;
            console.log(this.actemployees);
            let actdat = data.filter((ele: any) => {
              if (ele.empstatus === 'Trainee Prospective') {
                return ele;
              }
            });
            console.log(actdat);
            this.Trainee = actdat.length;
            console.log(this.Trainee);
			this.updateCardItems();
          },

          error: (reason) => console.log(reason),
        });
    }
   //  function for Active Trainee employee
    empdataTraineeActive(status: string) {
      this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
        next: (data: any) => {
          console.log(data);
          this.TraineeActive = data;
          let actdat = data.filter((ele: any) => {
            if (ele.empstatus === 'Trainee Active') {
              return ele;
            }
          });
          console.log(actdat);

          this.traineeactive = actdat.length;
          console.log(this.traineeactive);
		  this.updateCardItems();
        },


        error: (reason: any) => console.log(reason)
      });

    }
   //  function for InActive Trainee employee 
    empdataTraineeInActive(status: string) {
      this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
        next: (data: any) => {
          console.log(data);
          this.TraineeInactive = data;
          let actdat = data.filter((ele: any) => {
            if (ele.empstatus === 'Trainee Inactive') {
              return ele;
            }
          });
          console.log(actdat);

          this.traineeInactive = actdat.length;
          console.log(this.traineeInactive);
		  this.updateCardItems();
        },
        error: (reason: any) => console.log(reason)
      });

    }
    // function to get getjobList Current Openings
    getjobList() {
      this.subscription = this.http.getData(`JobPosting`).subscribe({
        next: (data: any) => {
          console.log(data);
          this.jobdata = data;
          console.log(this.jobdata);
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
          console.log(data);
          this.probemployees = data;
          console.log(this.probemployees);
          let actdat = data.filter((ele: any) => {
            if (ele.empstatus === 'Active') {
              return ele;
            }
          });
          console.log(actdat);
          this.PROBDATA = data.length
          console.log(this.PROBDATA);
		  this.updateCardItems();
        },
        error: (reason) => console.log(reason),
      })
    }
    generateDocument() {
      this.router.navigate(['/admin/letters/offer-letter'])
    }
     updateCardItems() {
    this.cardItems = [
      { label: 'Prospective Employees', link: '/admin/prospective-employees', count: this.ACTDATA, backgroundColor: '#E1E8FE', profileColor: '#06274F' },
      { label: 'Active Employees', link: '/admin/active-employees', count: this.Active, backgroundColor: '#FEEFE1', profileColor: '#A95200' },
      { label: 'Inactive Employees', link: '/admin/inactive-employees', count: this.Inactive, backgroundColor: '#E1FEF4', profileColor: '#2B8D6B' },
      { label: 'Prospective Interns', link: '/admin/prospective-interns', count: this.Trainee, backgroundColor: '#FEE1F7', profileColor: '#95267A' },
      { label: 'Active Interns', link: '/admin/active-interns', count: this.traineeactive, backgroundColor: '#FEE7E1', profileColor: '#994530' },
      { label: 'Inactive Interns', link: '/admin/inactive-interns', count: this.traineeInactive, backgroundColor: '#FEE1F1', profileColor: '#760C46' },
      { label: 'Current Openings', link: '/admin/timeoff', count: this.activeCount, backgroundColor: '#FEEFE1', profileColor: '#A95200' },
      { label: 'Probation Employees', link: '/admin/probation-employees', count: this.PROBDATA, backgroundColor: '#E1FEE1', profileColor: '#0A850A' },
    ];
    this.cdr.detectChanges();
  }
   cardItems: any[] = [];

  }


