export interface HelpdeskStatusUpdate {
  id: number;
  employeeId: number;
  currentStatus: string;
  status: string;
  // subject: string;
  description: string;
  assignedTo: number;
  resolvedDate: string | null;
  updatedDate: string;
  updatedBy: number;
  comments:string;
  priority:string;
}
export interface HelpdeskCreatequeires {
  employeeId: number;
  categoryId: number;
  subcategoryId: number;
  // departmentId: number;
  // subject: string;
  description: string;
  attachmentUrl: string | null;
  createdBy: number;
  createdDate: Date;
}
