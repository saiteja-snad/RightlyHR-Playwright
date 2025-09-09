import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../../services/http.service';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { OpenModalService } from '../../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-pending-holidays',
  imports: [CommonModule, NoDataFoundComponent, TranslateModule, DataLoaderContentComponent],
  templateUrl: './pending-holidays.component.html',
  styleUrl: './pending-holidays.component.scss'
})

export class PendingHolidaysComponent {
  subscription!: Subscription
  allHolidays = [] as any;
loading = false;
 message: any;
  successModalRef: any;
  deleteModalRef: any;
  constructor(public router: Router, private http: HttpService, public rbac: RbacService, private confirmation: OpenModalService,private modalService: NgbModal) { }


  ngOnInit() {
    this.getAllHolidays();
  }

  getAllHolidays() {
    this.loading = true;
    this.subscription = this.http.getData('orgHolidays').subscribe({
      next: (data: any) => {
        this.loading = false;
        this.allHolidays = data.filter((status: { status: string; }) => status.status === 'Pending for submission').reverse();
      }, error: (err: any) => {
        console.error(err);
        this.loading = false;
      }
    })
  }

  updateHoliday(holiday: any) {
    localStorage.setItem('updateholidays', JSON.stringify(holiday));
    this.router.navigate(['/settings/employee-fields/updateholidays'])
  }
 holidaydata: any;
 
  DeleteHolidayDailog(content: any, holiday: any) {
    this.holidaydata = holiday;
    this.deleteModalRef = this.modalService.open(content, { centered: true });
  }
   onDelete(modal: any) {
    this.http.deleteData(`orgHolidays/${this.holidaydata.id}`).subscribe({
      next: () => {
        // Remove from list after successful delete
        this.allHolidays = this.allHolidays.filter((item: { id: any; }) => item.id !== this.holidaydata.id);

        // Close delete popup
        modal.close();

        // Open success popup
        this.confirmation.openSuccessModal('Holiday deleted successfully');
        this.getAllHolidays();

        setTimeout(() => {
          if (this.successModalRef) {
            this.successModalRef.close();
          }
        }, 2000);
      },
      error: () => {
        modal.close();
        this.confirmation.openErrorModal('Failed to delete Holiday.');
      }
    });
  }
  nagvition() {
    this.router.navigate(['/settings/employee-fields/addholidays']);
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}