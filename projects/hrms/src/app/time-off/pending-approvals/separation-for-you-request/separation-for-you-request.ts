export interface ISeparation {
  appliedDate?: any;
  recallStatus?: string;
  noticePeriodDuration?: string;
  employeeId?: number;
  lastWorkingDate?: any;
  separationType?: string;
  description?: string;
  approvers?: any;
  requestType?: string;
  id?: number;
  approvalHeader?: IHeaderDetails;
  status?: string;
  entity?: IEntityDetails;
}
export interface ISeparationRequest {
  entity?:IEntityDetails;
  module?:IModule;
  approvalHeader?:IHeaderDetails
 }
export interface IHeaderDetails {
  approvedType?: any;
  currentApproverId?: any;
  currentapprovalStage: any;
  finalapprovalStage: any;
  id?: number;
  moduleId?: number;
  referenceEntityId?: number;
  requestedBy?: number;
  status: string;
}
export interface IEntityDetails {
  spApproverComments: [];
  spDepartment: string;
  spDesignation: string;
  spIsEarlyRelieveing: boolean;
  spRequestAppliedDate: any;
  spRequestDescription: string;
  spRequestEmployeeId: number;
  spRequestFusionEmployeeId: any;
  spRequestId: number;
  spRequestLastWorkingDate: any;
  spRequesterName: string;
  spStatus: string;
  spTeam: string;
  spearlyReliveingDate: any;
  spheaderId: number;
  sprecalledStatus: string;
  spEarlyRelievingReason: string;
}
export interface IModule {
  id: number,
   moduleName:string,
   approvalflowRequired: boolean,
   categoryType:string,
   normalizedName: string

}