import { Component } from '@angular/core';
import { TeamMembersTabsComponent } from "../../../../shared/personalinfo-tabs/team-members-tabs/team-members-tabs.component";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { MyInfoTeamNumbersTabComponent } from "../../../../shared/myinfo-tabs/my-info-team-numbers-tab/my-info-team-numbers-tab.component";
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { DateformatPipe } from "../../../../Pipes/dateformat.pipe";
import { SkeletonModule } from 'primeng/skeleton';

@Component({
  selector: 'app-my-team-members',
  imports: [TeamMembersTabsComponent, NoDataFoundComponent, MyInfoTeamNumbersTabComponent,CommonModule, AccordionModule, PaginatorModule, TranslateModule, TableModule, ChipModule,
      DateformatPipe, NoDataFoundComponent, SkeletonModule],
  templateUrl: './my-team-members.component.html',
  styleUrl: './my-team-members.component.scss'
})
export class MyTeamMembersComponent {

  // contentLoader = false;
  // constructor(private router: Router) { }
  isActive(route: string): boolean {
    return this.router.url.includes(route);
  }
  teamData: any;
  empinfo = {} as any;
  resourceDetails: any;
  destroy$: Subject<boolean> = new Subject<boolean>();
  clientId: any;
  projectId: any;
  contentLoader = false;

  employeeName: any
  selectedEntries: any
  selectedProject: any
  constructor(public modalService: NgbModal, public readonly router: Router, private http: HttpService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getEmpInfoFromRoute();
  }

  getEmpInfoFromRoute(): void {
    const fullPath = this.router.url;
    console.log('Full path:', fullPath);

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
        this.contentLoader = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.contentLoader = false;
        this.teamData = [];
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
