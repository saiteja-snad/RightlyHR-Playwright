export interface IOfferLetterDetails {
    id: number;
    documentUrl: string;
    employeeId: number,
    fusionEmpId:any,
    firstName: string,
    emailaddress: string,
    effectivedate: any,
    contactnumber:any
    isNotVisible: boolean;
    offerIssueddate:any;
    lastName:string;
    offerstatus:string;
    empId: number,
    offerSentDate: any,
    offerSentStatus: string,
    offerSentBy: string,
    employeeName:string,
    empSubstatus:string,
    substatus:string,
    status:string,
    workLocation:string,
    jobRole:string,
    subLocation:string,
    durationOfTraining:string,
}

export interface IAppointmentLetterDetails {
    id: number;
    documentUrl: string;
    employeeId: number,
    fusionEmpId:string,
    employeeName : string,
    appointmentSentDate : any,

}
export interface INDALetterDetails {
    id: number;
    documentUrl: string;
    employeeId: number,
    fusionEmpId:string,
    employeeName : string,
    ndaSentDate : any,

}