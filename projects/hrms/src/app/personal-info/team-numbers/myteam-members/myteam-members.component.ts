import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { HttpService } from '../../../services/http.service';
import { Subscription } from 'rxjs';
import { Iteammembers } from '../../../Interfaces/members-model';
import { SearchfilterPipe } from "../../../Pipes/searchfilter.pipe";
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccessNavigationService } from '../../../services/access-navigation.service';

@Component({
  selector: 'app-myteam-members',
  imports: [CommonModule, NoDataFoundComponent, SearchfilterPipe, FormsModule],
  templateUrl: './myteam-members.component.html',
  styleUrl: './myteam-members.component.scss'
})
export class MyteamMembersComponent implements OnInit, OnDestroy {
  empinfo: any
  subscription!: Subscription;
  searchValue = ''
  emp: any = {}
  teamMemberArray: Iteammembers[] = [];
  constructor(private http: HttpService, private router: Router, private accessNav: AccessNavigationService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
    this.getAllTeammembersList()

  }

  getAllTeammembersList() {
    const EmployeeId = this.empinfo.employeeId;
    this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe(
      (responseData: any) => {
        const filteredData = (responseData as Iteammembers[]).filter(member => member['isAccess'] === true);
        this.teamMemberArray = filteredData;
      },
      error => {
        console.error(error);
      }
    );
  }

  select(act: any) {
    console.log(act)
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

}
