
export interface IcardAllocatedDetails {
    card?:Icardsdetails;
    allocatedDate?:string;
    allocationStatus?:string;
    employee?:IemployeeDetails;
    releasedDate?:string;
    assignedBy? : IAssignedBy;
}
export interface IemployeeDetails {
fusionEmpId:string;
name:string;
workMail:string
}
export interface Icardsdetails {
    cardId:number;
   id: number;
    cardNumber:string;
   cardHolderName:string
   cardCategory:string;
   cardType:string;
   cardNumberMasked:string;
   creditLimit:number;
   expiryMonth:number;
   expiryYear:number;
   issuedBankName:string;
    status:string;
    issuedDate:string;
    sharedLimit:boolean;
   createdBy:IcardsdetailsResponse
}
export interface IcardsdetailsResponse {
id: number;
name: string;
fusionEmpId: string;
workMail: string
}

export interface IAssignedBy{
id: number;
name: string;
fusionEmpId: string;
workMail: string
}