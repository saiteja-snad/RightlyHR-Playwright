import { Injectable, signal } from '@angular/core';
import { HttpService } from '../http.service';
import { firstValueFrom } from 'rxjs';
import { MenuOrder } from '../../theme-customization/theme-action.service';

export const MENU_PREF_KEY = 'RHR_WEB_Menu_Items';

@Injectable({ providedIn: 'root' })
export class MenuOrderService {

  // Signal that sidenav reads to apply order
  menuOrder = signal<MenuOrder | null>(null);

  constructor(private http: HttpService) {}

  setMenuOrder(order: MenuOrder | null): void {
    this.menuOrder.set(order);
  }

  async initMenuOrder(): Promise<void> {
    try {
      const empInfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      const employeeId = empInfo?.employeeId;
      if (!employeeId) return;

      const response: any = await firstValueFrom(
        this.http.getData(`Employeedata/get-user-preference/${employeeId}`)
      );
      const savedValue = response?.data?.[MENU_PREF_KEY];
      if (savedValue) {
        this.menuOrder.set(JSON.parse(savedValue));
      } else {
        this.menuOrder.set(null);
      }
    } catch (error) {
      console.error('Error loading menu order:', error);
      this.menuOrder.set(null);
    }
  }
}
