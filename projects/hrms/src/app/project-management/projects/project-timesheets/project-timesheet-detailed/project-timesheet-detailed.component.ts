import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
@Component({
  selector: 'app-project-timesheet-detailed',
  imports: [CommonModule],
  templateUrl: './project-timesheet-detailed.component.html',
  styleUrl: './project-timesheet-detailed.component.scss'
})

export class ProjectTimesheetDetailedComponent {
  projectEmployeeDetails: any;
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
      let url = `ProjectManagementGraph/project/resource-summary/${projectid}`;

      this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          console.log(res);
          this.projectEmployeeDetails = res?.data;
          console.log(this.projectEmployeeDetails);
        },
        error: (err) => {
          console.error('Error fetching clients:', err);
        }
      });
    });
  }
}