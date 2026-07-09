import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { TeamMembersTabsComponent } from "../../../../shared/personalinfo-tabs/team-members-tabs/team-members-tabs.component";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { MyInfoTeamNumbersTabComponent } from "../../../../shared/myinfo-tabs/my-info-team-numbers-tab/my-info-team-numbers-tab.component";
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { Table, TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';
import { TreeTableModule } from 'primeng/treetable';
import { FormsModule } from '@angular/forms';
import { MyteamsearchPipe } from '../../../../Pipes/myteamsearch.pipe';
import { AccessNavigationService } from '../../../../services/access-navigation.service';
@Component({
  selector: 'app-my-team-members',
  imports: [TeamMembersTabsComponent, MyteamsearchPipe, CommonModule, FormsModule, NoDataFoundComponent, MyInfoTeamNumbersTabComponent, CommonModule,
    TranslateModule, TableModule, ChipModule, SkeletonModule, TreeTableModule],
  templateUrl: './my-team-members.component.html',
  styleUrl: './my-team-members.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class MyTeamMembersComponent {
  teamData: any;
  empinfo = {} as any;
  searchValue: any;
  resourceDetails: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  clientId: any;
  projectId: any;
  contentLoader = false;
  employeeName: any;
  selectedEntries: any;
  selectedProject: any;
  teamMemberData: any[] = [];
  emp: any;
  currentSortField: string = '';
  currentSortOrder: number = 0;
  originalData:any;
  @ViewChild('dt') table!: Table;
  constructor(public modalService: NgbModal, public readonly router: Router, private http: HttpService, private accessNav: AccessNavigationService) { }

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
         this.originalData = [...this.teamMemberData];
        this.contentLoader = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.contentLoader = false;
        this.teamData = [];
      }
    });
  }

  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }

  isMyTeamRoute(): boolean {
    return this.router.url === '/personalinfo/job/team/my-team-members';
  }

  mapToTreeNodes(data: any[]): any[] {
    return data.map(item => ({
      data: {
        fusionEmpId: item.fusionEmpId ?? '-',
        fullName: `${item.firstName ?? ''} ${item.middleName ?? ''} ${item.lastName ?? ''}`.trim(),
        workEmail: item.workEmail ?? '-',
        contact: `${item.mobilePhoneCountryCode ?? ''} ${item.contactnumber ?? '-'}`.trim(),
        isAccess: item.isAccess ?? false,
        employeeId: item.employeeId
      },
      children: item.childrenCount > 0 ? this.mapToTreeNodes(item.children) : []
    }));
  }

  select(act: any) {
    const fullPath = this.router.url;
    if (fullPath.startsWith('/myinfo')) {
      this.emp = localStorage.setItem('personaldata', JSON.stringify(act));
      this.goToAccessibleRoute('/personalinfo');
    }
  }

  goToAccessibleRoute(actualRoute: string) {
    const route = this.accessNav.navigateToAccessedHeaderRoute(actualRoute);
    if (route) {
      this.router.navigate([route]);
    } else {
      this.router.navigate(['/unauthorized']);
    }
  }

  onCollapse(event: any) {
    const node = event.node;
    this.collapseChildren(node);
  }

  collapseChildren(node: any) {
    if (node.children && node.children.length > 0) {
      node.children.forEach((child: any) => {
        child.expanded = false;        // collapse child
        this.collapseChildren(child);  // recursively collapse grandchildren
      });
    }
  }

  customSort(field: string): void {
    if (this.currentSortField === field) {
      if (this.currentSortOrder === 1) {
        this.currentSortOrder = -1;
      } else if (this.currentSortOrder === -1) {
        this.currentSortField = '';
        this.currentSortOrder = 0;
         if (this.table) this.table.reset();
        this.teamMemberData = this.mapToTreeNodes(this.teamData);
        return;
      } else {
        this.currentSortOrder = 1;
      }
    } else {
      this.currentSortField = field;
      this.currentSortOrder = 1;
    }
    this.teamMemberData = this.sortTreeNodes([...this.teamMemberData], field, this.currentSortOrder);
  }

  private sortTreeNodes(nodes: any[], field: string, order: number): any[] {
    return nodes
      .sort((a, b) => {
        const val1 = String(a.data[field] ?? '').trim();
        const val2 = String(b.data[field] ?? '').trim();
        return order * val1.localeCompare(val2, undefined, { sensitivity: 'base' });
      })
      .map(node => ({
        ...node,
        children: node.children?.length ? this.sortTreeNodes([...node.children], field, order) : []
      }));
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}