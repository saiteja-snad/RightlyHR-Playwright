import { Injectable, signal, computed } from '@angular/core';
import { SetupModule, SetupWizardState } from '../models/setup-wizard.model';
import { SETUP_MODULES } from '../models/setup-wizard.constants';

@Injectable({ providedIn: 'root' })
export class SetupWizardService {
  private state = signal<SetupWizardState>({
    modules: SETUP_MODULES.map(m => ({ ...m })),
    currentModuleIndex: 0,
    isCompleted: false
  });

  readonly modules = computed(() => this.state().modules);
  readonly currentModuleIndex = computed(() => this.state().currentModuleIndex);
  readonly isCompleted = computed(() => this.state().isCompleted);

  readonly completedCount = computed(() =>
    this.state().modules.filter(m => m.completed).length
  );

  readonly totalCount = computed(() => this.state().modules.length);

  readonly progressPercent = computed(() =>
    Math.round((this.completedCount() / this.totalCount()) * 100)
  );

  readonly firstIncompleteModule = computed(() =>
    this.state().modules.find(m => !m.completed) ?? this.state().modules[0]
  );

  markModuleComplete(index: number): void {
    this.state.update(s => {
      const modules = s.modules.map((m, i) =>
        i === index ? { ...m, completed: true } : m
      );
      const isCompleted = modules.every(m => m.completed);
      return { ...s, modules, isCompleted };
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
  }
}
