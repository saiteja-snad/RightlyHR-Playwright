import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { ManageDST } from '../dsts.modal';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";
import { SettingsUpdateIconComponent } from "../../../../icons/settings-update-icon/settings-update-icon.component";

@Component({
  selector: 'app-pending-dsts',
  imports: [NoDataFoundComponent, CommonModule, TranslateModule, DataLoaderContentComponent, SettingsUpdateIconComponent],
  templateUrl: './pending-dsts.component.html',
  styleUrl: './pending-dsts.component.scss',
})
export class PendingDstsComponent implements OnInit, OnDestroy {
  pendingDSTs = [] as ManageDST[];
  allDSTs = [] as ManageDST[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  loading = false;
   message: any;
   successModalRef: any;
   deleteModalRef: any;
   constructor(
    private http: HttpService,
    private sharedModalService: OpenModalService,
    private modalService: NgbModal,
    private router: Router,
    public rbac: RbacService,
      private confirmation: OpenModalService,
  ) { }

  ngOnInit(): void {
    this.getAllDayLight();
  }

  addDST() {
    this.router.navigate(['/settings/employee-fields/add-dst']);
  }

  getAllDayLight() {
    this.loading = true;
    this.http.getData('OrgDayLight/getAll').pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.loading = false;
        this.allDSTs = data;
        this.filterPendingDSTs();
      },
      error: (error) => {
        this.loading = false;
        console.error('Error fetching DSTs:', error);
      },
    });
  }

  navigateToUpdateDSTComponent(pendingDST: ManageDST) {
    localStorage.setItem('pendingDST', JSON.stringify(pendingDST));
    this.router.navigate(['/settings/employee-fields/update-dst']);
  }

  filterPendingDSTs() {
    this.pendingDSTs = this.allDSTs.filter((status: { status: string }) =>
      status.status === 'Pending for submission'
    ).reverse();
  }

  Dstddata: any;

  DeleteDstDailog(content: any, dst: any) {
    this.Dstddata = dst;
    this.deleteModalRef = this.modalService.open(content, { centered: true });
  }
  onDelete(modal: any) {
    this.http.deleteData(`OrgDayLight/${this.Dstddata.id}`).subscribe({
      next: () => {
        // Remove from list after successful delete
        this.allDSTs = this.allDSTs.filter(item => item.id !== this.Dstddata.id);

        // Close delete popup
        modal.close();

        // Open success popup
        this.confirmation.openSuccessModal('DST deleted successfully');
        this.getAllDayLight();

        setTimeout(() => {
          if (this.successModalRef) {
            this.successModalRef.close();
          }
        }, 2000);
      },
      error: () => {
        modal.close();
        this.confirmation.openErrorModal('Failed to delete DST.');
      }
    });
  }
  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}