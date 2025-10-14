import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ProspectivePipe } from '../../Pipes/prospective.pipe';
import { AccessNavigationService } from '../../services/access-navigation.service';
import { HttpService } from '../../services/http.service';
import { RbacService } from '../../services/rbac.service';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { Iprospective } from '../prospective-employees/Prospective-model';

@Component({
  selector: 'app-contract-employee',
  imports: [CommonModule, FormsModule, ProspectivePipe, TranslateModule, NoDataFoundComponent, DataLoaderContentComponent, NgbPopoverModule],
  templateUrl: './contract-employee.component.html',
  styleUrl: './contract-employee.component.scss'
})
export class ContractEmployeeComponent {
  moduleinfo: string = '';
  contract = new BehaviorSubject<Iprospective[]>([]);
  searchValue: any;
  subscription!: Subscription;
  jobLocationDropDownData = {} as any;
  emp = {} as any;
  loader = false;

  constructor(private router: Router, private http: HttpService, public rbac: RbacService, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empdata();
    this.jobLocationList();
    this.http.activeTabSubject.subscribe((selectedObj) => {
      this.empdata();
    });
  }

  empdata() {
    this.loader = true;
    const status='Prospective Contract'
    this.subscription = this.http.getData(`Employeedata/TraineeActiveEmployees/${status}`).subscribe({
      next: (data: any) => {
        this.contract.next(data);
        this.loader = false;
      },
      error: (reason: any) => console.log(reason),
    });
  }

  jobLocationList() {
    this.subscription = this.http.getData(`JobLocation/getAllLocations`).subscribe({
      next: (data: any) => {
        this.jobLocationDropDownData = data;
      },
    });
  }

  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    // this.router.navigate(['/personalinfo']);
    this.goToAccessibleRoute('/personalinfo')
  }

  goToAccessibleRoute(actualRoute: string) {
    const route = this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
    if (route) {
      this.router.navigate([route]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }
}
