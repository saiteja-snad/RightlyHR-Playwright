import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpService } from '../../../../services/http.service';
import { IEligibilityCriteria } from '../../../../Interfaces/timoff-model';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { NoDataFoundComponent } from '../../../../shared/no-data-found/no-data-found.component';

@Component({
  selector: 'app-comp-off-entitlement-criteria',
  imports: [CommonModule, NoDataFoundComponent],
  templateUrl: './comp-off-entitlement-criteria.component.html',
  styleUrl: './comp-off-entitlement-criteria.component.scss',
})
export class CompOffEntitlementCriteriaComponent implements OnInit, OnDestroy {
  eligibilityCriterias = [] as IEligibilityCriteria[];
  destroy$: Subject<boolean> = new Subject<boolean>();

  constructor(private http: HttpService) {}

  ngOnInit(): void {
    this.getCompOffEligibitlyCriterias('CompOffEligibilityCriteria');
  }

  getCompOffEligibitlyCriterias(eligibilityType: string) {
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
