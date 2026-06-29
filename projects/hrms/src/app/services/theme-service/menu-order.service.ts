import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '../http.service';
import { MenuRegistryService } from '../../shared/sidenav/menu-registry.service';
import { MenuOrder } from '../../theme-customization/theme-action.service';

export const MENU_PREF_KEY = 'RHR_WEB_Menu_Items';
export const QUICK_LINKS_PREF_KEY = 'RHR_WEB_Quick_Links';
const LEGACY_TABS_PREF_KEY = 'RHR_WEB_Tab_Order';

type MenuLocation = 'main' | 'ellipses';
type MenuItemType = 'direct' | 'dropdown';

interface MenuPrefFixedItem {
  id: string;
  route: string;
  order: number;
}

interface MenuPrefItem {
  id: string;
  label: string;
  route: string;
  type: MenuItemType;
  defaultLocation: MenuLocation;
  location: MenuLocation;
  order: number;
  dropdownComponent?: string;
}

interface TabsPrefItem {
  id: string;
  label: string;
  route: string;
  order: number;
}

interface TabsPrefModule {
  moduleKey: string;
  items: TabsPrefItem[];
}

export interface MenuPreferenceV2 {
  menu?: {
    items?: MenuPrefItem[];
    fixed?: {
      main?: MenuPrefFixedItem[];
    };
  };
  tabs?: {
    modules?: TabsPrefModule[];
  };
}

export interface QuickLinksPreferenceV1 {
  schemaVersion: 1;
  routes: string[];
}

@Injectable({ providedIn: 'root' })
export class MenuOrderService {
  menuOrder = signal<MenuOrder | null>(null);
  readonly preferenceV2 = signal<MenuPreferenceV2 | null>(null);
  readonly quickLinksPreference = signal<QuickLinksPreferenceV1 | null>(null);
  private initPromise: Promise<void> | null = null;
  private loadedEmployeeId: number | null | undefined = undefined;

  constructor(private http: HttpService, private menuRegistry: MenuRegistryService) {}

  setMenuOrder(order: MenuOrder | null): void {
    this.menuOrder.set(order);
  }

  async ensureLoaded(): Promise<void> {
    const currentEmployeeId = this.getCurrentEmployeeId();
    const hasLoadedCurrentEmployee =
      this.preferenceV2() !== null &&
      this.loadedEmployeeId === currentEmployeeId;

    if (hasLoadedCurrentEmployee) return;
    if (this.initPromise) return this.initPromise;
    this.initPromise = this.initMenuOrder().finally(() => {
      this.initPromise = null;
    });
    return this.initPromise;
  }

  getCurrentEmployeeId(): number | null {
    const empInfo = this.getEmployeeInfoFromStorage();
    const employeeId = empInfo?.employeeId;
    if (!employeeId) return null;
    const parsed = typeof employeeId === 'string' ? parseInt(employeeId, 10) : employeeId;
    return Number.isFinite(parsed) ? parsed : null;
  }

  saveOrder(
    employeeId: number,
    order: MenuOrder,
    options?: { onSuccess?: () => void; onError?: (err: any) => void }
  ): void {
    const currentPref = this.preferenceV2() ?? {};
    const nextPref = this.withMenuOrder(currentPref, order);
    const payload = { employeeId, key: MENU_PREF_KEY, value: JSON.stringify(nextPref) };
    this.http.postdata('Employeedata/save-user-preference', payload).subscribe({
      next: () => {
        this.preferenceV2.set(nextPref);
        this.menuOrder.set(order);
        options?.onSuccess?.();
      },
      error: (err) => {
        console.error('Failed to save menu order', err);
        options?.onError?.(err);
      }
    });
  }

async initMenuOrder(): Promise<void> {
    try {
      const empInfo = this.getEmployeeInfoFromStorage();
      const employeeId = empInfo?.employeeId;
      if (!employeeId) {
        this.loadedEmployeeId = null;
        this.preferenceV2.set({});
        this.menuOrder.set(null);
        this.quickLinksPreference.set(null);
        return;
      }

      const response: any = await firstValueFrom(
        this.http.getData(`Employeedata/get-user-preference/${employeeId}`)
      );

      const savedValue = response?.data?.[MENU_PREF_KEY];
      const legacyTabsValue = response?.data?.[LEGACY_TABS_PREF_KEY];
      const quickLinksValue = response?.data?.[QUICK_LINKS_PREF_KEY];


      const pref = this.normalizePreference(
        savedValue ? JSON.parse(savedValue) : null,
        legacyTabsValue ? JSON.parse(legacyTabsValue) : null
      );

      this.preferenceV2.set(pref);
      this.menuOrder.set(this.extractMenuOrder(pref));
      this.quickLinksPreference.set(
        quickLinksValue ? this.normalizeQuickLinksPreference(JSON.parse(quickLinksValue)) : null
      );
      this.loadedEmployeeId = this.getCurrentEmployeeId();
    } catch (error) {
      console.error('Error loading menu order:', error);
      this.loadedEmployeeId = undefined;
      this.menuOrder.set(null);
      this.preferenceV2.set(null);
      this.quickLinksPreference.set(null);
    }
  }

  applySavedTabsOrder<T>(
    moduleKey: string,
    items: T[],
    getId: (item: T) => string
  ): T[] {
    const pref = this.preferenceV2();
    const savedIds = this.getTabsOrderIdsFromPref(pref, moduleKey);
    if (savedIds.length === 0) return items;

    const byId = new Map<string, T>();
    items.forEach(item => byId.set(getId(item), item));

    const placed = new Set<string>();
    const ordered: T[] = [];

    savedIds.forEach(id => {
      const item = byId.get(id);
      if (item && !placed.has(id)) {
        ordered.push(item);
        placed.add(id);
      }
    });

    items.forEach(item => {
      const id = getId(item);
      if (!placed.has(id)) {
        ordered.push(item);
        placed.add(id);
      }
    });

    return ordered;
  }

  saveTabsModuleOrder(
    employeeId: number,
    moduleKey: string,
    tabs: Array<{ id: string; label: string; route: string }>,
    options?: { onSuccess?: () => void; onError?: (err: any) => void }
  ): void {
    const currentMenuOrder = this.menuOrder();
    const currentPref = this.preferenceV2() ?? (currentMenuOrder ? this.withMenuOrder({}, currentMenuOrder) : {});
    const items: TabsPrefItem[] = tabs.map((t, index) => ({
      id: t.id,
      label: t.label,
      route: t.route,
      order: index
    }));

    const nextPref: MenuPreferenceV2 = {
      ...currentPref,
      tabs: {
        ...currentPref.tabs,
        modules: this.upsertTabsModule(currentPref.tabs?.modules ?? [], { moduleKey, items })
      }
    };

    const payload = { employeeId, key: MENU_PREF_KEY, value: JSON.stringify(nextPref) };
    this.http.postdata('Employeedata/save-user-preference', payload).subscribe({
      next: () => {
        this.preferenceV2.set(nextPref);
        options?.onSuccess?.();
      },
      error: (err) => {
        console.error('Failed to save tabs order', err);
        options?.onError?.(err);
      }
    });
  }

  private getTabsOrderIdsFromPref(pref: MenuPreferenceV2 | null, moduleKey: string): string[] {
    const modules = pref?.tabs?.modules ?? [];
    const mod = modules.find(m => m.moduleKey === moduleKey);
    if (!mod) return [];
    return [...(mod.items ?? [])]
      .slice()
      .sort((a, b) => a.order - b.order)
      .map(i => i.id);
  }

  private extractMenuOrder(pref: MenuPreferenceV2 | null): MenuOrder | null {
    const items = pref?.menu?.items ?? [];
    if (items.length === 0) return null;

    const mainRoutes = items
      .filter(i => i.location === 'main' && i.route !== '/dashboard')
      .sort((a, b) => a.order - b.order)
      .map(i => i.route);

    const ellipsesRoutes = items
      .filter(i => i.location === 'ellipses')
      .sort((a, b) => a.order - b.order)
      .map(i => i.route);

    return {
      mainMenuRoutes: ['/dashboard', ...mainRoutes],
      threeDotRoutes: ellipsesRoutes
    };
  }

  private normalizePreference(raw: any, legacyTabsRaw: any): MenuPreferenceV2 | null {
    const hasMenuV1 = raw && Array.isArray(raw.mainMenuRoutes) && Array.isArray(raw.threeDotRoutes);
    const hasV2 = raw && (raw.menu || raw.tabs || raw.schemaVersion === 2);

    let pref: MenuPreferenceV2 | null = null;

    if (hasV2) {
      pref = {
        menu: raw.menu,
        tabs: raw.tabs
      };
    } else if (hasMenuV1) {
      pref = this.withMenuOrder({}, raw as MenuOrder);
    }

    const hasLegacyTabs = legacyTabsRaw && typeof legacyTabsRaw === 'object' && !Array.isArray(legacyTabsRaw);
    if (hasLegacyTabs) {
      const migratedModules: TabsPrefModule[] = Object.entries(legacyTabsRaw as Record<string, string[]>)
        .filter(([, ids]) => Array.isArray(ids))
        .map(([moduleKey, ids]) => ({
          moduleKey,
          items: (ids as string[]).map((id, index) => ({
            id,
            route: id,
            label: '',
            order: index
          }))
        }));

      if (!pref) {
        pref = { tabs: { modules: migratedModules } };
      } else if ((pref.tabs?.modules?.length ?? 0) === 0) {
        pref = {
          ...pref,
          tabs: { ...pref.tabs, modules: migratedModules }
        };
      }
    }

    return pref;
  }

  private withMenuOrder(base: MenuPreferenceV2, order: MenuOrder): MenuPreferenceV2 {
    const mainRoutes = (order.mainMenuRoutes ?? []).filter(r => r !== '/dashboard');
    const ellipsesRoutes = order.threeDotRoutes ?? [];

    const menuItems: MenuPrefItem[] = [
      ...mainRoutes.map((route, index) => this.makeMenuPrefItem(route, 'main', index)),
      ...ellipsesRoutes.map((route, index) => this.makeMenuPrefItem(route, 'ellipses', index))
    ].filter((i): i is MenuPrefItem => !!i);

    const next: MenuPreferenceV2 = {
      ...base,
      menu: {
        items: menuItems,
        fixed: {
          main: [{ id: '/dashboard', route: '/dashboard', order: 0 }]
        }
      }
    };

    return next;
  }

  private makeMenuPrefItem(route: string, location: MenuLocation, order: number): MenuPrefItem | null {
    const def = this.menuRegistry.getByRoute(route);
    if (!def) return null;
    return {
      id: route,
      label: def.label,
      route: def.route,
      type: def.type,
      defaultLocation: def.defaultLocation,
      location,
      order,
      dropdownComponent: def.dropdownComponent
    };
  }

  private upsertTabsModule(existing: TabsPrefModule[], next: TabsPrefModule): TabsPrefModule[] {
    const idx = existing.findIndex(m => m.moduleKey === next.moduleKey);
    if (idx === -1) return [...existing, next];
    const copy = [...existing];
    copy[idx] = next;
    return copy;
  }

  private getEmployeeInfoFromStorage(): any {
    const primary = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    if (primary?.employeeId) return primary;
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  getQuickLinksRoutes(): string[] {
    const pref = this.quickLinksPreference();
    return Array.isArray(pref?.routes) ? pref!.routes : [];
  }

  saveQuickLinks(
    employeeId: number,
    routes: string[],
    options?: { onSuccess?: () => void; onError?: (err: any) => void }
  ): void {
    const cleaned = Array.isArray(routes) ? routes.filter((r) => typeof r === 'string' && r.length > 0) : [];
    const pref: QuickLinksPreferenceV1 = {
      schemaVersion: 1,
      routes: cleaned
    };

    const payload = { employeeId, key: QUICK_LINKS_PREF_KEY, value: JSON.stringify(pref) };
    this.http.postdata('Employeedata/save-user-preference', payload).subscribe({
      next: () => {
        this.quickLinksPreference.set(pref);
        options?.onSuccess?.();
      },
      error: (err) => {
        console.error('Failed to save quick links', err);
        options?.onError?.(err);
      }
    });
  }

  private normalizeQuickLinksPreference(raw: any): QuickLinksPreferenceV1 {
    const routes = Array.isArray(raw?.routes) ? raw.routes.filter((r: any) => typeof r === 'string') : [];
    return {
      schemaVersion: 1,
      routes
    };
  }
}
