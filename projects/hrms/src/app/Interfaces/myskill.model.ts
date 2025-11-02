export interface MySkills {
  // Common fields for both Add and Directory
  employeeId: number;
  createdBy: number;
  allowOverride: boolean;
  createdAt: string; // ISO date string

  // Skills are always required
  skills: Skill[];

  // Directory-only fields (optional for Add API)
  employee?: Employee;
  employeeProjectStatus?: string;
  projects?: Project[];
}
export interface Skill {
  skillId?: number;                // Present in GET response, optional in POST
  skillCategory: string;
  skillName: string;
  proficiencyLevel: string;
  isActive?: boolean;              // Optional - used only in directory view
}
export interface Employee {
  employeeId: number;
  snadEmployeeId: string;
  workMail: string;
  name: string;
  employeeDesignation: string;
}
export interface Project {
  projectId: number;
  projectName: string;
  startDate: string;
  endDate: string;
  projectDesignation: string;
}
