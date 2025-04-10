export interface Iexpensetype {
    expensesCode: number;
    expenseType: string;
    id: number;
  }
  
  export interface IexpenseItem {
    item: string;
    Description: string;
    expenseDate: string;
    amount: number;
    recieptNumber: number;
    attachment: string;
    expensestitle: string;
    additionaldetails: string;
  }
  export interface IExpenseItem {
    submissionDate: string;
    expenses_ID: number;
    item_Name: string;
    item_Description: string;
    expense_Date: string;
    expense_Amount: number;
    receipt_Number: string;
    attachment_url: string;
    status: string;
  }
  export interface INewExpense {
attachment_url: any;
    applied_date: string;
    expenses_Title: string;
    expenseId: number;
    approverEmail: string;
    additional_details: string;
    status: string;
    employeeId: number;
    expenseItem: IExpenseItem[];
  }
  
  export interface IExpenseHeader {
    //get by employeeid
    expenses_ID: number;
    applied_date: string;
    expenses_Title: string;
    additional_details: string;
    status: string;
    employeeId: number;
    totalExpenseAmount: number;

    ExpenseApproverComment: ExpenseApproverComment[];
  }
  
  export interface ExpenseApproverComment {
    id: number;
    pendingItemsId: number;
    addedBy: number;
    addedDate: string;
    comments: string;
    addedByFusionEmpId: string;
    addedName: string;
    action: string;
    metaData: any;
    approverRole: any;
  }
  
  export interface IExpense {
    //get by expensesid
    expenses_ID: number;
    applied_date: string;
    expenses_Title: string;
    expenseId: number;
    approverEmail: string;
    additional_details: string;
    status: string;
    employeeId: number;
    submissionDate: string;
    expense_Date:any,
    expenseitem: IExpenseItem[];
  }
  
  export interface Inewexpense {
    additionaldetails: any;
    submitted: boolean;
    employeeId: any;
    expensesCode: string;
    amount: number;
    recieptNumber: number;
    status: string;
    attachment: string;
    expensedate: any;
    employeeName: string;
    Description: string;
    isdeeleted: any;
    expenseName: string;
    isManagementExpense: any;
    submissionDate: any;
    expensetitle: string;
    expenseItems: IexpenseItem[];
  }
  
  export interface IExpensedatabyid {
    expensedate: any;
    amount: number;
    attachment: any;
    status: string;
    expensesCode: number;
    expenseType: string;
    description: string;
    employeeName: string;
    firstName: string; // <-- Add this line
    lastName: string;
    id: number;
    employeeId: number;
    isdeeleted: any;
    isManagementExpense: boolean;
    expenseName: string;
    recieptNumber: number;
    submissionDate: any;
  }
  
  export interface IExpensedata {
    id: number;
    employeeId: number;
    expensedate: Date;
    expenseType: string;
    amount: number;
    invoice: string;
    status: string;
    isNotVisible: boolean;
    employeeName: string;
    firstName: string; // <-- Add this line
    lastName: string;
  }
  
  export interface Iinvoices {
    id: number;
    employeeId: number;
    invoicenumber: number;
    invoicedate: string;
    // invoiceType: any,
    attachment: any;
    money: any;
    status: string;
    Description: string;
    Invoicetype: any;
    employeeName: string;
    isNotVisible: boolean;
    firstName: string; // <-- Add this line
    lastName: string;
    isdeleted: string;
  }
  
  export interface Itimesheet {
    timesheetId: number;
    empId: number;
    projectId: number;
    taskId: number;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
    weekStartDate: any;
    weekEndDate: any;
    status: string;
    tstatus: string;
    lastName: string;
    firstName: string;
    projectName: string;
    employeeId: number;
    totalHours: string;
    taskName: string;
  }
  

  
  