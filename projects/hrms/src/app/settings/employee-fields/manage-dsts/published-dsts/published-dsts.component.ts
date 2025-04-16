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

@Component({
  selector: 'app-published-dsts',
  imports: [NoDataFoundComponent, CommonModule],
  templateUrl: './published-dsts.component.html',
  styleUrl: './published-dsts.component.scss',
})
export class PublishedDstsComponent implements OnInit, OnDestroy {
  publishedDSTs = [] as ManageDST[];
  allDSTs = [] as ManageDST[];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(
    private http: HttpService,
    private sharedModalService: OpenModalService,
    private modalService: NgbModal,
    private router: Router
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
          console.log(data);
          this.allDSTs = data;
          this.filterPublishedDSTs();
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
