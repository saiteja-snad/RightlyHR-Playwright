import { Injectable, inject, signal, computed } from '@angular/core';
import { Observable, tap, catchError, of, map, finalize } from 'rxjs';
import { SetupWizardState } from '../models/setup-wizard.model';
import { SETUP_MODULES } from '../models/setup-wizard.constants';
import {
  SaveSetupWizardProgressRequest,
  SetupWizardItemProgress,
  SetupWizardItemStatus,
  SetupWizardProgressDto,
  SetupWizardProgressResponse
} from '../models/setup-wizard-progress.model';
import { HttpService } from '../../services/http.service';
import { clearLegacySetupWizardProgress } from '../utils/setup-wizard-storage.util';

const PROGRESS_API = 'SetupWizard';

@Injectable({ providedIn: 'root' })
export class SetupWizardService {
  private readonly http = inject(HttpService);

  private state = signal<SetupWizardState>({
    modules: SETUP_MODULES.map(m => ({ ...m })),
    currentModuleIndex: 0,
    isCompleted: false
  });

  /** Latest progress returned from (or sent to) the API for the current session. */
  private lastProgress = signal<SetupWizardProgressDto | null>(null);

  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly isSaving = signal(false);
  readonly saveError = signal<string | null>(null);

  readonly modules = computed(() => this.state().modules);
  readonly currentModuleIndex = computed(() => this.state().currentModuleIndex);
  readonly isCompleted = computed(() => this.state().isCompleted);

  readonly completedCount = computed(() =>
    this.state().modules.filter(m => m.completed).length
  );

  readonly totalCount = computed(() => this.state().modules.length);

  readonly progressPercent = computed(() => {
    const total = this.totalCount();
    if (!total) {
      return 0;
    }
    return Math.round((this.completedCount() / total) * 100);
  });

  readonly currentModule = computed(() =>
    this.state().modules[this.state().currentModuleIndex] ?? this.state().modules[0]
  );

  readonly firstIncompleteModule = computed(() =>
    this.state().modules.find(m => !m.completed) ?? this.state().modules[0]
  );

  readonly currentTabRoute = computed(() =>
    this.state().modules[this.state().currentModuleIndex]?.route ?? SETUP_MODULES[0].route
  );

  loadProgress(): Observable<SetupWizardProgressDto | null> {
    this.isLoading.set(true);
    this.loadError.set(null);

    return this.http.getData(PROGRESS_API).pipe(
      map(response => this.unwrapProgress(response)),
      tap(progress => {
        if (progress) {
          this.applyProgress(progress);
        } else {
          this.resetAll();
          this.lastProgress.set(null);
        }
      }),
      catchError(() => {
        this.loadError.set('Unable to load setup wizard progress.');
        return of(null);
      }),
      finalize(() => this.isLoading.set(false))
    );
  }

  saveProgress(request: SaveSetupWizardProgressRequest): Observable<SetupWizardProgressDto | null> {
    this.isSaving.set(true);
    this.saveError.set(null);
    const optimisticProgress = this.buildProgressFromRequest(request);

    if (optimisticProgress) {
      this.applyProgress(optimisticProgress);
    }

    const payload: SaveSetupWizardProgressRequest = {
      ...request,
      progressPercentage: optimisticProgress?.progressPercent ?? this.progressPercent()
    };

    return this.http.putData(PROGRESS_API, payload).pipe(
      map(response => this.unwrapProgress(response)),
      tap(progress => {
        if (progress) {
          this.applyProgress(this.mergeProgressResponse(progress, request, optimisticProgress));
        }
      }),
      catchError(() => {
        this.saveError.set('Unable to save setup wizard progress.');
        return of(optimisticProgress);
      }),
      finalize(() => this.isSaving.set(false))
    );
  }

  navigateToTab(tabIndex: number): Observable<SetupWizardProgressDto | null> {
    const modules = this.state().modules;
    const currentModule = modules[tabIndex];
    if (!currentModule) {
      return of(null);
    }

    const nextModule = modules[tabIndex + 1];

    return this.saveProgress({
      action: 'navigate',
      currentTab: currentModule.route,
      nextTab: nextModule?.route ?? null
    });
  }

  completeTabAndGoNext(completedIndex: number): Observable<SetupWizardProgressDto | null> {
    const modules = this.state().modules;
    const completedModule = modules[completedIndex];
    const nextModule = modules[completedIndex + 1];

    if (!completedModule || !nextModule) {
      return of(null);
    }

    return this.saveProgress({
      action: 'next',
      completedTab: completedModule.route,
      currentTab: nextModule.route,
      nextTab: modules[completedIndex + 2]?.route ?? null
    });
  }

  finishWizard(completedIndex: number): Observable<SetupWizardProgressDto | null> {
    const completedModule = this.state().modules[completedIndex];
    if (!completedModule) {
      return of(null);
    }

    return this.saveProgress({
      action: 'finish',
      completedTab: completedModule.route
    });
  }

  syncCurrentTab(index: number): void {
    const currentModule = this.state().modules[index];
    if (!currentModule) {
      return;
    }

    const cached = this.lastProgress();
    if (cached?.items?.length) {
      const items = cached.items.map(item => ({
        ...item,
        status: this.resolveItemStatus(item, currentModule.route)
      }));
      this.applyProgress({ ...cached, currentTab: currentModule.route, items });
      return;
    }

    this.state.update(current => ({
      ...current,
      currentModuleIndex: index
    }));
  }

  getModuleIndexByRoute(route: string): number {
    return this.state().modules.findIndex(m => m.route === route);
  }

  applyProgress(progress: SetupWizardProgressDto): void {
    const normalized = this.ensureProgressShape(progress);
    const itemStatusByCode = new Map(
      normalized.items.map(item => [item.tabCode, item.status])
    );

    const modules = SETUP_MODULES.map(module => ({
      ...module,
      completed: itemStatusByCode.get(module.route) === 'Done'
    }));

    const currentIndex = modules.findIndex(m => m.route === normalized.currentTab);
    const completedTabs = modules.filter(module => module.completed).length;
    const totalTabs = normalized.totalTabs || SETUP_MODULES.length;
    const progressPercent = Math.round((completedTabs / totalTabs) * 100);
    const isCompleted = normalized.isCompleted || completedTabs >= totalTabs;

    this.state.set({
      modules,
      currentModuleIndex: currentIndex >= 0 ? currentIndex : 0,
      isCompleted
    });

    this.lastProgress.set({
      ...normalized,
      completedTabs,
      totalTabs,
      progressPercent,
      isCompleted
    });
  }

  setCurrentModule(index: number): void {
    this.state.update(s => ({ ...s, currentModuleIndex: index }));
  }

  resetAll(): void {
    this.state.set({
      modules: SETUP_MODULES.map(m => ({ ...m })),
      currentModuleIndex: 0,
      isCompleted: false
    });
    this.lastProgress.set(null);
  }

  clearProgress(): void {
    clearLegacySetupWizardProgress();
    this.resetAll();
  }

  markWizardCompleted(): void {
    const items: SetupWizardItemProgress[] = SETUP_MODULES.map((module, index) => ({
      tabOrder: index + 1,
      tabCode: module.route,
      tabName: module.title,
      status: 'Done'
    }));

    this.applyProgress({
      currentTab: SETUP_MODULES[SETUP_MODULES.length - 1].route,
      nextTab: null,
      completedTabs: SETUP_MODULES.length,
      totalTabs: SETUP_MODULES.length,
      progressPercent: 100,
      isCompleted: true,
      items
    });
  }

  private unwrapProgress(
    response: SetupWizardProgressResponse | SetupWizardProgressDto | Record<string, unknown>
  ): SetupWizardProgressDto | null {
    if (!response) {
      return null;
    }

    const raw = ('data' in response && response.data ? response.data : response) as Record<string, unknown>;
    return this.normalizeProgress(raw);
  }

  private normalizeProgress(raw: Record<string, unknown>): SetupWizardProgressDto | null {
    if (!raw || Object.keys(raw).length === 0) {
      return null;
    }

    const currentTab = String(raw['currentTab'] ?? raw['CurrentTab'] ?? SETUP_MODULES[0].route);
    const itemsRaw = (raw['items'] ?? raw['Items']) as Record<string, unknown>[] | undefined;

    const items: SetupWizardItemProgress[] = Array.isArray(itemsRaw) && itemsRaw.length > 0
      ? itemsRaw.map(item => ({
          tabOrder: Number(item['tabOrder'] ?? item['TabOrder'] ?? 0),
          tabCode: String(item['tabCode'] ?? item['TabCode'] ?? ''),
          tabName: String(item['tabName'] ?? item['TabName'] ?? ''),
          status: (item['status'] ?? item['Status'] ?? 'Pending') as SetupWizardItemStatus
        }))
      : this.createDefaultItems(currentTab);

    const completedTabs = items.filter(item => item.status === 'Done').length;
    const totalTabs = Number(raw['totalTabs'] ?? raw['TotalTabs'] ?? SETUP_MODULES.length);
    const progressPercent = Number(
      raw['progressPercentage']
      ?? raw['ProgressPercentage']
      ?? raw['progressPercent']
      ?? raw['ProgressPercent']
      ?? Math.round((completedTabs / totalTabs) * 100)
    );

    return {
      headerId: Number(raw['headerId'] ?? raw['HeaderId'] ?? 0) || undefined,
      employeeId: Number(raw['employeeId'] ?? raw['EmployeeId'] ?? 0) || undefined,
      currentTab,
      nextTab: (raw['nextTab'] ?? raw['NextTab'] ?? null) as string | null,
      completedTabs,
      totalTabs,
      progressPercent,
      isCompleted: Boolean(raw['isCompleted'] ?? raw['IsCompleted'] ?? completedTabs >= totalTabs),
      items
    };
  }

  private resolveItemStatus(
    item: SetupWizardItemProgress,
    activeRoute: string
  ): SetupWizardItemStatus {
    if (item.status === 'Done') {
      return 'Done';
    }

    return item.tabCode === activeRoute ? 'InProgress' : item.status;
  }

  private ensureProgressShape(progress: SetupWizardProgressDto): SetupWizardProgressDto {
    if (progress.items?.length) {
      return progress;
    }

    return {
      ...progress,
      items: this.createDefaultItems(progress.currentTab),
      totalTabs: progress.totalTabs || SETUP_MODULES.length
    };
  }

  private createDefaultItems(currentTab: string): SetupWizardItemProgress[] {
    return SETUP_MODULES.map((module, index) => ({
      tabOrder: index + 1,
      tabCode: module.route,
      tabName: module.title,
      status: module.route === currentTab ? 'InProgress' : 'Pending'
    }));
  }

  private getExistingItems(): SetupWizardItemProgress[] {
    const cached = this.lastProgress();

    if (cached?.items?.length) {
      return cached.items.map(item => ({ ...item }));
    }

    const { modules, currentModuleIndex } = this.state();

    return SETUP_MODULES.map((module, index) => ({
      tabOrder: index + 1,
      tabCode: module.route,
      tabName: module.title,
      status: modules[index]?.completed
        ? 'Done'
        : index === currentModuleIndex
          ? 'InProgress'
          : 'Pending'
    }));
  }

  private mergeProgressResponse(
    progress: SetupWizardProgressDto,
    request: SaveSetupWizardProgressRequest,
    optimistic: SetupWizardProgressDto | null
  ): SetupWizardProgressDto {
    const fromRequest = optimistic ?? this.buildProgressFromRequest(request);

    if (request.action === 'finish') {
      return {
        ...progress,
        ...(fromRequest ?? {}),
        isCompleted: true,
        currentTab: SETUP_MODULES[SETUP_MODULES.length - 1].route,
        nextTab: null,
        items: fromRequest?.items?.length ? fromRequest.items : progress.items
      };
    }

    if (request.currentTab && fromRequest) {
      return {
        ...progress,
        currentTab: request.currentTab,
        nextTab: request.nextTab ?? progress.nextTab,
        completedTabs: fromRequest.completedTabs,
        progressPercent: fromRequest.progressPercent,
        isCompleted: fromRequest.isCompleted,
        items: fromRequest.items
      };
    }

    return progress;
  }

  private buildProgressFromRequest(request: SaveSetupWizardProgressRequest): SetupWizardProgressDto | null {
    const items = this.getExistingItems();

    if (request.action === 'next' && request.completedTab) {
      const completedItem = items.find(item => item.tabCode === request.completedTab);
      if (completedItem) {
        completedItem.status = 'Done';
      }

      const nextItem = items.find(item => item.tabCode === request.currentTab);
      if (nextItem) {
        nextItem.status = 'InProgress';
      }
    } else if (request.action === 'finish') {
      items.forEach(item => {
        item.status = 'Done';
      });
    } else if (request.action === 'navigate' && request.currentTab) {
      items.forEach(item => {
        item.status = this.resolveItemStatus(item, request.currentTab!);
      });
    }

    const currentTab = request.action === 'finish'
      ? SETUP_MODULES[SETUP_MODULES.length - 1].route
      : request.currentTab
        ?? this.state().modules[this.state().currentModuleIndex]?.route
        ?? SETUP_MODULES[0].route;
    const completedTabs = request.action === 'finish'
      ? SETUP_MODULES.length
      : items.filter(item => item.status === 'Done').length;
    const totalTabs = SETUP_MODULES.length;
    const progressPercent = request.action === 'finish'
      ? 100
      : Math.round((completedTabs / totalTabs) * 100);

    return {
      currentTab,
      nextTab: request.nextTab ?? null,
      completedTabs,
      totalTabs,
      progressPercent,
      isCompleted: request.action === 'finish',
      items
    };
  }
}
