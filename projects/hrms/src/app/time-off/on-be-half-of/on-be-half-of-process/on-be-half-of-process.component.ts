import { Component, effect } from '@angular/core';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { InfoIconComponent } from "../../../icons/info-icon/info-icon.component";
import { DataLoaderContentComponent } from "../../../shared/data-loader-content/data-loader-content.component";
@Component({
  selector: 'app-on-be-half-of-process',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent, InfoIconComponent, DataLoaderContentComponent],
  templateUrl: './on-be-half-of-process.component.html',
  styleUrl: './on-be-half-of-process.component.scss'
})

export class OnBeHalfOfProcessComponent {
  loggedinuser = {} as any;
  cadidateEmployeeId!: number;
  subscription!: Subscription;
  processedLeaves: any = [];
  totalRecords = 100
  first: any = 0;
  rows: any = 10;
  
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];
  loading: boolean = false;
  onRowsChange() {
    this.first = 0;
  }
  onPageChange(event: PaginatorState) {
    this.first = event.first;
    this.rows = event.rows;
  }

  constructor(private http: HttpService, private authService: AuthService,) {
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
    this.subscription = this.http.getData(`Timeoff/${this.cadidateEmployeeId}`).subscribe({
      next: (response: any) => {
        this.loading = false;
        if (Array.isArray(response)) {
          this.processedLeaves = response.filter(item => item.status.toLowerCase() === 'processed');
          let pendingCount = this.processedLeaves.length;
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => {console.log(reason)
        this.loading = false;
        // Handle error appropriately, e.g., show a notification
      }

    });
  }
}