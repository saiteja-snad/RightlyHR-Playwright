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
  
  type SettingsRolesTab = {
    route: string;
    permission?: string;
  };
  
  export const SETTINGS_ROLES_TABS: SettingsRolesTab[] = [
   
      { route: '/settings/roles-permissions/roles', permission: 'Role Tab.view' } ,
      { route: '/settings/roles-permissions/permissions'},
      { route: '/settings/roles-permissions/role-assignee', permission: 'Assignee Tab.view' } ,
   
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
  
  export const TIME_OFF_TABS =[
      { route: '/time-off/leaves', permission: 'Time Off Tab.view' },
      { route: '/time-off/remote', permission: 'Remote Login Tab.view' },
  ]

  export const TIME_OFF_SUB_TABS = [
  
    {route: '/time-off/leaves/waiting-for-approval',permission:'Waiting For Approval (Time Off).view'},
    {route: '/time-off/leaves/approved',permission: 'Approved (Time Off).view'},
    {route: '/time-off/leaves/processed',permission: 'Processed (Time Off).view'},
    {route: '/time-off/leaves/rejected',permission: 'Rejected (Time Off).view',},
  
  ]
  
  export const REMOTE_LOGIN_SUB_TABS =[
    {route: '/time-off/remote/waiting-for-approval',permission:'Remote Login.view'},
    {route: '/time-off/remote/approved',permission: 'Remote Login.view'},
    {route: '/time-off/remote/processed',permission: 'Remote Login.view'},
    {route: '/time-off/remote/rejected',permission: 'Remote Login.view',},
  ]
  
  export const COMP_OFF_SUB_TABS = [
    {route: '/time-off/comp-off/waiting-for-approval',permission:'Waiting For Approval (Comp Off).view'},
    {route: '/time-off/comp-off/approved',permission: 'Approved (Comp Off).view'},
    {route: '/time-off/comp-off/processed',permission: 'Processed (Comp Off).view'},
    {route: '/time-off/comp-off/rejected',permission: 'Rejected (Comp Off).view',},
  ]
  
  export const WFH_ONDUTY_SUB_TABS =[
    {route: '/time-off/wfh/waiting-for-approval',permission:'Waiting For Approval (WFH).view'},
    {route: '/time-off/wfh/approved',permission: 'Approved (WFH).view'},
    {route: '/time-off/wfh/processed',permission: 'Processed (WFH).view'},
    {route: '/time-off/wfh/rejected',permission: 'Rejected (WFH).view',},
  ]
  
  export const PERMISSIONS_SUB_TABS =[
    {route: '/time-off/premissions/waiting-for-approval',permission:'Waiting For Approval (Permissions).view'},
    {route: '/time-off/permissions/approved',permission: 'Approved (Permissions).view'}, 
    {route: '/time-off/permissions/processed',permission: 'Processed (Permissions).view'},
    {route: '/time-off/permissions/rejected',permission: 'Rejected (Permissions).view',},
  ]
  
  export const REGULARIZATION_SUB_TABS =[
    {route: '/time-off/regularization/waiting-for-approval',permission:'Waiting For Approval (Regularization).view'},
    {route: '/time-off/regularization/approved',permission: 'Approved (Regularization).view'}, 
    {route: '/time-off/regularization/processed',permission: 'Processed (Regularization).view'},
    {route: '/time-off/regularization/rejected',permission: 'Rejected (Regularization).view',},
  ]
  
  export const ON_BEHALF_OF_TABS =[
    {route: '/time-off/on-behalf-of/waiting-for-approval',permission:'Waiting For Approval (On Behalf Of).view'},
    {route: '/time-off/on-behalf-of/approved',permission: 'Approved (On Behalf Of).view'}, 
    {route: '/time-off/on-behalf-of/processed',permission: 'Processed (On Behalf Of).view'},
    {route: '/time-off/on-behalf-of/rejected',permission: 'Rejected (On Behalf Of).view',},
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
      { route: '/assets-management/all-assets', permission:  'Asset Management - All.view'} ,
      { route: '/assets-management/available-assets',permission:  'Asset Management - Available.view'} ,
      { route: '/assets-management/allocated-assets', permission:  'Asset Management - Allocated.view'} ,
      { route: '/assets-management/under-maintenance-assets',permission:  'Asset Management - Under Maintenance.view'} ,
      { route: '/assets-management/inactive-assets',permission:  'Asset Management - Inactive.view'} ,
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
  
  
  export const IT_SUPPORT_TEAM_TICKETS_TABS = [
      {  route: '/it-support/team-tickets/all-tickets', permission:'All Tickets Tab.view' } ,
      {  route: '/it-support/team-tickets/open-tickets', permission:'Open Tickets Tab.view' } ,
      {  route: '/it-support/team-tickets/await-on-user-tickets',  permission: 'Await On User Tickets Tab.view' } ,
      {  route: '/it-support/team-tickets/solved-tickets',  permission: 'Solved Tickets Tab.view' } ,
      {  route: '/it-support/team-tickets/rejected-tickets',  permission: 'Rejected Tickets Tab.view' } 
  ]
  
  export const PENDING_APPROVALS_TABS=[
    { route: '/time-off/pending-approvals/time-off-request', permission: 'Time Off Tab.view' },
    { route: 'time-off/pending-approvals/wfh', permission: 'WFH Tab.view' },
    { route: '/time-off/pending-approvals/comp-off', permission: 'Comp Off Tab.view' },
    { route: '/time-off/pending-approvals/permissions', permission: 'Permissions Tab.view' },
    { route: '/time-off/pending-approvals/regularization-request', permission: 'Regularization Tab.view' },
    { route: '/time-off/pending-approvals/separation-request', permission: 'Seperation Request Tab.view' },
    { route: '/time-off/pending-approvals/recall-request', permission: 'Recall Request Tab.view' },
    { route: '/time-off/pending-approvals/trainee-approvals', permission: 'Trainee Details Tab.view' },
    { route: '/time-off/pending-approvals/nodue-request', permission: 'No Due Clearence Requests Tab.view' },
    { route: '/time-off/pending-approvals/claimsandexpenses-request', permission: 'Claims and Expenses Tab.view' },
    { route: '/time-off/pending-approvals/desk-approval', permission: 'Desk Requests Tab.view' },
    { route: '/time-off/pending-approvals/probation-request', permission: 'Probation Details Tab.view' },
  ]
  
  export const PENDING_APPROVALS_TIME_OFF_SUB_TABS =[
    {route: '/time-off/pending-approvals/time-off-request/for-you', permission: 'For You (Time Off).view'},
    {route: '/time-off/pending-approvals/time-off-request/for-your-role', permission: 'For Role (Time Off).view'},  
  ]
  
  export const PENDING_APPROVALS_WFH_SUB_TABS =[
    {route: '/time-off/pending-approvals/wfh/for-you', permission: 'For You (WFH).view'},
    {route: '/time-off/pending-approvals/wfh/for-your-role', permission: 'For Role (WFH).view'},  
  ]
  
  export const PENDING_APPROVALS_COMP_OFF_SUB_TABS =[
    {route: '/time-off/pending-approvals/comp-off/for-you', permission: 'For You (Comp Off).view'},
    {route: '/time-off/pending-approvals/comp-off/for-your-role', permission: 'For Role (Comp Off).view'},  
  ]
  
  export const PENDING_APPROVALS_PERMISSIONS_SUB_TABS = [
    {route: '/time-off/pending-approvals/permissions/for-you', permission: 'For You (Permissions).view'},
    {route: '/time-off/pending-approvals/permissions/for-your-role', permission: 'For Role (Permissions).view'},  
  ]
  
  export const PENDING_APPROVALS_REGULARIZATION_SUB_TABS =[
    {route: '/time-off/pending-approvals/regularization-request/for-you', permission: 'For You (Regularization).view'},
    {route: '/time-off/pending-approvals/regularization-request/for-your-role', permission: 'For Role (Regularization).view'},
  ]
  
  export const SEPARATION_REQUEST_SUB_TABS =[
    {route: '/time-off/pending-approvals/separation-request/separation-for-you', permission: 'For You (Seperation Request).view'},
    {route: '/time-off/pending-approvals/separation-request/separation-for-role', permission: 'For Role (Seperation Request).view'},
  ]
  
  export const RECALL_REQUEST_SUB_TABS =[
    {route: '/time-off/pending-approvals/recall-request/recall-for-you', permission: 'For You (Recall Request).view'},
    {route: '/time-off/pending-approvals/recall-request/recall-for-role', permission: 'For Role (Recall Request).view'},
  ]
  
  export const EXPENSES_REQUEST_SUB_TABS =[
    {route: '/time-off/pending-approvals/claimsandexpenses-request/for-you', permission: 'For You (Claims and Expenses).view'},
    {route: '/time-off/pending-approvals/claimsandexpenses-request/for-your-role', permission: 'For Role (Claims and Expenses).view'},
  ]
  
  export const DESK_REQUEST_SUB_TABS =[
    {route: '/time-off/pending-approvals/desk-approval/for-you', permission: 'For You (Desk Requests).view'},
    {route: '/time-off/pending-approvals/desk-approval/for-your-role', permission: 'For Role (Desk Requests).view'},
  ]
  
  export const SETTINGS_MAIN_HEADER_TABS = [
    { label: 'Employee Fields', route: '/settings/employee-fields', permission: { feature: 'Employee Fields Module', action: 'view' } },
    { label: 'Roles', route: '/settings/roles-permissions'},
    { label: 'Time Off', route: '/settings/timeoff-configurations', permission: { feature: 'Settings Timeoff Module', action: 'view' } },
    { label: 'Asset Configuration', route: '/settings/assets-configuration', permission: { feature: 'Assets Management Configuration Module', action: 'view' } },
    { label: 'Dynamic Forms', route: '/settings/dynamic-forms', permission: { feature: 'Dynamic Forms Module', action: 'view' } }
  ]
  
  export const SETTINGS_TIMEOFF_LEAVE_CATEGORY_TABS = [
    { route: '/settings/timeoff-configurations/leave-categoery/pendingleavecategory', permission: 'Leave Category Pending Tab.view' } ,
    { route: '/settings/timeoff-configurations/leave-categoery/publishedleavecategory', permission: 'Leave Category Published Tab.view' } 
  ]
  
  export const ATTENDANCE_ELIGIBILITY_CRITERIA_TABS = [
    { route: '/settings/timeoff-configurations/eligibility-criterias/comp-off', permission: 'Comp Off Entitlement Tab.view' } ,
    { route: '/settings/timeoff-configurations/eligibility-criterias/wfh', permission: 'WFH Entitlement Tab.view' } ,
    { route: '/settings/timeoff-configurations/eligibility-criterias/permissions', permission: 'Attendance Eligibility Permissions Tab.view' } ,
    { route: '/settings/timeoff-configurations/eligibility-criterias/permissions-eligibility-criteria', permission: 'Permission Elgibility Tab.view' } ,
    { route: '/settings/timeoff-configurations/eligibility-criterias/global-permissions', permission: 'Eligibility Global Permissions Tab.view' } ,
    { route: '/settings/timeoff-configurations/eligibility-criterias/attendance-regularization-types', permission: 'Attendance Regularization Tab.view' } ,
    { route: '/settings/timeoff-configurations/eligibility-criterias/attendance-regularization-eligibility-criteria', permission: 'Attendance Regularization Eligibility Tab.view' } 
  ]
  
  
  export const SETTINGS_EMPLOYEE_FIELDS_JOB_TABS = [
    {route: '/settings/employee-fields/job/jobrole', permission: 'Job Role.view' },
    {route: '/settings/employee-fields/job/jobtype', permission: 'Job Type.view' },
    {route: '/settings/employee-fields/job/probationstatus', permission: 'Probation Status.view' },
    {route: '/settings/employee-fields/job/backgroundcheck', permission: 'Background check Status.view' },
    {route: '/settings/employee-fields/job/notice', permission: 'Notice Period.view' },
    {route: '/settings/employee-fields/job/frequency', permission: 'Frequency.view' },
    {route: '/settings/employee-fields/job/paytype', permission: 'Paytype.view' },
    {route: '/settings/employee-fields/job/overtime', permission: 'Overtime Eligibility.view' },
    {route: '/settings/employee-fields/job/bussinesarea', permission: 'Business Area.view' },
    {route: '/settings/employee-fields/job/termination', permission: 'Termination Reason.view' },
    {route: '/settings/employee-fields/job/eligible-for-rehire', permission: 'Eligible For Rehire.view' },
    {route: '/settings/employee-fields/job/department', permission: 'Department.view' },
    {route: '/settings/employee-fields/job/team', permission: 'Team.view' },
    {route: '/settings/employee-fields/job/grade', permission: 'Grade Details.view' },
    {route: '/settings/employee-fields/job/compensation-reason', permission: 'Compensation Reason.view' },
    {route: '/settings/employee-fields/job/location', permission: 'Location.view' },
    {route: '/settings/employee-fields/job/sub-location', permission: 'Sub Location.view' },
    {route: '/settings/employee-fields/job/pre-on-boarding-documents', permission: 'Pre Onboard Documents.view' },
    {route: '/settings/employee-fields/job/serving-period', permission: 'Serving Period.view' },
    {route: '/settings/employee-fields/job/probation-details', permission: 'Job Tab Probation Details.view' },
    {route: '/settings/employee-fields/job/interview-round', permission: 'Interview Round.view' }
  ]
  
  export const SETTINGS_EMPLOYEE_FIELDS_MANAGE_SHIFTS_TABS = [
    { route: '/settings/employee-fields/manage-shifts/pending-for-submit', permission: 'Shifts Pending Tab.view' },
    { route: '/settings/employee-fields/manage-shifts/published-shifts', permission: 'Shifts Published Tab.view' }
  ]
  
  export const SETTINGS_EMPLOYEE_FIELDS_MANAGE_POLICIES_TABS = [
    { route: '/settings/employee-fields/manage-policies/pending-for-submit', permission: 'Policies Pending Tab.view' },
    { route: '/settings/employee-fields/manage-policies/published-policies', permission: 'Policies Published Tab.view' }
  ]
  
  export const SETTINGS_EMPLOYEE_FIELDS_MANAGE_HOLIDAYS_TABS = [
    { route: '/settings/employee-fields/manage-holidays/pending-for-submit', permission: 'Holidays Pending Tab.view' },
    { route: '/settings/employee-fields/manage-holidays/published-holidays', permission: 'Holidays Published Tab.view' }
  ]
  
  export const SETTINGS_EMPLOYEE_FIELDS_MANAGE_WEEKENDS_TABS = [
    { route: '/settings/employee-fields/manage-weekends/pending-for-submission', permission: 'Weekends Pending Tab.view' },
    { route: '/settings/employee-fields/manage-weekends/published-weekends', permission: 'Weekends Published Tab.view' }
  ]
  
  export const SETTINGS_EMPLOYEE_FIELDS_EXPENSES_TABS = [
    { route: '/settings/employee-fields/expenes/configuartion', permission: 'Expenes Configuartion.view' },
    { route: '/settings/employee-fields/expenes/allowed-days', permission: 'Expense Allowed Days.view' }
  ]
  
  export const SETTINGS_EMPLOYEE_FIELDS_MANAGE_DST_TABS = [
    { route: '/settings/employee-fields/manage-dsts/pending-for-submission', permission: 'DST Pending Tab.view' },
    { route: '/settings/employee-fields/manage-dsts/published-dsts', permission: 'DST Published Tab.view' }
  ]
  
  export const PMS_TABS = [
    { route: '/pms/review-cycle', permission: 'Review Cycle List.view' },
    { route: '/pms/apprisal', permission: 'Review Cycle Employee List.view' },
    { route: '/pms/myPerformance', permission: 'My Performance Review.view' },
    { route: '/pms/team-performance', permission: 'My Team Performance Review.view'}
  ]
  
  export const MY_PERFORMANCE_TABS = [
    { route: '/pms/myPerformance/pending-review', permission: 'Pending Reviews.view' },
    { route: '/pms/myPerformance/completed-review', permission: 'Completed Reviews.view' }
  ]
  
  export const TEAM_PERFORMANCE_TABS = [
    { route: '/pms/team-performance/pending-review', permission: 'Team Pending Reviews.view' },
    { route: '/pms/team-performance/completed-review', permission: 'Team Completed Reviews.view' }
  ]
  
  export const PMS_CONFIGURATION_TABS = [
    { route: '/pmsconfiguration/increment', permission: 'Increment Percentage.view'},
    { route: '/pmsconfiguration/assessor', permission: 'Assessor Configuration.view'}
  ]
  
  export const EVENTS_SUB_TABS = [
    { route: '/events/upcoming', permission: 'Events(Upcoming Events).view' },
    { route: '/events/past', permission: 'Events(Past Events).view' }
  ]
  
  export const HOLIDAYS_SUB_TABS =[
    { route:'/calendar/holiday/public-holidays', permission: 'Holidays(Public).view' },
    { route:'/calendar/holiday/optional-holidays', permission: 'Holidays(Optional).view' },
  ]
  
  export const DASHBOARD_SUB_TABS =[
    { route:'/admin/prospective-employees', permission: 'Dashboard Prospective Employees Card.view' },
    { route:'/admin/active-employees', permission: 'Dashboard Active Employees Card.view' },
    { route:'/admin/inactive-employees', permission: 'Dashboard Inactive Employees Card.view' },
    { route:'/admin/prospective-interns', permission: 'Dashboard Prospective Trainee Card.view' },
    { route:'/admin/active-interns', permission: 'Dashboard Active Trainees Card.view' },
    { route:'/admin/inactive-interns', permission: 'Dashboard Inactive Trainees Card.view' },
    { route:'/admin/current-openings', permission: 'Dashboard Current Openings Card.view' },
    { route:'/admin/probation-employees', permission: 'Dashboard Probation Employees Card.view' },
  ]

  export const EMPLOYEE_INFO_PERSONAL_ROUTES = [
    { permission: 'Employee Info Basic Information.view', route: '/personalinfo/personal/basic-info' },
    { permission: 'Employee Info Address Details.view', route: '/personalinfo/personal/address-info' },
    { permission: 'Employee Info Contact Details.view', route: '/personalinfo/personal/contact-details' },
    { permission: 'Employee Info Emergency Contact Details.view', route: '/personalinfo/personal/emergency-contact-details' },
    { permission: 'Employee Info Education Details.view', route: '/personalinfo/personal/education-details' },
    { permission: 'Employee Info Identity Details.view', route: '/personalinfo/personal/identity-details' },
    { permission: 'Employee Info Family Details.view', route: '/personalinfo/personal/family-details' },
    { permission: 'Employee Info Bank Details.view', route: '/personalinfo/personal/bank-details' },
    { permission: 'Employee Info Visa Details.view', route: '/personalinfo/personal/visa-details' }
  ];
  
  export const EMPLOYEE_INFO_JOB_ROUTES = [
    { permission: 'Employee Info Pre-Onboarding Details.view', route: '/personalinfo/job/pre-onboarding-details' },
    { permission: 'Employee Info Onboarding Details.view', route: '/personalinfo/job/onboarding-details' },
    { permission: 'Employee Info Offboarding Details.view', route: '/personalinfo/job/employmentType' },
    { permission: 'Employee Info Job Details.view', route: '/personalinfo/job/job-details' },
    { permission: 'Employee Info Separation Request Details.view', route: '/personalinfo/job/separation-details' },
    { permission: 'Employee Info No Due Clearance Details.view', route: '/personalinfo/job/no-due-clearance-details' },
    { permission: 'Employee Info Probation Details.view', route: '/personalinfo/job/probation-details' },
    { permission: 'Employee Info Previous Experience Details.view', route: '/personalinfo/job/past-experiences' },
    { permission: 'Employee Info Certification Details.view', route: '/personalinfo/job/certifications' },
    { permission: 'Employee Info Compensation Details.view', route: '/personalinfo/job/compensation-details' },
    { permission: 'Employee Info Desk Details.view', route: '/personalinfo/job/desk-details' },
    { permission: 'Employee Info Asset Details.view', route: '/personalinfo/job/assets-details' }
  ];


  export const INVITE_NEW_USER_TABS = [
    {  route: '/admin/active-new-user', permission:  'Dashboard Active Invite New User.view' },
    {  route: '/admin/prospective-new-user', permission:'Dashboard Trainee Active Invite New User.view' },
  ];

  