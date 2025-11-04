import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-client-timesheet-detailed',
  imports: [CommonModule],
  templateUrl: './client-timesheet-detailed.component.html',
  styleUrl: './client-timesheet-detailed.component.scss'
})

export class ClientTimesheetDetailedComponent {
  projectEmployeeDetails: any;
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(public modalService: NgbModal, public readonly router: Router, private http: HttpService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.getResourceDetails();
  }

  getResourceDetails(): void {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params: { [x: string]: any }) => {
      const clientID = params['id'];
      if (!clientID) {
        this.projectEmployeeDetails = [];
        return;
      }

      // Build the API URL conditionally
      let url = `ProjectResource/getClientProjectResourceSummary?clientId=${clientID}`;

      this.http.getData(url).pipe(takeUntil(this.destroy$)).subscribe({
        next: (res: any) => {
          console.log(res);
          // this.projectEmployeeDetails = res?.data;
          // console.log(this.projectEmployeeDetails);
        },
        error: (err) => {
          console.error('Error fetching clients:', err);
        }
      });
    });
  }
}
