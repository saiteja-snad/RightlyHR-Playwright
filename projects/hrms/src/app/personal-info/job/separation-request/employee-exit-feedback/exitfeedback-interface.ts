export interface IExitFeedback {
    id?: number;
  employeeId?: number;
  separationId?: number;
  empFormId?: number;
  empResponseId?: number;
  moduleId?: number;
  description?: string;
  empSubmittedAt?: Date;
  initiatedBy?: number;
  initiatedAt?: Date;
  status?: string;
  documentUrl?: string;
  lastWorkingDate?: Date;
}