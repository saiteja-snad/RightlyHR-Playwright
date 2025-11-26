export interface Icardsdetails {
    cardId:number;
   id: number;
    cardNumber:string;
   cardHolderName:string
   cardCategory:string;
   cardType:string;
   cardNumberMasked:string;
   unMaskedCardNumber:string;
   creditLimit:number;
   expiryMonth:number;
   expiryYear:number;
   issuedBankName:string;
    status:string;
    issuedDate:string;
    sharedLimit:boolean;
   createdBy:IcardsdetailsResponse;
   allocations:any;
}
export interface IcardsdetailsResponse {
id: number;
name: string;
fusionEmpId: string;
workMail: string
}