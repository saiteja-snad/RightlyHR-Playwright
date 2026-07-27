import { SetupModule } from './setup-wizard.model';

export const SETUP_MODULES: SetupModule[] = [
  {
    id: 1,
    title: 'Module 1',
    subtitle: 'Via Employee Fields',
    category: 'EMPLOYEE FIELDS',
    completed: false,
    route: 'module-1'
  },
  {
    id: 2,
    title: 'Module 2',
    subtitle: 'Via Time Off',
    category: 'TIME OFF',
    completed: false,
    route: 'module-2'
  },
  {
    id: 3,
    title: 'Module 3',
    subtitle: 'Via Roles',
    category: 'ROLES',
    completed: false,
    route: 'module-3'
  },
  {
    id: 4,
    title: 'Module 4',
    subtitle: 'Via PMS',
    category: 'PMS',
    completed: false,
    route: 'module-4'
  }
];
