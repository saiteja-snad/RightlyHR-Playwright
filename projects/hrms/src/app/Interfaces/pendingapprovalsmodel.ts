export interface IApprovalHeader{
    id?:number,
    moduleId:number
    referenceEntityId:number,
    status:string,
    comment?:string,
    currentapprovalStage:string,
    currentApproverId:number,
    finalapprovalStage:string,
    requestedBy:number
  }
  
  export interface IMasterModule{
    id:number,
    moduleName:string,
    approvalflowRequired:boolean,
    categoryType:string,
    normalizedName?:string
  }

export interface IPendingApprovals{
    entity:any,
    approvalHeader:IApprovalHeader,
    module:IMasterModule
    lastName: any
    firstName: any
    middleName : string
    fusionEmployeeId:any;
    employeeId:any;
    designation:any;
    
  }
  export interface LeaveApproverComment {
    id: number;
    pendingItemsId: number;
    addedBy: string;
    addedDate: string;
    comments: string;
    addedByFusionEmpId: string;
    addedName: string;
}


  export interface LeaveEntity {
    leaveId: number;
    leaveempId: number;
    leavefusionempId: string;
    leaveStartDate: string;
    leaveEndDate: string;
    leaveCategoryName: string;
    employeeName: string;
    leaveCategoryId: number;
    appliedDate: string;
    leaveDuration: number;
    leaveDescription: string;
    leaveDurationType: string;
    leaveheaderId: number;
    leaveApproverComments: LeaveApproverComment;
}

export interface ApprovalHeader {
    id: number;
    moduleId: number;
    referenceEntityId: number;
    status: string;
    currentapprovalStage: string;
    currentApproverId: string;
    finalapprovalStage: string;
    approvedType: string;
    requestedBy: number;
}

export interface Module {
    id: number;
    moduleName: string;
    approvalflowRequired: boolean;
    categoryType: string;
}

export interface LeaveApproval {
    entity: LeaveEntity;
    approvalHeader: ApprovalHeader;
    module: Module;
    currentApprover: string;
    request: any;
}

export interface Iprobationapproval{
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
  employeeId:number;
  fusionEmployeeId: string,
  employeeName: string,
  probationEndDate: any,
  probationExtendedDate : any,
  probationStartDate:any
  comments:any,
  prApproverComments:any
}