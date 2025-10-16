import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { RbacService } from '../../../../services/rbac.service';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { InfoIconComponent } from "../../../../icons/info-icon/info-icon.component";
import { OpenModalService } from '../../../../services/open-modal.service';
@Component({
  selector: 'app-pending-shifts',
  imports: [NoDataFoundComponent, CommonModule, TranslateModule, RouterModule, NgbPopoverModule, DataLoaderContentComponent, InfoIconComponent],
  templateUrl: './pending-shifts.component.html',
  styleUrl: './pending-shifts.component.scss'
})
export class PendingShiftsComponent {

  empinfo: any
  subscription!: Subscription;
  shiftsData: any[] = [];
  pendingsubmittedshifts: any;
  loading = false;
  successModalRef: any;
  deleteModalRef: any;
   constructor(public router: Router, private http: HttpService, public rbac: RbacService,private confirmation: OpenModalService,
  private modalService: NgbModal) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getShifts();
  }

  getShiftNames(shift: any) {
    return shift.orgShiftsItems.map((item: any) => item.shiftName).join(', ');
  }

  getShifts(): void {
    this.loading = true;
    this.subscription = this.http.getData(`orgShifts`).subscribe({
      next: (data: any) => {
        this.shiftsData = data;
        this.loading = false;
        // this.pendingsubmittedshifts = data.filter((item: any) => item.status === "Pending for Submission");
        this.pendingsubmittedshifts = data.filter((item: any) => item.status === "Pending for Submission")
          .map((item: any) => {
            return {
              ...item,
              shiftName: item.orgShiftsItems?.[0]?.shiftName || 'N/A' // fallback if missing
            };
          });
      }, error:(err)=> {
        this.loading = false;
        console.log("expensesheadererror", err)
      },
    });
  }

  updateShift(id: any): void {
    const shift = this.shiftsData.find((item : any) => item.id == id);
    localStorage.setItem('selectedShift', JSON.stringify(shift));
    this.router.navigate(['/settings/employee-fields/updateshifts', id]);
  }
  shiftsddata:any
   DeleteShiftDailog(content: any, shift: any) {
      this.shiftsddata = shift;
      this.deleteModalRef = this.modalService.open(content, { centered: true });
   }
   onDelete(modal: any) {
      this.http.deleteData(`OrgShifts/${this.shiftsddata.id}`).subscribe({
         next: () => {
            // Remove from list after successful delete
            this.shiftsData = this.shiftsData.filter(item => item.id !== this.shiftsddata.id);

            // Close delete popup
            modal.close();
                 this.http.triggerRefresh();
                    
            // Open success popup
            this.confirmation.openSuccessModal('Shift deleted successfully');
             this.getShifts();
             
            setTimeout(() => {
               if (this.successModalRef) {
                  this.successModalRef.close();
                      
               }
            }, 2000);
         },
         error: () => {
            modal.close();
            this.confirmation.openErrorModal('Failed to delete Shifts.');
         }
      });
   }
   nagvition() {
    this.router.navigate(['/settings/employee-fields/addshifts']);
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }
}
