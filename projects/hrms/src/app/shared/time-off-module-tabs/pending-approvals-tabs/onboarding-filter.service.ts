import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OnboardingFilterService {
  private selectedMonthSubject = new BehaviorSubject<number>(new Date().getMonth() + 1);
  private selectedYearSubject = new BehaviorSubject<number>(new Date().getFullYear());

  selectedMonth$: Observable<number> = this.selectedMonthSubject.asObservable();
  selectedYear$: Observable<number> = this.selectedYearSubject.asObservable();

  setMonth(month: number) {
    this.selectedMonthSubject.next(month);
  }

  setYear(year: number) {
    this.selectedYearSubject.next(year);
  }

  setMonthYear(month: number, year: number) {
    this.selectedMonthSubject.next(month);
    this.selectedYearSubject.next(year);
  }
}