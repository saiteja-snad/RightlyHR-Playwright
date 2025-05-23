import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddProspectiveEmployeeComponent } from './add-prospective-employee/add-prospective-employee.component';
import { FormsModule } from '@angular/forms';
import { HttpService } from '../../services/http.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Iprospective } from './Prospective-model';
import { TranslateModule } from '@ngx-translate/core';
import { ProspectivePipe } from '../../Pipes/prospective.pipe';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import { RbacService } from '../../services/rbac.service';
import { AccessNavigationService } from '../../services/access-navigation.service';
@Component({
  selector: 'app-prospective-employees',
  imports: [CommonModule, FormsModule, ProspectivePipe, TranslateModule, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './prospective-employees.component.html',
  styleUrl: './prospective-employees.component.scss'
})

export class ProspectiveEmployeesComponent implements OnInit {
  Prospective = new BehaviorSubject<Iprospective[]>([]);
  searchValue: any;
  subscription!: Subscription;
  jobLocationDropDownData = {} as any;
  emp = {} as any;
  loader = false;

  constructor(private router: Router, private http: HttpService, public rbac: RbacService, private modalService: NgbModal,private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empdata();
    this.jobLocationList();
    this.http.activeTabSubject.subscribe((selectedObj) => {
      this.empdata();
    });
  }

  empdata() {
    this.loader = true;
    this.subscription = this.http.getData(`Employeedata/ProspectiveEmployees`).subscribe({
      next: (data: any) => {
        this.Prospective.next(data);
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

  openAddProspective() {
    this.modalService.open(AddProspectiveEmployeeComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }

  select(act: any) {
    this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
    console.log("act",act)
    // this.router.navigate(['/personalinfo']);
    this.goToAccessibleRoute('/personalinfo')
  }

      goToAccessibleRoute(actualRoute: string) {
    const route = this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
    if (route) {
      this.router.navigate([route]);
    }else {
      this.router.navigate(['/unauthorized']);
    }
  }
}