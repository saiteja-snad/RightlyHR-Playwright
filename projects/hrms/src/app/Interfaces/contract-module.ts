export interface IApprovalHeader {
    comment?:string;
    currentApproverId: number
    currentapprovalStage: string
    finalapprovalStage: string
    id?:number
    moduleId: number
    referenceEntityId:number
    requestedBy:number
    status: string
   
  }
  export interface Icontractapproval{
     entity?:IEntity;
    module?:IModule;
    approvalHeader:IApprovalHeader
   }
   export interface IModule {
    id: number,
     moduleName:string,
     approvalflowRequired: boolean,
     categoryType:string,
     normalizedName: string
 
}
export interface IEntity {
    fusionEmpId: string,
    employeeName: string,
    contractEndDate: any,
    contractStartDate: any,
    contractExtendedDate:any,
    comments:any,
    approvers:any,
    requestedDate:any,
    contractFeedback:string,
    contractType:string
  }