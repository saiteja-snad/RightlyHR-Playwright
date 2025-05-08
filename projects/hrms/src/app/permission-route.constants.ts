// permission-route.constants.ts
export const MY_INFO_PERSONAL_ROUTES = [
  { permission: 'My Info Basic Information.view', route: '/myinfo/personal/basic-info' },
  { permission: 'My Info Address Details.view', route: '/myinfo/personal/address-info' },
  { permission: 'My Info Contact Details.view', route: '/myinfo/personal/contact-details' },
  { permission: 'My Info Emergency Contact Details.view', route: '/myinfo/personal/emergency-contact-details' },
  { permission: 'My Info Education Details.view', route: '/myinfo/personal/education-details' },
  { permission: 'My Info Identity Details.view', route: '/myinfo/personal/identity-details' },
  { permission: 'My Info Family Details.view', route: '/myinfo/personal/family-details' },
  { permission: 'My Info Bank Details.view', route: '/myinfo/personal/bank-details' },
  { permission: 'My Info Visa Details.view', route: '/myinfo/personal/visa-details' }
];

export const MY_INFO_JOB_ROUTES = [
  { permission: 'My Info Pre-Onboarding Details.view', route: '/myinfo/job/pre-onboarding-details' },
  { permission: 'My Info Onboarding Details.view', route: '/myinfo/job/onboarding-details' },
  { permission: 'My Info Offboarding Details.view', route: '/myinfo/job/employmentType' },
  { permission: 'My Info Job Details.view', route: '/myinfo/job/job-details' },
  { permission: 'My Info Separation Request Details.view', route: '/myinfo/job/separation-details' },
  { permission: 'My Info No Due Clearance Details.view', route: '/myinfo/job/no-due-clearance-details' },
  { permission: 'My Info Probation Details.view', route: '/myinfo/job/probation-details' },
  { permission: 'My Info Previous Experience Details.view', route: '/myinfo/job/past-experiences' },
  { permission: 'My Info Certification Details.view', route: '/myinfo/job/certifications' },
  { permission: 'My Info Compensation Details.view', route: '/myinfo/job/compensation-details' },
  { permission: 'My Info Desk Details.view', route: '/myinfo/job/desk-details' },
  { permission: 'My Info Asset Details.view', route: '/myinfo/job/assets-details' }
];

export const MY_INFO_DOCUMENTS = [
  { permission: 'My Info Documents Tab.view', route: '/myinfo/documents' },
];

export const MY_INFO_TEAM_MEMBERS = [
  { permission: 'My Info Team Members Tab.view', route: '/myinfo/team-members' }
];

export const MY_INFO_ONBOARD_REQUEST = [
  { permission: 'My Info Onboard Request Tab.view', route: '/myinfo/onboarding-request' }
];


export const SETTINGS_EMPLOYEE_FIELDS_TABS = [
  {  route: '/settings/employee-fields/personal', permission:  'Personal Tab.view'  },
  {  route: '/settings/employee-fields/job', permission:  'Job Tab.view'  },
  {  route: '/settings/employee-fields/documents', permission:  'Document Tab.view'  },
  {  route: '/settings/employee-fields/manage-shifts', permission:  'Manage Shifts Tab.view'  },
  {  route: '/settings/employee-fields/manage-policies', permission:  'Manage Policies Tab.view'  },
  {  route: '/settings/employee-fields/manage-holidays', permission:  'Manage Holidays Tab.view'  },
  {  route: '/settings/employee-fields/manage-weekends', permission:  'Manage Weekends Tab.view' },
  {  route: '/settings/employee-fields/expenes', permission:  'Expense Tab.view' },
  {  route: '/settings/employee-fields/manage-dsts', permission:  'Manage DST Tab.view' },
  {  route: '/settings/employee-fields/no-due-clearnce', permission:  'NoDue Clearance Tab.view' } 
]

export const SETTINGS_ROLES_TABS = [
 
    { route: '/settings/roles-permissions/roles'},
    { route: '/settings/roles-permissions/permissions'},
    { route: '/settings/roles-permissions/role-assignee'}
 
]


export const SETTINGS_TIMEOFF_TABS = [
    { route: '/settings/timeoff-configurations/leave-categoery',permission: 'Leave Category Tab.view' } ,
    { route: '/settings/timeoff-configurations/leave-allocation',permission: 'Leave Allocation Tab.view' } ,
    { route: '/settings/timeoff-configurations/flexible-leave-allocation',permission: 'Flexible Leave Allocation Tab.view' } ,
    { route: '/settings/timeoff-configurations/eligibility-criterias',permission: 'Attendance Eligibility Criteria Tab.view' } ,
    { route: '/settings/timeoff-configurations/load-entitlements',permission: 'Load Entitlements Tab.view' } 
];


export const SETTINGS_ASSEST_CONFIGURATION_TABS = [
    { route: '/settings/assets-configuration/vendor-detiles',permission:'Vendor Details.view' } ,
    { route: '/settings/assets-configuration/asset-catagory',permission:'Asset Catagory.view' } ,
    { route: '/settings/assets-configuration/asset-subcatagory',permission:'Asset Sub Catagory.view' } 
];

export const SETTINGS_DYNAMIC_FORMS_TABS = [
    { route: '/settings/dynamic-forms/active-forms',permission:  'Active Forms.view' } ,
    { route: '/settings/dynamic-forms/inactive-forms',permission:  'Inactive Forms.view' } ,
    { route: '/settings/dynamic-forms/draft-forms',permission:  'Draft Forms.view' } ,
    { route: '/settings/dynamic-forms/form-settings',permission:  'Form Settings.view' } 
]

export const SETTINGS_EMPLOYEE_FIELDS_PERSONAL_TABS = [
    { route: '/settings/employee-fields/personal/salutation', permission:  'Salutation.view' } ,
    { route: '/settings/employee-fields/personal/status', permission:  'Status.view' } ,
    {  route: '/settings/employee-fields/personal/gender', permission:  'Gender.view' } ,
    {  route: '/settings/employee-fields/personal/maritalstatus', permission:  'Marital Status.view' } ,
    {  route: '/settings/employee-fields/personal/degree', permission:  'Degree.view' } ,
    {  route: '/settings/employee-fields/personal/visatype', permission:  'Visa Type.view' } ,
    {  route: '/settings/employee-fields/personal/identitytype', permission:  'Identity Type.view' } ,
    {  route: '/settings/employee-fields/personal/relationship', permission:  'Relationship.view' } ,
    {  route: '/settings/employee-fields/personal/bank-name', permission:  'Bank Names.view' } ,
]


export const STANDARD_REPORTS_TABS = [
    {  route: '/reports/standard-reports/employee-data',permission: 'Employee Master Data.view'} ,
    {  route: '/reports/standard-reports/job-data',permission: 'Job Location Wise Data.view'} ,
    {  route: '/reports/standard-reports/branch-data',permission: 'Branch Location Wise Data.view'} ,
    {  route: '/reports/standard-reports/family-data',permission: 'Family Members Data.view'} ,
]


export const ATTENDANCE_REPORTS_TABS = [
    {  route: '/reports/attendence-reports/leave-report', permission: 'Leave Report.view' } ,
    {  route: '/reports/attendence-reports/leave-summary-report',permission: 'Leave Summary Report.view' }  ,
    { route: '/reports/attendence-reports/compoff-report',permission: 'Comp Off Report.view' }  ,
    {  route: '/reports/attendence-reports/wfh-report',permission: 'WFH Report.view' } ,
    { route: '/reports/attendence-reports/absent-report',permission: 'Absent Report.view' } ,
    {  route: '/reports/attendence-reports/inactive-employee-report',permission: 'Inactive Empolyee Report.view' } ,
    {  route: '/reports/attendence-reports/yearly-summary-report',permission: 'Yearly Summary Report.view' } ,
    {  route: '/reports/attendence-reports/permission-report',permission: 'Permission Report.view' } ,
    {  route: '/reports/attendence-reports/regularization-report',permission: 'Regularization Report.view' } 
];

export const ASSEST_ALLOCATION_TABS = [
    { route: '/assets-management/all-assets', permission:  'Asset Allocation - All.view'} ,
    { route: '/assets-management/available-assets',permission:  'Asset Allocation - Available.view'} ,
    { route: '/assets-management/allocated-assets', permission:  'Asset Allocation - Allocated.view'} ,
    { route: '/assets-management/under-maintenance-assets',permission:  'Asset Allocation - Under Maintenance.view'} ,
    { route: '/assets-management/inactive-assets',permission:  'Asset Allocation - Inactive.view'} ,
];


export const DESK_ALLOCATION_TABS = [
    {  route: '/desk/management/all-desks', permission:  'Desk Allocation - All.view' } ,
    {  route: '/desk/management/available-desks', permission:  'Desk Allocation - Available.view' } ,
    {  route: '/desk/management/allocated-desk', permission:  'Desk Allocation - Allocated.view' } ,
    {  route: '/desk/management/under-maintenance-desk', permission:  'Desk Allocation - Under Maintenance.view' } ,
    {  route: '/desk/management/inactive-desk', permission:  'Desk Allocation - Inactive.view' } ,
    {  route: '/desk/management/waiting-for-approval-desks', permission:  'Desk Allocation - Waiting For Approval.view' } 
]

export const EXPENSE_TABS  = [
    { route: '/claimsandexpenses/expenses/draft', permission:'Draft Tab.view'} ,
    { route: '/claimsandexpenses/expenses/approved', permission:'Approved Tab.view'},
    { route: '/claimsandexpenses/expenses/pending', permission:'Pending Tab.view'},
    { route: '/claimsandexpenses/expenses/processed', permission:'Processed Tab.view'},
    { route: '/claimsandexpenses/expenses/rejected', permission:'Rejected Tab.view'}
]