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
  export interface Itraineeapproval{
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
    empName: string,
    traineeStartDate: any,
    traineeEndDate: any,
    comments:any,

  }