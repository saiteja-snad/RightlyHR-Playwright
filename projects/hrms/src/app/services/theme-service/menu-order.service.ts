import { Injectable, signal } from '@angular/core';
import { HttpService } from '../http.service';
import { firstValueFrom } from 'rxjs';
import { MenuOrder } from '../../theme-customization/theme-action.service';
import { UserPreferenceService } from '../user-preference.service';

export const MENU_PREF_KEY = 'RHR_WEB_Menu_Items';

@Injectable({ providedIn: 'root' })
export class MenuOrderService {

  menuOrder = signal<MenuOrder | null>(null);

  constructor(private http: HttpService, private userPrefService: UserPreferenceService) {}

  setMenuOrder(order: MenuOrder | null): void {
    this.menuOrder.set(order);
  }

  saveOrder(employeeId: number, order: MenuOrder): void {
    const payload = { employeeId, key: MENU_PREF_KEY, value: JSON.stringify(order) };
    this.http.postdata('Employeedata/save-user-preference', payload).subscribe({
      next: () => this.menuOrder.set(order),
      error: (err) => console.error('Failed to save menu order', err)
    });
  }

  async initMenuOrder(): Promise<void> {
    try {
      const data = await this.userPrefService.getPreferences();
      const savedValue = data?.[MENU_PREF_KEY];
      this.menuOrder.set(savedValue ? JSON.parse(savedValue) : null);
    } catch (error) {
      console.error('Error loading menu order:', error);
      this.menuOrder.set(null);
    }
  }
}
