import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export interface MenuOrder {
  mainMenuRoutes: string[];
  threeDotRoutes: string[];
}

@Injectable({ providedIn: 'root' })
export class ThemeActionService {
  applyTheme$ = new Subject<void>();
  applyFont$ = new Subject<void>();
  applyMenuChanges$ = new Subject<void>();
  resetMenuToDefault$ = new Subject<void>();

  canApplyTheme = signal(false);
  canApplyFont = signal(false);
  canApplyMenuChanges = signal(false);
}
