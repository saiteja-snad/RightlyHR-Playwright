// Summary Cards
export interface SummaryCard {
  title: string;
  value: number | string;
  subtext?: string;
  subtextClass?: string;
   icons?: string; 
}

// Skill Summary Totals
export interface SkillSummaryData {
  expertCount: number;
  beginnerCount: number;
  intermediateCount: number;
  totalSkillCount: number;
}

// Skill proficiency breakdown
export interface SkillProficiencyCount {
  label: string;
  count: number;
  color: string;
}

// Department-wise skill summary
export interface DepartmentSkillSummary {
  departmentId: number;
  departmentName: string;
  uniqueSkillCount: number;
}

// Department count data for charts
export interface DepartmentCount {
  label: string;
  count: number;
  color: string
  percentage: string;
}


export interface SkillProficiencyCounts {
  [key: string]: number;
}

// Top skill listing for horizontal bar chart
export interface TopSkill {
  skillName: string;
  employeeCount: number;
   colorCode?: string;
}

// Skill summary for table or skill count chart
export interface SkillSummary {
  skillName: string;
  skillCount: number;
  proficiencyCounts: SkillProficiencyCounts;
}

// Chart dataset (used in PrimeNG p-chart or Chart.js)
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string[];
  barThickness?: number;
  borderRadius?:number
}

// Chart data wrapper
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface EmployeeSkill {
  employeeName: string;
  fusionEmployeeId: string;
  departmentId: number;
  departmentName: string;
  subDepartmentId: number;
  subDepartmentName: string;
  skillName: string;
  proficiencyLevel: string;
  profileImage?: string;
  imageUrl?: string;
  projectStatus:string;
  jobRole?:string;
}

