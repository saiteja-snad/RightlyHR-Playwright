import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { DateformatPipe } from "../../../../Pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
@Component({
  selector: 'app-project-timesheet-detailed',
  imports: [CommonModule, DateformatPipe, NoDataFoundComponent, DataLoaderContentComponent],
  templateUrl: './project-timesheet-detailed.component.html',
  styleUrl: './project-timesheet-detailed.component.scss'
})

export class ProjectTimesheetDetailedComponent {
  projectEmployeeDetails: any;
  projectId: any;
  clientId: any;
    employeeName: any
  selectedEntries: any
  destroy$: Subject<boolean> = new Subject<boolean>();
  loading = false
  constructor(public modalService: NgbModal, public readonly router: Router, private http: HttpService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params: { [x: string]: any; }) => {
      const projectid = params['id'];
      if (projectid) {
        this.projectId=projectid
        this.getResourceDetails(projectid)
      }

    });
  }


 getResourceDetails(clientID: any): void {
  let url = `ProjectResource/getClientProjectResourceSummary?projectId=${clientID}`;

  this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
    next: (res: any) => {
      const rawProjects = res?.data || [];
      this.clientId = rawProjects[0].client.clientId;
      this.projectEmployeeDetails = rawProjects.flatMap((item: any) =>
        item.project.resources.map((resource: any) => ({
          employee: resource.employee,
          roles: resource.roles,
          departments: resource.departments,
          phasesCount: resource.phases.length,
          phases: resource.phases,
          totalLoggedHours: resource.totalLoggedHours ?? 0
        }))
      );

      this.loading = false;
    },
    error: (err) => {
      console.error('Error:', err);
      this.loading = false;
      this.projectEmployeeDetails = [];
    }
  });
}


    openModal(entry: any, content: any) {
    this.employeeName = {
      id: entry.employee.id,
      fusionEmployeeId: entry.employee.fusionEmployeeId,
      name: entry.employee.name,
      workMail: entry.employee.workMail
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

  

  navigateView(employeeId: any): void {
    const resourceData = {
      employeeId: employeeId,
      clientId: this.clientId,
      projectId: this.projectId
    };
    localStorage.setItem('resourceData', JSON.stringify(resourceData));
    this.router.navigate(['/project-management/projects/details/timesheet/resource-summary'], {
      queryParams: { id: this.projectId }
    }).then(() => {
      this.http.notifyresource();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}