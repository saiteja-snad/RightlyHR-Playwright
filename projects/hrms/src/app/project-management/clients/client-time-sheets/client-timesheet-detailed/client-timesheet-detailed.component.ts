import { Component, ViewEncapsulation } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AccordionModule } from 'primeng/accordion';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { ChipModule } from 'primeng/chip';
import { DateformatPipe } from "../../../../Pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { SkeletonModule } from 'primeng/skeleton';
@Component({
  selector: 'app-client-timesheet-detailed',
  imports: [CommonModule, AccordionModule, PaginatorModule, TranslateModule, TableModule, ChipModule,
    DateformatPipe, NoDataFoundComponent, SkeletonModule],
  templateUrl: './client-timesheet-detailed.component.html',
  styleUrl: './client-timesheet-detailed.component.scss',
  encapsulation: ViewEncapsulation.None
})

export class ClientTimesheetDetailedComponent {
  projectDetails: any;
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
    this.route.queryParams.subscribe(params => {
      const clientID = params['id'];
      if (clientID) {
        this.getResourceDetails(clientID);
        this.clientId = clientID;
      }
    });

  }
  getResourceDetails(clientID: any): void {
    let url = `ProjectResource/getClientProjectResourceSummary?clientId=${clientID}`;

    this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
      next: (res: any) => {
        const rawProjects = res?.data || [];

        this.projectDetails = rawProjects.map((item: any) => ({
          ...item,
          groupedResources: item.project.resources   // ⬅ DIRECTLY USE BACKEND DATA
        }));

        this.contentLoader = false;
      },
      error: (err) => {
        console.error('Error:', err);
        this.contentLoader = false;
        this.projectDetails = [];
      }
    });
  }



  openModal(entry: any, project: any, content: any) {
    this.employeeName = {
      id: entry.employee.id,
      fusionEmployeeId: entry.employee.fusionEmployeeId,
      name: entry.employee.name,
      workMail: entry.employee.workMail
    };
    this.selectedProject = {
      projectName: project.project.projectName
    };
    // Convert the entry.phases into popup format
    this.selectedEntries = entry.phases.map((phase: any) => ({

      phaseName: phase.phaseName,
      resourceStartDate: phase.resourceStartDate,
      resourceEndDate: phase.resourceEndDate,
      resourceRole: phase.resourceRole,
      loggedHours: phase.loggedHours,
      resourceStatus: phase.resourceStatus
    }));

    this.modalService.open(content, { size: 'lg', backdrop: 'static', centered: true });
  }
  navigateView(projectdata: any, employeeId: any): void {
    console.log(projectdata);
    const resourceData = {
      employeeId: employeeId,
      clientId: parseInt(this.clientId),
      projectId: projectdata.projectId
    };
    localStorage.setItem('resourceData', JSON.stringify(resourceData))
    this.router.navigate(['/project-management/clients/details/timesheet/resource-summary'], {
      queryParams: {
        id: parseInt(this.clientId),
      }
    }).then(() => {
      this.http.notifyresource();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}