export const environment = {
  production: false,

  ApiUrl:'https://rightlyhrnewversionapi.rightlyhr.com/api/',

  webSocketUrl: 'ws://rightlyhrnewversionapi.rightlyhr.com',
  viewUrl: 'https://sasda001.blob.core.windows.net/fusionplusqa/',
  modules: [
    { id: 20, moduleName: 'Probation' },
    { id: 24, moduleName: 'PMS' },
    { id: 33, moduleName: 'ExitFeedback' }   
  ],



  clientId: '9a09dcfb-a22f-4fdf-a014-38990e558d80',
  authority: 'https://login.microsoftonline.com/0cc1bac4-bd4f-4994-8cf9-2d544c09d781/',
  redirectUrl: '/uservalidation',
  baseUrl: "https://localhost:44371/",
  scopeUri: ["api://f9ad74b1-d17f-4175-9097-f543691f6bec/api-access"],

  auth: {
    google: {
      clientId: 'your-google-client-id.apps.googleusercontent.com',
      redirectUri: window.location.origin + '/auth/callback',
      scope: 'openid profile email',
      issuer: 'https://accounts.google.com',
    },
    microsoft: {
      clientId: '9a09dcfb-a22f-4fdf-a014-38990e558d80',
      tenant: '0cc1bac4-bd4f-4994-8cf9-2d544c09d781',
      redirectUri: window.location.origin + '/uservalidation',
      postLogoutRedirectUri: window.location.origin + '/login',
      authority: 'https://login.microsoftonline.com',
      scope: 'openid profile email',
    }
  },


  dateformat: 'MMM d, y',
  paidLeaveCategoryId: 172,
  wfhModuleId:2,
  compoffModuleId:3,
  traineeoffboardingModuleId:15,
  leavesModuleId:1,
  claimsModuleId:4,
  nodueModuleId:16,
  permissionsModuleId:18,
  attendanceRegularizationModuleId:17,
  mandatoryLeaveCategoryId: 173,
  SeparationrequestmoduleId: 13,
  RecallrequestmoduleId: 14,
  ProbationrequestmoduleId: 20,
  ProbationNoticePeriodId: 0,
  ProbationbuttonbeforeId: 3,
  ProbationExtensionId: 2,
   timesheetModuleId:30,
   pendingapprovalemployeid:32,
  ProbationExtendPeriodTimes: 1,
  PMSrequestmoduleId:24,
  deskAllocationModuleId:23,
  expensesModuleId:19,
  remoteLoginModuleId:11,
  globalPermissionsModuleID:18,
  contractorModuleId:25,
  contractEmployeeConversionModuleId:26,
  extraHoursModuleId: 31,
  oldVersionUrl:'https://snad.rightlyhr.com/uservalidation',
  secretKey:'A8fD@9!sLm#Qz7PpXv3$wK2*R9bT6yN!',
  googleClientId: '976695989594-cbrkrjdsf6phcujl32imv6l6t04plnd2.apps.googleusercontent.com',

};
