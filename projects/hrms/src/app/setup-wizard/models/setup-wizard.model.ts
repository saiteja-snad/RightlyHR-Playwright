export interface SetupWizardAccordion {
  id: string;
  label: string;
  sections: string[];
  optional?: boolean;
}

export interface SetupModule {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  completed: boolean;
  route: string;
  accordions: SetupWizardAccordion[];
}

export interface SetupWizardState {
  modules: SetupModule[];
  currentModuleIndex: number;
  isCompleted: boolean;
}

export type SetupWizardSectionKey =
  | 'location'
  | 'sub-location'
  | 'shifts'
  | 'holidays'
  | 'weekends'
  | 'policies'
  | 'department'
  | 'team'
  | 'salutation'
  | 'gender'
  | 'status'
  | 'maritalstatus'
  | 'degree'
  | 'jobrole'
  | 'jobtype'
  | 'probationstatus'
  | 'paytype'
  | 'grade'
  | 'compensation-reason'
  | 'org-hierarchy'
  | 'leave-category'
  | 'leave-allocation'
  | 'signature-authority';
