import { IFormDetails } from '../time-off/pending-approvals/assessmentform/assessmentform';

export interface IAllFormsData {
  createdBy: number;
  employeeId: number;
  employeeName: string;
  formName: string;
  formId: number;
  moduleId: number;
  moduleName: string;
  sectionDetails: string;
  updatedBy: any;
  status: string;
}

export interface IRatingScale {
  minimumRatingScale?: number;
  maximumRatingScale: number;
  finalRating: number;
  ratingType: string;
  scales: [{ scale: number; description: string }];
}

export interface IDynamicForm extends IFormDetails {
  moduleId: number; // Add your new key with its type
  createdBy: number;
  updatedBy: number;
  sectionId: number | null;
  sectionItems: any[];
  formHeaderId: number;
  ratingScaleRange: string | null;
  status: string;
}

export interface IFromsettings {
  minimumRatingScale: number; // Add your new key with its type
  maximumRatingScale: number;
  finalRating: number;
  ratingType: string;
  scales: Array<{
    scale: number;
    description: string;
  }>;
}
