import { Component, effect } from '@angular/core';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DropdownModule } from 'primeng/dropdown';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { FormsModule } from '@angular/forms';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { RbacService } from '../../../services/rbac.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
@Component({
  selector: 'app-on-be-half-of-approval',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent, InfoIconComponent],
  templateUrl: './on-be-half-of-approval.component.html',
  styleUrl: './on-be-half-of-approval.component.scss'
})

export class OnBeHalfOfApprovalComponent {
  loggedinuser = {} as any;
  cadidateEmployeeId!:number;
  subscription!: Subscription;
  approvedLeaves: any = [];
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  constructor(private http: HttpService, private authService: AuthService,public rbac: RbacService,) {
    effect(() => {
      if (this.http.onBehalfOfTriggerSignal()) {
        this.cadidateEmployeeId = parseInt(
          localStorage.getItem('onbehalfof') as string
        );
        if (this.cadidateEmployeeId != null) {
          this.getDataByLPID();
        }
        this.http.onBehalfOfTriggerSignal.set(false);
      }
    });
  }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.cadidateEmployeeId =parseInt(localStorage.getItem('onbehalfof') as string) ;
    if(this.cadidateEmployeeId){
      this.getDataByLPID();
    }
  }

  getDataByLPID() {
    this.subscription = this.http.getData(`Timeoff/${this.cadidateEmployeeId}`).subscribe({
      next: (response: any) => {
        console.log(response)
        if (Array.isArray(response)) {
          this.approvedLeaves = response.filter(item => item.status.toLowerCase() === 'approved');
          let pendingCount = this.approvedLeaves.length;
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => console.log(reason)
    });
  }
}