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

@Component({
  selector: 'app-pending-dsts',
  imports: [NoDataFoundComponent, CommonModule,TranslateModule],
  templateUrl: './pending-dsts.component.html',
  styleUrl: './pending-dsts.component.scss',
})
export class PendingDstsComponent implements OnInit, OnDestroy {
  pendingDSTs = [] as ManageDST[];
  allDSTs = [] as ManageDST[];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private http: HttpService,
    private sharedModalService: OpenModalService,
    private modalService: NgbModal,
    private router: Router,
    public rbac: RbacService
  ) {}

  ngOnInit(): void {
    this.getAllDayLight();
  }

  addDST() {
    this.router.navigate(['/settings/employee-fields/add-dst']);
  }

  getAllDayLight() {
    this.http
      .getData('OrgDayLight/getAll')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.allDSTs = data;
          this.filterPendingDSTs();
        },
      });
  }

  navigateToUpdateDSTComponent(pendingDST: ManageDST) {
    localStorage.setItem('pendingDST', JSON.stringify(pendingDST));
    this.router.navigate(['/settings/employee-fields/update-dst']);
  }

  filterPendingDSTs() {
    this.pendingDSTs = this.allDSTs
      .filter(
        (status: { status: string }) =>
          status.status === 'Pending for submission'
      )
      .reverse();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
