import { Component, OnDestroy, OnInit, ViewEncapsulation, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil, skip } from 'rxjs';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { HttpService } from '../../../services/http.service';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { FrequencyFilterService } from '../../../services/frequency-filter.service';
import { FrequencySummary, FrequencyGroup } from '../../leaves/leaves.model';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';
@Component({
  selector: 'app-on-be-half-of-entitlement-summary',
  imports: [CommonModule, Accordion, AccordionPanel, AccordionHeader, AccordionContent, DataLoaderContentComponent, NoDataFoundComponent, NgbPopoverModule, InfoIconComponent],
  templateUrl: './on-be-half-of-entitlement-summary.component.html',
  styleUrl: './on-be-half-of-entitlement-summary.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class OnBeHalfOfEntitlementSummaryComponent implements OnInit, OnDestroy {
  loading = false;
  groups: FrequencyGroup[] = [];
  selectedYear = new Date().getFullYear();
  employeeSelected = false;
  private candidateEmployeeId!: number;
  destroy$ = new Subject<boolean>();

  constructor(
    private http: HttpService,
    private timeoffYearFilterService: TimeoffYearFilterService,
    private frequencyFilterService: FrequencyFilterService
  ) {
    effect(() => {
      if (this.http.onBehalfOfTriggerSignal()) {
        this.http.onBehalfOfTriggerSignal.set(false);
        const empId = parseInt(localStorage.getItem('onbehalfof') as string);
        if (!isNaN(empId) && empId > 0) {
          this.candidateEmployeeId = empId;
          this.employeeSelected = true;
          this.loadSummary();
        } else {
          this.candidateEmployeeId = 0;
          this.employeeSelected = false;
          this.loading = false;
          this.groups = [];
        }
      }
    });
  }

  ngOnInit(): void {
    const empId = parseInt(localStorage.getItem('onbehalfof') as string);
    if (!isNaN(empId) && empId > 0) {
      this.candidateEmployeeId = empId;
      this.employeeSelected = true;
      this.loadSummary();
    }

    // Subscribe to frequency changes — skip initial emission
    this.frequencyFilterService.selectedFrequencies$
      .pipe(takeUntil(this.destroy$), skip(1))
      .subscribe(() => {
        if (this.candidateEmployeeId && !isNaN(this.candidateEmployeeId)) {
          this.loadSummary();
        }
      });

    // Subscribe to year changes — skip initial emission
    this.timeoffYearFilterService.selectedYear$
      .pipe(takeUntil(this.destroy$), skip(1))
      .subscribe(() => {
        if (this.candidateEmployeeId && !isNaN(this.candidateEmployeeId)) {
          this.loadSummary();
        }
      });
  }

  loadSummary(): void {
    const year = this.timeoffYearFilterService.getSelectedYear() ?? new Date().getFullYear();
    this.selectedYear = year;
    const frequencies = this.frequencyFilterService.getSelectedFrequencies();
    this.loading = true;
    this.groups = [];
    
    let apiUrl = `LeaveEntitlements/entitlement-summary/${this.candidateEmployeeId}?year=${year}`;
    
    if (frequencies.length > 0) {
      const frequencyParam = frequencies.join(',');
      apiUrl += `&frequencyType=${frequencyParam}`;
    }
    
    this.http.getData(apiUrl)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          const summaries: FrequencySummary[] = Array.isArray(res?.data?.frequencySummaries)
            ? res.data.frequencySummaries : [];
          this.groups = summaries.map(s => ({
            label: this.formatFrequency(s.frequencyType),
            startDate: s.startDate,
            endDate: s.endDate ?? '',
            rows: s.categories
          }));
        },
        error: () => {
          this.loading = false;
          this.groups = [];
        }
      });
  }

  formatFrequency(value: string): string {
    if (!value || !value.trim()) return 'Yearly';
    return value
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
