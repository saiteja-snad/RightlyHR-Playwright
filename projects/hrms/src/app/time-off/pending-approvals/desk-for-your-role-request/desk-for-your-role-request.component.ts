import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { Entity } from '../../../Interfaces/claimsandexpenses.model';
import { HttpService } from '../../../services/http.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-desk-for-your-role-request',
  imports: [CommonModule, NoDataFoundComponent],
  templateUrl: './desk-for-your-role-request.component.html',
  styleUrl: './desk-for-your-role-request.component.scss'
})
export class DeskForYourRoleRequestComponent {
employdata:any
  deskheaderpending:Entity[] = [];

  constructor(
    private http: HttpService,
    private readonly modalService: NgbModal,
  ){}

  
  ngOnInit(): void {
    this.employdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getexpensespending();
  }

  getexpensespending(): void {
    this.http
       .getData(`PendingApproval/employee/${this.employdata.employeeId}?moduleId=23&approvedType=EMP`)
       .subscribe({
         next: (data: any) => {
           console.log(data);
           this.deskheaderpending = (data.data as Entity[]).filter(item => item.approvalHeader.status!='Processed' && item.approvalHeader.status!='Rejected');
           console.log(this.deskheaderpending)
        
           // this.filterPendingExpenses()
         }, error:(err) =>{
           console.log("expensesheadererror")
         
         },
       });
   }
}
