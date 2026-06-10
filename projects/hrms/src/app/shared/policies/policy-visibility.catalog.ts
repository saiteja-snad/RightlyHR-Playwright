export interface PolicyVisibilitySubModuleOption {
  key: string;
  label: string;
}

export interface PolicyVisibilityModuleOption {
  key: string;
  label: string;
  subModules: PolicyVisibilitySubModuleOption[];
}

export const POLICY_VISIBILITY_MODULES: PolicyVisibilityModuleOption[] = [
  {
    key: 'time-off',
    label: 'Time Off',
    subModules: [
      { key: 'leaves', label: 'Leaves' },
      { key: 'holidays', label: 'Holidays' },
      { key: 'comp-off', label: 'Comp Off' },
      { key: 'wfh', label: 'WFH' },
      { key: 'premissions', label: 'Permissions' },
    ]
  },
  {
    key: 'payroll',
    label: 'Payroll',
    subModules: []
  },
  {
    key: 'assets',
    label: 'Assets',
    subModules: []
  },
  {
    key: 'project-management',
    label: 'Project Management',
    subModules: []
  }
];

