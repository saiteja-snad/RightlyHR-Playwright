import { Injectable, signal } from '@angular/core';
import { HttpService } from './http.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPreferenceService {
  private preferencesSignal = signal<any>(null);
  private fetchPromise: Promise<any> | null = null;

  constructor(private http: HttpService) {}

  /**
   * Fetches preferences from API if not already cached.
   * Returns a promise that resolves to the preference data object.
   */
  async getPreferences(forceRefresh = false): Promise<any> {
    if (!forceRefresh && this.preferencesSignal()) {
      return this.preferencesSignal();
    }

    if (this.fetchPromise && !forceRefresh) {
      return this.fetchPromise;
    }

    try {
      const empInfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      const employeeId = empInfo?.employeeId;
      if (!employeeId) return null;

      this.fetchPromise = firstValueFrom(
        this.http.getData(`Employeedata/get-user-preference/${employeeId}`)
      ).then((res: any) => {
        if (res?.success) {
          this.preferencesSignal.set(res.data);
          return res.data;
        }
        return null;
      });

      const data = await this.fetchPromise;
      return data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    } finally {
      this.fetchPromise = null;
    }
  }

  /**
   * Clears the cache so the next call to getPreferences will fetch fresh data.
   */
  clearCache() {
    this.preferencesSignal.set(null);
  }

  /**
   * Synchronously get the current cached preferences.
   */
  get currentPreferences() {
    return this.preferencesSignal();
  }
}
