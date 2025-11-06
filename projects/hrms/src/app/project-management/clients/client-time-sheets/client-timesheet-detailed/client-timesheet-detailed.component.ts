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
import { DateformatPipe } from "../../../../Pipes/dateformat.pipe";
import { NoDataFoundComponent } from "../../../../shared/no-data-found/no-data-found.component";
@Component({
  selector: 'app-client-timesheet-detailed',
  imports: [CommonModule, AccordionModule, PaginatorModule, TranslateModule, TableModule, DateformatPipe, NoDataFoundComponent],
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

  constructor(public modalService: NgbModal, public readonly router: Router, private http: HttpService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getResourceDetails();
  }

  getResourceDetails(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const clientID = params['id'];
      this.clientId = clientID;
      if (!clientID) {
        this.projectDetails = [];
        return;
      }
      // Build the API URL conditionally
      let url = `ProjectResource/getClientProjectResourceSummary?clientId=${clientID}`;

      this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          this.projectDetails = res?.data;
        },
        error: (err) => {
          console.error('Error fetching clients:', err);
        }
      });
    });
  }

  navigateView(projectdata: any, employeeId: any): void {
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
