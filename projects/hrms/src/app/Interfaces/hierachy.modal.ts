export interface TreeNode<T = any> {
    label?: string;
    data?: T;
    icon?: string;
    expandedIcon?: any;
    collapsedIcon?: any;
    children?: TreeNode<T>[];
    leaf?: boolean;
    expanded?: boolean;
    type?: string;
    parent?: TreeNode<T>;
    partialSelected?: boolean;
    style?: string;
    styleClass?: string;
    draggable?: boolean;
    droppable?: boolean;
    selectable?: boolean;
    key?: string;
}

export interface Ticket {
    id: number;
    empId: number;
    emailaddress: string;
    assigneeName: string;
    assigneeId: string;
    workEmail: string;
    contactnumber: number;
    subdeptId: number;
    deskNo: string;
    type: string;
    priority: string;
    ticketStatus: string;
    subject: string;
    description: string;
    stepsToReplicate: string;
    comments: string;
    createdAt: string;
    updatedAt: string; 
    subdepartmentId: number;
    subdepartmentName: string;
    departmentId: number;
    sno: number;
    departmentName: string;
    employeeId: number;
    deskId: string;
    employeeName: string;
  }

  export interface Assignee {
    assigneeId: number;
    assigneeName: string;
    fusionEmpId: string;
    normalizedName : string;
  }
