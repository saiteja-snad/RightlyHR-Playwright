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
@Component({
  selector: 'app-client-timesheet-detailed',
  imports: [CommonModule,AccordionModule, PaginatorModule, TranslateModule, TableModule],
  templateUrl: './client-timesheet-detailed.component.html',
  styleUrl: './client-timesheet-detailed.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class ClientTimesheetDetailedComponent {
  projectDetails: any;
  resourceDetails: any;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public modalService: NgbModal, public readonly router: Router, private http: HttpService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getResourceDetails();
  }

  getResourceDetails(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const clientID = params['id'];
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
}
