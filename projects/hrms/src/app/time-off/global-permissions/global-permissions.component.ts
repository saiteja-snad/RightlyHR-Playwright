import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { DateformatPipe } from '../../Pipes/dateformat.pipe';
import { Subscription } from 'rxjs';
import { LeaveApproval, LeaveApproverComment } from '../../Interfaces/pendingapprovalsmodel';
import { ICategoryDetails } from '../../Interfaces/timoff-model';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { GlobalpermissionsPipe } from "../../Pipes/globalpermissions.pipe";
import { Iglobalpermissions } from './globalpermissions-modal';
import { AddGlobalPermissionsComponent } from './add-global-permissions/add-global-permissions.component';

@Component({
  selector: 'app-global-permissions',
  imports: [CommonModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, DateformatPipe, NoDataFoundComponent, GlobalpermissionsPipe],
  templateUrl: './global-permissions.component.html',
  styleUrl: './global-permissions.component.scss'
})
export class GlobalPermissionsComponent implements OnInit,OnDestroy {
  totalRecords = 100
  first: any = 1;
  rows: any = 10;
 empinfo={} as any;
  subscription!: Subscription;
  searchValue :any;
  globalpermissions = [] as Iglobalpermissions[];

  @ViewChild('commentspopup') modalContent: any;
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
  constructor(
    private http: HttpService,
    private modalService: NgbModal,
    private conformationPopup: OpenModalService,
    public rbac: RbacService,
  ) {  
    // Signal reaction for employee switch
    effect(() =>{
      if (this.http.tirggerCountSignal().global) {
        this.getAllGlobalPermissions();
        this.http.tirggerCountSignal.update((status) => ({
          ...status,
          global: false,
        }));
      }

  })
  }
  
  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllGlobalPermissions();
  }
  openAdd() {
    this.modalService.open(AddGlobalPermissionsComponent, { centered: true, backdrop: 'static', size: 'lg' });
  }
  //function to get the globalpermissions details
  getAllGlobalPermissions(){
    
    this.subscription = this.http.getData(`GlobalPermissions/getGlobalPermissions?pageNumber=${this.first}&pageSize=${this.rows}`).subscribe({
      next: (response: any) => {
        console.log(response)
        this.globalpermissions = response.data.requestedBy as Iglobalpermissions[];
        
        this.totalRecords=response.totalRecords;
        console.log(this.globalpermissions)
        
      }, error(err: any) {
        console.log("errors", err);
      },
    })
  }
   //function to get the values 
   getEmployeeNames(employeeIds: any[]): string {
    return employeeIds
        .map(emp => `${emp.firstName ?? ''} ${emp.middleName ?? ''} ${emp.lastName ?? ''} ${emp.fusionEmpId ? `(${emp.fusionEmpId})` : ''}`.trim())
        .join(',\n'); // Join with line breaks for each employee
}
  
ngOnDestroy(): void {
  if (this.subscription) {
    this.subscription.unsubscribe();
  }
}

  
  
  
 

 

 
}
