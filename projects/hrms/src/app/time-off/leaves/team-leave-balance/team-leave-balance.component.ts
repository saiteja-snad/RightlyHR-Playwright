import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Select } from 'primeng/select';
import { LeavesApprovaltabsComponent } from "../../../shared/time-off-module-tabs/leaves-approvaltabs/leaves-approvaltabs.component";
import { AccordionModule } from 'primeng/accordion';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';

@Component({
  selector: 'app-team-leave-balance',
  imports: [CommonModule, Select, LeavesApprovaltabsComponent,AccordionModule],
  templateUrl: './team-leave-balance.component.html',
  styleUrl: './team-leave-balance.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class TeamLeaveBalanceComponent implements OnInit, OnDestroy{
  teamLeaveBalance: any; 
  loggedInUser: any;
  selectedYear: number | undefined;
  destroy$: Subject<boolean> = new Subject<boolean>();

  years = [
    { label: (new Date().getFullYear() - 1).toString(), value: new Date().getFullYear() - 1 },
    { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    { label: (new Date().getFullYear() + 1).toString(), value: new Date().getFullYear() + 1 }
  ];  

  constructor(
    private http: HttpService,
  ) { }

  ngOnInit(): void {
   this.loggedInUser = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
   this.getAllTeamLeaveBalance();
  }

  onSelectYear(event: any) {
    this.selectedYear = event.value;
    this.getAllTeamLeaveBalance();
  }

  getAllTeamLeaveBalance() {
    const employeeId = this.loggedInUser.employeeId;
    let url = `LeaveEntitlements/team-leave-entitlements/${employeeId}`;
  
    if (this.selectedYear) {
      url += `?year=${this.selectedYear}`;
    }
  
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res) => {
        this.teamLeaveBalance = res;
        console.log(this.teamLeaveBalance);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }  
  
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
