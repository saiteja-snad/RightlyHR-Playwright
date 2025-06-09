import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { Subscription } from 'rxjs';
import { Ilpid } from '../../../Interfaces/onbehalfof.model';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-on-be-half-of-cancel',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent, InfoIconComponent, DataLoaderContentComponent],
  templateUrl: './on-be-half-of-cancel.component.html',
  styleUrl: './on-be-half-of-cancel.component.scss'
})

export class OnBeHalfOfCancelComponent implements OnInit, OnDestroy {
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  loggedinuser = {} as any;
  empdata = {} as any;
  subscription!: Subscription;
  lpdata = [] as Ilpid[];
  loading: boolean = false;
  cadidateEmployeeId!: number;
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

  constructor(private http: HttpService, private authService: AuthService, public rbac: RbacService) {
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
    this.cadidateEmployeeId = parseInt(localStorage.getItem('onbehalfof') as string);
    if (this.cadidateEmployeeId) {
      this.getDataByLPID();
    }
  }

  getDataByLPID() {
    this.loading = true;
    let empid = this.cadidateEmployeeId;
    this.subscription = this.http.getData(`Timeoff/${empid}`).subscribe({
      next: (response: any) => {
        this.loading = false;
        console.log(response);
        if (Array.isArray(response)) {
          this.lpdata = response.filter(item => item.status.toLowerCase() === 'cancelled');
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) =>{ console.log(reason)
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}