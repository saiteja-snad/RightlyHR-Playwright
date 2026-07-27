export interface SetupModule {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  completed: boolean;
  route: string;
}

export interface SetupWizardState {
  modules: SetupModule[];
  currentModuleIndex: number;
  isCompleted: boolean;
}
