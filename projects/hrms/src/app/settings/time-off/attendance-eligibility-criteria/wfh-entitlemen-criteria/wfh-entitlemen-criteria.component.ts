import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { IEligibilityCriteria } from '../../../../Interfaces/timoff-model';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';
@Component({
  selector: 'app-wfh-entitlemen-criteria',
  imports: [CommonModule, NoDataFoundComponent],
  templateUrl: './wfh-entitlemen-criteria.component.html',
  styleUrl: './wfh-entitlemen-criteria.component.scss'
})
export class WFHEntitlemenCriteriaComponent implements OnInit, OnDestroy {
  eligibilityCriterias = [] as IEligibilityCriteria[];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpService) {}

  ngOnInit(): void {
    this.WorkFromHomeEligibilityCriteria('WorkFromHomeEligibilityCriteria');
  }

  WorkFromHomeEligibilityCriteria(eligibilityType: string) {
    this.http.getData(eligibilityType).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data) => {
        this.eligibilityCriterias = data as unknown as IEligibilityCriteria[];
      },
      error: (reason) => console.log(reason),
      complete: () => {},
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
