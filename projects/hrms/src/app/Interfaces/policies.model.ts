export interface IPolicies{
applicableyear: any;
    empId: number;
    subLocation: any;
    location: string;
    validupto: any;
    id: number,
    attachments: string,
    attachmentName: string,
    isdeleted: boolean

}
export interface Ipolicy{

    applicableyear:any;
    locationName:string;
    subLocationName:string;
    shiftName:string;
    status:string;
    addedbyName:any;
    orgPolicyItems:IPolicies[]

}
export interface IPolicyItem{
    policyName :string | null;
    policyDescription:string | null;
    PolicyAttachment:string | null;
}
export interface IPolicies{
    empId: number;
    subLocation: any;
    location: string;
    validupto: any;
    id: number,
    attachments: string,
    attachmentName: string,
    isdeleted: boolean

}