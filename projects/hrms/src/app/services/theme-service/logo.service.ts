import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class LogoService {
  private selectedLogoSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  private selectedLogoKey = 'selectedLogo';

  constructor() {
    const storedLogo = localStorage.getItem(this.selectedLogoKey);
    this.selectedLogoSubject = new BehaviorSubject<string | null>(storedLogo ? storedLogo : null);
  }

  getSelectedLogo(): Observable<string | null> {
    return this.selectedLogoSubject.asObservable();
  }

  setSelectedLogo(logoPath: string): void {
    this.selectedLogoSubject.next(logoPath);
    localStorage.setItem(this.selectedLogoKey, logoPath);
  }
}