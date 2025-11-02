// Summary Cards
export interface SummaryCard {
  title: string;
  value: number | string;
  subtext?: string;
  subtextClass?: string;
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
}

// Dynamic key/value proficiency counts (e.g. Expert, Mid, Beginner)
export interface SkillProficiencyCounts {
  [key: string]: number;
}

// Top skill listing for horizontal bar chart
export interface TopSkill {
  skillName: string;
  employeeCount: number;
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
}

// Chart data wrapper
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}


