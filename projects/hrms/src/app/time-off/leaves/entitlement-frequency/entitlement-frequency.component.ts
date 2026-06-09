import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { combineLatest, debounceTime, distinctUntilChanged, map, startWith, Subject, takeUntil } from 'rxjs';
import { Accordion, AccordionContent, AccordionHeader, AccordionPanel } from 'primeng/accordion';
import { DataLoaderContentComponent } from '../../../shared/data-loader-content/data-loader-content.component';
import { NoDataFoundComponent } from '../../../shared/no-data-found/no-data-found.component';
import { HttpService } from '../../../services/http.service';
import { TimeoffYearFilterService } from '../../../services/timeoff-year-filter.service';
import { FrequencyFilterService } from '../../../services/frequency-filter.service';
import { FrequencySummary, FrequencyGroup } from '../leaves.model';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { InfoIconComponent } from '../../../icons/info-icon/info-icon.component';

@Component({
  selector: 'app-entitlement-frequency',
  imports: [CommonModule, Accordion, AccordionPanel, AccordionHeader, AccordionContent, DataLoaderContentComponent, NoDataFoundComponent, NgbPopoverModule, InfoIconComponent],
  templateUrl: './entitlement-frequency.component.html',
  styleUrl: './entitlement-frequency.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class EntitlementFrequencyComponent implements OnInit, OnDestroy {
  loading = false;
  groups: FrequencyGroup[] = [];
  selectedYear = new Date().getFullYear();
  destroy$ = new Subject<boolean>();

  constructor(
    private http: HttpService,
    private timeoffYearFilterService: TimeoffYearFilterService,
    private frequencyFilterService: FrequencyFilterService
  ) {}

  ngOnInit(): void {
    const initialYear = this.timeoffYearFilterService.getSelectedYear() ?? new Date().getFullYear();
    const initialEmployeeId = this.http.getCurrentEmployeeIdTimeoff() ?? this.getLoggedInEmployeeId();

    const employeeId$ = this.http.selectedEmployeeIdTimeoff$.pipe(
      startWith(initialEmployeeId),
      map(id => (id ?? this.getLoggedInEmployeeId()) as number)
    );

    const year$ = this.timeoffYearFilterService.selectedYear$.pipe(
      startWith(initialYear),
      distinctUntilChanged()
    );

    const frequencies$ = this.frequencyFilterService.selectedFrequencies$.pipe(
      startWith([]),
      distinctUntilChanged()
    );

    combineLatest([employeeId$, year$, frequencies$])
      .pipe(debounceTime(0), takeUntil(this.destroy$))
      .subscribe(([employeeId, year, frequencies]) => {
        if (employeeId && year) {
          this.loadSummary(employeeId, year, frequencies);
        }
      });
  }

  private getLoggedInEmployeeId(): number {
    return JSON.parse(localStorage.getItem('rightlyHrUser') || '{}')?.employeeId;
  }

  loadSummary(employeeId: number, year: number, frequencies: string[] = []): void {
    this.selectedYear = year;
    this.loading = true;
    this.groups = [];
    
    let apiUrl = `LeaveEntitlements/entitlement-summary/${employeeId}?year=${year}`;
    
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

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
