import { Injectable, signal } from '@angular/core';
import { HttpService } from './http.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserPreferenceService {
  private preferencesSignal = signal<any>(null);
  private fetchPromise: Promise<any> | null = null;
  private cachedEmployeeId: number | null = null;
  private cachedSessionMarker: string | null = null;

  constructor(private http: HttpService) {}

  private getEmployeeIdFromStorage(): number | null {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const currentId = currentUser?.employeeId;
      if (currentId) return currentId;

      const rightlyUser = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
      const rightlyId = rightlyUser?.employeeId;
      return rightlyId || null;
    } catch {
      return null;
    }
  }

  /**
   * Fetches preferences from API if not already cached.
   * Returns a promise that resolves to the preference data object.
   */
  async getPreferences(forceRefresh = false): Promise<any> {
    const employeeId = this.getEmployeeIdFromStorage();
    if (!employeeId) return null;

    const sessionMarker = `${localStorage.getItem('currentUser') ?? ''}|${localStorage.getItem('rightlyHrUser') ?? ''}|${localStorage.getItem('rightlyHrRoleClaims') ?? ''}`;

    if (!forceRefresh && this.cachedSessionMarker !== null && this.cachedSessionMarker !== sessionMarker) {
      this.preferencesSignal.set(null);
      this.cachedEmployeeId = null;
    }

    if (!forceRefresh && this.preferencesSignal() && this.cachedEmployeeId === employeeId && this.cachedSessionMarker === sessionMarker) {
      return this.preferencesSignal();
    }

    if (this.fetchPromise && !forceRefresh) {
      return this.fetchPromise;
    }

    try {
      this.fetchPromise = firstValueFrom(
        this.http.getData(`Employeedata/get-user-preference/${employeeId}`)
      ).then((res: any) => {
        if (res?.success) {
          this.preferencesSignal.set(res.data);
          this.cachedEmployeeId = employeeId;
          this.cachedSessionMarker = sessionMarker;
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
    this.cachedEmployeeId = null;
    this.cachedSessionMarker = null;
  }

  /**
   * Synchronously get the current cached preferences.
   */
  get currentPreferences() {
    return this.preferencesSignal();
  }
}
