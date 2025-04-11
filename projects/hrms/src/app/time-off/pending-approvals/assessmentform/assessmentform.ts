
export interface IFormDetails {
    formName: string;
    moduleName: string,
    fusionEmployeeId:string,
    employeeName:string,
    designation: string,
    location:string,
    sublocation: string,
    departmentname: string,
    shiftName: string,
    dateOfJoining: Date,
    subDepartmentName:string,
    employeeId: number,
    formId: number,
    reviewerId: number,
    reviewerName: string,
    reviewerFusionEmployeeId: string,
    cutOffRating:number,
    overAllRating:number,
    textarea:string,
    sectionDetails?: ISection[];
    meta:any;
    metadata:Imetadata;
    tmName:string;
    rmName:string;
    Text:string;
    tmEmpId:number;
    rmEmpId:number;

  }
  export interface Imetadata{
    Text:string;
    Overallrating:number,
  }
  export interface ISection {
    questions?: IQuestions[];
    sectionName?: string;
    id:number;
    meta:any
  }
  
  export interface IQuestions {
    id:number;
    sectionName?:string;
    question?: string;
    options?: IOptions[]; // Marking this as optional because some questions do not have optionNames
    optionsData?:any;
    type?: string;
    meta:any;
  }
  
  export interface IOptions {
    option?: string;
    optionsData:any;
    optionWeightage:string;
    checked:boolean;
    optionId:number;
    meta:any;
  }

  
