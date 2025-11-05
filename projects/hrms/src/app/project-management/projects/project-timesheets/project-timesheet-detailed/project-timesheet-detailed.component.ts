import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { DateformatPipe } from "../../../../Pipes/dateformat.pipe";
@Component({
  selector: 'app-project-timesheet-detailed',
  imports: [CommonModule, DateformatPipe],
  templateUrl: './project-timesheet-detailed.component.html',
  styleUrl: './project-timesheet-detailed.component.scss'
})

export class ProjectTimesheetDetailedComponent {
  projectEmployeeDetails: any;
  projectId: any
  clientId: any
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public modalService: NgbModal, public readonly router: Router, private http: HttpService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getResourceDetails();
  }

  openModalLarge(content: any) {
    this.modalService.open(content, { centered: true, size: 'lg', backdrop: 'static', });
  }

  getResourceDetails(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any; }) => {
      const projectid = params['id'];
      if (!projectid) {
        this.projectEmployeeDetails = [];
        return;
      }

      // Build the API URL conditionally
      let url = `ProjectResource/getClientProjectResourceSummary?projectId=${projectid}`;

      this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          console.log(res);
          const projectData = res?.data?.[0]?.project;
          const clientData = res?.data?.[0]?.client;

          this.projectId = projectData?.projectId || null;
          this.clientId = clientData?.clientId || null;

          // ✅ Access nested resources inside project
          this.projectEmployeeDetails = projectData?.resources || [];

          console.log('Resources:', this.projectEmployeeDetails);
        },
        error: (err) => {
          console.error('Error fetching clients:', err);
        }
      });
    });
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