export const environment = {
  production: false,
  ApiUrl: 'https://rightlyhrnewversiondevapi.rightlyhr.com/api/',
 
  viewUrl: 'https://sasda001.blob.core.windows.net/fusionplusqa/',
  modules: [
    { id: 20, moduleName: 'Probation' },
    { id: 24, moduleName: 'PMS' },
    { id: 33, moduleName: 'ExitFeedback' }   
  ],


  clientId: '9a09dcfb-a22f-4fdf-a014-38990e558d80',
  authority: 'https://login.microsoftonline.com/0cc1bac4-bd4f-4994-8cf9-2d544c09d781/',
  redirectUrl: '/uservalidation',
  baseUrl: "https://rightlyhrnewversiondevapi.rightlyhr.com/api/",
  scopeUri: ["api://f9ad74b1-d17f-4175-9097-f543691f6bec/api-access"],


  dateformat: 'MMM d, y',
  currencyCode: 'USD',
  paidLeaveCategoryId: 172,
  wfhModuleId:2,
  compoffModuleId:3,
  traineeoffboardingModuleId:15,
  leavesModuleId:1,
  claimsModuleId:4,
  nodueModuleId:16,
  permissionsModuleId:18,
   timesheetModuleId:30,
   pendingapprovalemployeid:32,
  attendanceRegularizationModuleId:17,
  mandatoryLeaveCategoryId: 173,
  SeparationrequestmoduleId: 13,
  RecallrequestmoduleId: 14,
  ProbationrequestmoduleId: 20,
  ProbationNoticePeriodId: 0,
  ProbationbuttonbeforeId: 1,
  ProbationExtensionId: 2,
  ProbationExtendPeriodTimes: 3,
  PMSrequestmoduleId:24,
  deskAllocationModuleId:23,
  expensesModuleId:19,
  remoteLoginModuleId:11,
  globalPermissionsModuleID:21,
  oldVersionUrl:'https://snad.rightlyhr.com/uservalidation',
  secretKey:'A8fD@9!sLm#Qz7PpXv3$wK2*R9bT6yN!',
  googleClientId: '976695989594-cbrkrjdsf6phcujl32imv6l6t04plnd2.apps.googleusercontent.com',
};
