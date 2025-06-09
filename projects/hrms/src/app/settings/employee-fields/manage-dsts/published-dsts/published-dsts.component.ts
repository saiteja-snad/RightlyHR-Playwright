import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpService } from '../../../../services/http.service';
import { OpenModalService } from '../../../../services/open-modal.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject, takeUntil } from 'rxjs';
import { ManageDST } from '../dsts.modal';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
import { CommonModule } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RbacService } from '../../../../services/rbac.service';
import { DataLoaderContentComponent } from "../../../../shared/data-loader-content/data-loader-content.component";

@Component({
  selector: 'app-published-dsts',
  imports: [NoDataFoundComponent, CommonModule, TranslateModule, DataLoaderContentComponent],
  templateUrl: './published-dsts.component.html',
  styleUrl: './published-dsts.component.scss',
})
export class PublishedDstsComponent implements OnInit, OnDestroy {
  publishedDSTs = [] as ManageDST[];
  allDSTs = [] as ManageDST[];
  destroy$: Subject<boolean> = new Subject<boolean>();
  loading = false;
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
    this.loading = true;
    this.http
      .getData('OrgDayLight/getAll')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.loading = false;
          this.allDSTs = data;
          this.filterPublishedDSTs();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error fetching DSTs:', error);
        },

      });
  }

  navigateToCloneComponent(publishedDST: ManageDST): void {
    localStorage.setItem('cloneDST', JSON.stringify(publishedDST));
    this.router.navigate(['/settings/employee-fields/clone-dst']);
  }
  navigateToViewDSTComponent(publishedDST: ManageDST): void {
    localStorage.setItem('publishedDST', JSON.stringify(publishedDST));
    this.router.navigate(['/settings/employee-fields/view-dst']);
  }

  filterPublishedDSTs() {
    this.publishedDSTs = this.allDSTs
      .filter((status: { status: string }) => status.status === 'Published')
      .reverse();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
