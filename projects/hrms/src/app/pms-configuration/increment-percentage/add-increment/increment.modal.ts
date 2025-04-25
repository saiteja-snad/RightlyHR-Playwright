export interface IReviewCycle {
    sno: number,
    departmentName: string;
    isdeleted: string;
  }
  export interface IIncementalDetails {
    createdBy: number
    createdByFusionEmpId: string
    createdByName: string
    deptId:any
    deptName: Idepartment[]
    id:number
    isDeleted: boolean
    locationId: any
    locationName: Ilocation[]
    rating: any
    reviewCycleId: any
    reviewCycleName:string
    subdeptId: any
    subdeptName : Isubdepartment[]
    sublocationId: any
    sublocationName: Isublocation[]
  }
  export interface Idepartment{
    departmentId: any
    departmentName: string
  }
  export interface Ilocation{
    locationId: any;
    locationName: string;
  }
  export interface Isubdepartment{
    departmentId: any
    subDepartmentId: any
    subDepartmentName: string
  }
  export interface Isublocation{
    subLocationId:any
    subLocationName: string
  }
  export interface RatingDetail {
    percentage: number | null;  // Or use a different type if necessary
    ratingcolumns: number;      // Adjust the type depending on your use case
  }