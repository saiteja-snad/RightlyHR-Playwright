export type SetupWizardProgressAction = 'navigate' | 'next' | 'finish';

export type SetupWizardItemStatus = 'Pending' | 'InProgress' | 'Done';

export interface SetupWizardItemProgress {
  tabOrder: number;
  tabCode: string;
  tabName: string;
  status: SetupWizardItemStatus;
}

export interface SetupWizardProgressDto {
  headerId?: number;
  employeeId?: number;
  currentTab: string;
  nextTab: string | null;
  completedTabs: number;
  totalTabs: number;
  progressPercent: number;
  isCompleted: boolean;
  items: SetupWizardItemProgress[];
}

export interface SaveSetupWizardProgressRequest {
  action: SetupWizardProgressAction;
  completedTab?: string;
  currentTab?: string;
  nextTab?: string | null;
  progressPercentage?: number;
}

export interface SetupWizardProgressResponse {
  data?: SetupWizardProgressDto;
  success?: boolean;
}
