import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbNavModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DateformatPipe } from '../../../Pipes/dateformat.pipe';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-on-be-half-of-reject',
  imports: [CommonModule, NgbNavModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent],
  templateUrl: './on-be-half-of-reject.component.html',
  styleUrl: './on-be-half-of-reject.component.scss'
})
export class OnBeHalfOfRejectComponent {
  loggedinuser = {} as any;
  cadidateEmployeeId!:number;
  subscription!: Subscription;
  rejectedLeaves: any = [];
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
  constructor(private http: HttpService, private authService: AuthService,) {

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
        console.log(response);
        if (Array.isArray(response)) {
          this.rejectedLeaves = response.filter(item => item.status === 'Rejected');
          let pendingCount = this.rejectedLeaves.length;
          console.log("Pending Records Count:", pendingCount);
        } else {
          console.error("Invalid response format");
        }
      },
      error: (reason: any) => console.log(reason)
    });
  }
}
