import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TimeoffSelection {
  employeeId: number | null;
  year: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class TimeoffSelectionService {
  private selectionSubject = new BehaviorSubject<TimeoffSelection>({ employeeId: null, year: null });
  selection$ = this.selectionSubject.asObservable();

  updateSelection(employeeId: number | null, year: number | null) {
    this.selectionSubject.next({ employeeId, year });
  }

  getSelection() {
    return this.selectionSubject.value;
  }
}
