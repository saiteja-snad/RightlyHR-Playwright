import { Component, ViewEncapsulation } from '@angular/core';
import { TeamMembersTabsComponent } from "../../../../shared/personalinfo-tabs/team-members-tabs/team-members-tabs.component";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { MyInfoTeamNumbersTabComponent } from "../../../../shared/myinfo-tabs/my-info-team-numbers-tab/my-info-team-numbers-tab.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';
import { TreeTableModule } from 'primeng/treetable';
import { FormsModule } from '@angular/forms';
import { MyteamsearchPipe } from '../../../../Pipes/myteamsearch.pipe';
@Component({
  selector: 'app-my-team-members',
  imports: [TeamMembersTabsComponent, MyteamsearchPipe, CommonModule, FormsModule,NoDataFoundComponent, MyInfoTeamNumbersTabComponent, CommonModule,
    TranslateModule, TableModule, ChipModule, SkeletonModule, TreeTableModule],
  templateUrl: './my-team-members.component.html',
  styleUrl: './my-team-members.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class MyTeamMembersComponent {
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
  teamData: any;
  empinfo = {} as any;
  searchValue:any;
  resourceDetails: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  clientId: any;
  projectId: any;
  contentLoader = false;
  employeeName: any;
  selectedEntries: any;
  selectedProject: any;
  teamMemberData: any[] = [];

  constructor(public modalService: NgbModal, public readonly router: Router, private http: HttpService) { }

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
  }

  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/personalinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("personaldata") || '{}');
      this.getResourceDetails();
    } else if (fullPath.startsWith('/myinfo')) {
      this.empinfo = JSON.parse(localStorage.getItem("rightlyHrUser") || '{}');
      this.getResourceDetails();
    }
  }

  getResourceDetails(): void {
    let url = `v2/Employeedata/GetReporteesAndTeamMembersReportees/${this.empinfo.employeeId}`;
    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        this.teamData = res;
        this.teamMemberData = this.mapToTreeNodes(this.teamData);
        this.contentLoader = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.contentLoader = false;
        this.teamData = [];
      }
    });
  }

  mapToTreeNodes(data: any[]): any[] {
    return data.map(item => ({
      data: {
        fusionEmpId: item.fusionEmpId ?? '-',
        fullName: `${item.firstName ?? ''} ${item.middleName ?? ''} ${item.lastName ?? ''}`.trim(),
        workEmail: item.workEmail ?? '-',
        contact: `${item.mobilePhoneCountryCode ?? ''} ${item.contactnumber ?? '-'}`.trim()
      },
      children: item.childrenCount > 0 ? this.mapToTreeNodes(item.children) : []
    }));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}