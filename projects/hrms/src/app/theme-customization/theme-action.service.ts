import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

export const MENU_ORDER_LS_KEY = 'RHR_MENU_ORDER';

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
