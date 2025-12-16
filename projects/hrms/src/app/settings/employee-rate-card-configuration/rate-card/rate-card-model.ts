export interface IRateCardActiveViewModel {
id: number,
subLocationName?:string,
locationName?:string,
roleName?:string,
effectiveFrom?:any,
effectiveTo?:any,
status?:string,
experienceBands?:IExperienceResponse[] |undefined
}
export interface IExperienceResponse {
  id: number;
  experienceFrom: number;
  experienceTo: number;
  status: string;
  comment: string;
  createdDate?: any;
  currencies?: ICurrencyResponse[]  |undefined
}
export interface ICurrencyResponse{
id: number, 
currencyCode: string, 
currencyName: string, 
symbol: string, 
rate: number, 
status: string
}