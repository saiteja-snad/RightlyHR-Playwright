import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TimeoffYearFilterService {
  private selectedYearSubject = new BehaviorSubject<number | null>(null);
  selectedYear$ = this.selectedYearSubject.asObservable();

  private timeoffDataSubject = new BehaviorSubject<any[]>([]);
  timeoffData$ = this.timeoffDataSubject.asObservable();
  public selectedMountlySubject = new BehaviorSubject<number | null>(null);
  selectedMounthly$ = this.selectedMountlySubject.asObservable();

  setSelectedYear(year: number) {
    this.selectedYearSubject.next(year);
  }

  setSelectedMounthly(year: number) {
    this.selectedMountlySubject.next(year);
    console.log('Selected Mountly in Service:', year);

  }
  getSelectedYear() {
    return this.selectedYearSubject.value;
  }

  setTimeoffData(data: any[]) {
    this.timeoffDataSubject.next(data);
  }

  clearTimeoffData() {
    this.timeoffDataSubject.next([]);
  }
}