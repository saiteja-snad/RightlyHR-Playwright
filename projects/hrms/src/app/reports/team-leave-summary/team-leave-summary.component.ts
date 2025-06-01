import { Component, OnDestroy, OnInit } from '@angular/core';
import { LeavesApprovaltabsComponent } from '../../shared/time-off-module-tabs/leaves-approvaltabs/leaves-approvaltabs.component';
import { CommonModule } from '@angular/common';
import { Select } from 'primeng/select';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { FormsModule } from '@angular/forms';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { ModuleInformationComponent } from '../../shared/module-information/module-information.component';
import { ITeamLeaveSummary } from '../../time-off/leaves/leaves.model';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { filter, Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { NavigationEnd, Router } from '@angular/router';
import { MODULE_INFOS } from '../../shared/modules-info';


@Component({
  selector: 'app-team-leave-summary',
  imports: [LeavesApprovaltabsComponent, CommonModule, Select, DataLoaderContentComponent, NoDataFoundComponent, FormsModule, DateformatPipe, ModuleInformationComponent,NgbPopoverModule],
  templateUrl: './team-leave-summary.component.html',
  styleUrl: './team-leave-summary.component.scss'
})

export class TeamLeaveSummaryComponent {
  moduleinfo : string = '';
  teamLeaveSummary: ITeamLeaveSummary[] = [];
  loggedInUser: any;
  selectedYear: number | undefined;
  activeIndex: number = 0;
  dataload = false;
  popupData: any[] = [];
  popupType: string = '';
  selectedMonth: any;
  searchText: string = '';
  filteredTeamLeaveSummary: any[] = [];
  selectedEmployee: any;

  destroy$: Subject<boolean> = new Subject<boolean>();
  // year
  years = [
    { label: (new Date().getFullYear() - 1).toString(), value: new Date().getFullYear() - 1 },
    { label: new Date().getFullYear().toString(), value: new Date().getFullYear() },
    { label: (new Date().getFullYear() + 1).toString(), value: new Date().getFullYear() + 1 }
  ];
  // Months
  monthOptions = [
    { name: 'January', value: 1 },
    { name: 'February', value: 2 },
    { name: 'March', value: 3 },
    { name: 'April', value: 4 },
    { name: 'May', value: 5 },
    { name: 'June', value: 6 },
    { name: 'July', value: 7 },
    { name: 'August', value: 8 },
    { name: 'September', value: 9 },
    { name: 'October', value: 10 },
    { name: 'November', value: 11 },
    { name: 'December', value: 12 },
  ];

  readonly DISPLAY_LABEL_MAP: Record<string, string> = {
    'leaves': 'Leave(s)',
    'wfh': 'WFH',
    'permissions': 'Permission(s)',
    'regularization': 'Regularization'
  };

  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    public readonly router: Router
  ) { }

  ngOnInit(): void {
    this.loggedInUser = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    const currentDate = new Date();
    this.selectedMonth = currentDate.getMonth() + 1;
    this.selectedYear = currentDate.getFullYear();
    this.getAllTeamLeaveSummary();
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo(){
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
  
    const routeToInfoMap: { [key: string]: string } = {
      '/time-off/leaves/team-leave-summary': MODULE_INFOS.TIME_OFF_LEAVES_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  getAllTeamLeaveSummary() {
    this.dataload = true;
    const employeeId = this.loggedInUser.employeeId;
    let url = `Employeedata/v1/getreportessdata?employeeId=${employeeId}`;
    if (this.selectedYear) {
      url += `&year=${this.selectedYear}`;
    }
    if (this.selectedMonth) {
      url += `&month=${this.selectedMonth}`;
    }
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.teamLeaveSummary = res;
        this.filteredTeamLeaveSummary = res;
      },
      error: (err) => {
        this.dataload = false;
        this.teamLeaveSummary = [];
      },
      complete: () => {
        this.dataload = false;
      }
    });
  }

  filterTeamLeaveSummary() {
    const term = this.searchText.trim().toLowerCase();
    if (!term) {
      this.filteredTeamLeaveSummary = this.teamLeaveSummary;
      return;
    }
    this.filteredTeamLeaveSummary = this.teamLeaveSummary.filter(item => {
      const name = item.employeeName?.toLowerCase() || '';
      const fusionId = item.fusionEmpId?.toLowerCase() || '';
      return name.includes(term) || fusionId.includes(term);
    });
  }

  onSelectYear(event: any) {
    this.selectedYear = event.value;
    this.getAllTeamLeaveSummary();
  }

  onSelectMonth(event: any) {
    this.selectedMonth = event.value;
    this.getAllTeamLeaveSummary();
  }

  openPopup(content: any, employee: any, type: 'leaves' | 'wfh' | 'permissions' | 'regularization') {
    this.selectedEmployee = employee;
    const actualKey = this.DISPLAY_LABEL_MAP[type];
    this.popupData = employee[type] || [];
    this.popupType = actualKey; 
    this.openModal(content);
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true, backdrop: 'static', size: 'lg' });
  }

  calculateDuration(entries: any[]): number {
    if (!entries || !Array.isArray(entries)) return 0;
    return entries.reduce((sum, item) => sum + parseFloat(item.duration || 0), 0);
  }
    navigation() {
    this.router.navigate(['/reports']);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
