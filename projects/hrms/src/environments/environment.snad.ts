export const environment = {
  production: true,
  webSocketUrl: 'ws://api.fusion.snadhr.com',

  modules: [
    { id: 18, moduleName: 'Probation ' },
    { id: 23, moduleName: 'PMS' } 
  ],



  //SNAD HR
  clientId: '9a09dcfb-a22f-4fdf-a014-38990e558d80',
  authority: 'https://login.microsoftonline.com/0cc1bac4-bd4f-4994-8cf9-2d544c09d781/',
  redirectUrl: '/uservalidation',
  baseUrl: "https://localhost:44371/",
  scopeUri: ["api://f9ad74b1-d17f-4175-9097-f543691f6bec/api-access"],

  ApiUrl: 'https://snadapi.rightlyhr.com/api/',
  viewUrl: "https://sasda001.blob.core.windows.net/rightlyhr/",

  dateformat: 'dd-MMM-yyyy',
  paidLeaveCategoryId: 109,
  mandatoryLeaveCategoryId: 110,
};
