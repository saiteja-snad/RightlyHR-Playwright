export const environment = {
    production: false,
    ApiUrl: 'https://fusionplusqaapi.onpremise.snadhr.com/api/',
    webSocketUrl: 'ws://localhost:44374',
    viewUrl: 'https://sasda001.blob.core.windows.net/fusionplusqa/',
    modules: [
        { id: 18, moduleName: 'Probation' },
        { id: 23, moduleName: 'PMS' } 
    ],


    clientId: '9a09dcfb-a22f-4fdf-a014-38990e558d80',
    authority: 'https://login.microsoftonline.com/0cc1bac4-bd4f-4994-8cf9-2d544c09d781/',
    redirectUrl: '/user-validation',
    baseUrl: "https://localhost:44371/",
    scopeUri: ["api://f9ad74b1-d17f-4175-9097-f543691f6bec/api-access"],

    dateformat: 'dd-MMM-yyyy',

    paidLeaveCategoryId: 172,
    mandatoryLeaveCategoryId: 173,

    SeparationrequestmoduleId: 13,
    RecallrequestmoduleId: 14,
    ProbationrequestmoduleId: 18,
    ProbationExtensionId: 2,
    ProbationNoticePeriodId: 0,
    ProbationbuttonbeforeId: 1,
    ProbationExtendPeriodTimes: 3,
    PMSrequestmoduleId: 23,
};
