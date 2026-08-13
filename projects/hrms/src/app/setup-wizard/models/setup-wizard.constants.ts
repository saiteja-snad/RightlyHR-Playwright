import { SetupModule } from './setup-wizard.model';

export const SETUP_MODULES: SetupModule[] = [
  {
    id: 1,
    title: 'Location & Shifts',
    subtitle: 'Configure locations, sub locations and shifts',
    category: 'ORG SETUP',
    completed: false,
    route: 'location-shifts',
    accordions: [
      { id: 'location', label: 'Location', sections: ['location'] },
      { id: 'sub-location', label: 'Sub Location', sections: ['sub-location'] },
      { id: 'shifts', label: 'Shifts', sections: ['shifts'] }
    ]
  },
  {
    id: 2,
    title: 'Calendar & Policies',
    subtitle: 'Configure holidays, weekends and policies',
    category: 'CALENDAR',
    completed: false,
    route: 'calendar-policies',
    accordions: [
      { id: 'holidays', label: 'Holidays', sections: ['holidays'] },
      { id: 'weekends', label: 'Weekends', sections: ['weekends'] },
      { id: 'policies', label: 'Policies', sections: ['policies'], optional: true }
    ]
  },
  {
    id: 3,
    title: 'Department & Team',
    subtitle: 'Configure departments and teams',
    category: 'ORG STRUCTURE',
    completed: false,
    route: 'department-team',
    accordions: [
      { id: 'department', label: 'Department', sections: ['department'] },
      { id: 'team', label: 'Team', sections: ['team'] }
    ]
  },
  {
    id: 4,
    title: 'Employee Configuration',
    subtitle: 'Configure employee master data, job details and compensation',
    category: 'EMPLOYEE FIELDS',
    completed: false,
    route: 'employee-config',
    accordions: [
      {
        id: 'employee-master-data',
        label: 'Employee Master Data',
        sections: ['salutation', 'gender', 'status', 'maritalstatus', 'degree']
      },
      {
        id: 'job-details',
        label: 'Job Details',
        sections: ['jobrole', 'jobtype', 'probationstatus']
      },
      {
        id: 'compensation',
        label: 'Compensation',
        sections: ['paytype', 'grade', 'compensation-reason']
      }
    ]
  },
  {
    id: 5,
    title: 'Org Hierarchy',
    subtitle: 'Review and configure organization hierarchy',
    category: 'ORG HIERARCHY',
    completed: false,
    route: 'org-hierarchy',
    accordions: [
      { id: 'org-hierarchy', label: 'Org Hierarchy', sections: ['org-hierarchy'] }
    ]
  },
  {
    id: 6,
    title: 'Leaves',
    subtitle: 'Configure leave categories and allocation',
    category: 'TIME OFF',
    completed: false,
    route: 'leaves',
    accordions: [
      { id: 'leave-category', label: 'Leave Category', sections: ['leave-category'] },
      { id: 'leave-allocation', label: 'Leave Allocation', sections: ['leave-allocation'] }
    ]
  },
  {
    id: 7,
    title: 'Signature Authorities',
    subtitle: 'Configure signature authorities',
    category: 'SIGNATURE',
    completed: false,
    route: 'signature-authorities',
    accordions: [
      { id: 'signature-authority', label: 'Signature Authority', sections: ['signature-authority'] }
    ]
  }
];
