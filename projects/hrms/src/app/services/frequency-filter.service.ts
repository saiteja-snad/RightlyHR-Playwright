import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FrequencyFilterService {
  private selectedFrequenciesSubject = new BehaviorSubject<string[]>([]);
  public selectedFrequencies$: Observable<string[]> = this.selectedFrequenciesSubject.asObservable();

  setSelectedFrequencies(frequencies: string[]): void {
    this.selectedFrequenciesSubject.next(frequencies);
  }

  getSelectedFrequencies(): string[] {
    return this.selectedFrequenciesSubject.value;
  }

  clearFrequencies(): void {
    this.selectedFrequenciesSubject.next([]);
  }
}
