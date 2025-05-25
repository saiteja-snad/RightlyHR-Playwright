export const MODULE_INFOS = {
    //Settings Employee Fields Module Info
    SETTINGS_PERSONAL_INFO_MODULE_INFO : "This section allows configuration of dropdown values like Salutation, Status, Gender, Marital Status, Degree, Visa Type, Identity Type, Relationship, and Bank Names. It ensures standardization and consistency across employee profile creation and HR processes.",
    SETTINGS_JOB_INFO_MODULE_INFO : "This section is used to define and manage job-related dropdowns such as Job Role, Job Type, Department, Team, Grade, Pay Type, Location, and others related to employment structure. It standardizes employment details including probation, compensation, onboarding, and exit-related attributes to ensure consistency across HR records.",
    SETTINGS_DOCUMENTS_INFO_MODULE_INFO : "This section allows to Configure and manage all document types including employee documents, appraisal/promotion letters, and organization policies. Ensures structured document collection, verification, and seamless compliance across the employee lifecycle.",
    SETTINGS_MANAGE_SHIFTS_INFO_MODULE_INFO : "Create, manage, and assign employee work shifts with flexibility across locations and departments. Track shifts by status such as 'Pending for Submission' for drafts and 'Published' for finalized schedules visible to employees.",
    SETTINGS_MANAGE_POLICIES_INFO_MODULE_INFO : "Define and manage work shift policies by configuring year, location, sub-location, shift names, and assigned status. Use the “Pending for Submission” state to review draft entries before publishing finalized shift plans visible to employees.",
    SETTINGS_MANAGE_HOLIDAYS_INFO_MODULE_INFO : "Configure organization-wide holiday calendars by year, location, sub-location, and shift name. Draft entries remain under “Pending for Submission” until reviewed and published, ensuring accurate holiday visibility across shifts and locations.",
    SETTINGS_MANAGE_WEEKENDS_INFO_MODULE_INFO : "Define weekly off days for each shift based on year, location, and sub-location to align with regional schedules. Entries under “Pending for Submission” can be reviewed and published to ensure accurate weekend configurations across teams.",
    SETTINGS_ESPENSE_TYPE_INFO_MODULE_INFO : "Configure allowed days and types of reimbursable expenses such as Food, Flight, Travel, Medical, and Stay. Admins can add or update configurations to streamline claim rules and ensure policy compliance.",
    SETTINGS_MANAGE_DST_INFO_MODULE_INFO : "Manage DST settings by location, sub-location, and shift to align working hours across time zones. Admins can add, edit, and publish DST entries to ensure accurate time tracking during seasonal changes.",
    SETTINGS_NO_DUE_CLEARANCE_MODULE_INFO : "Set up department-wise clearance responsibilities by assigning employee names and roles to ensure smooth offboarding. This module helps define which managers or HR personnel must clear dues before an employee exits the organization.",

    //Settings Roles Module Info
    SETTINGS_ROLES_MODULE_INFO : "Define organizational roles like HR, Manager, or Employee and associate them with specific responsibilities. Roles serve as the base for access and approval structures.",
    SETTINGS_ROLES_PERMISSION_MODULE_INFO : "Assign module access and specific actions like create, edit, or view to each role. This ensures users only see and perform tasks allowed for their role.",
    SETTINGS_ROLES_ASSIGNEE_MODULE_INFO : "Map employees to their appropriate roles so they inherit the correct permissions. This mapping ensures system-level access is accurately controlled.",

    //Settings Time off Module Info
    SETTINGS_LEAVE_CATEGORY_MODULE_INFO : "Create leave types such as Sick Leave, Paid Leave, and Casual Leave and set rules like carry-forward or accrual. Categories are used in the employee leave application interface.",
    SETTINGS_LEAVE_ALLOCATION_MODULE_INFO : "Configure yearly leave entitlements by selecting year, location, sub-location, shift, and category. Allocate specific leave days to various grades to standardize time-off across departments and roles.",
    SETTINGS_FLEXIBLE_LEAVE_ALLOCATION_MODULE_INFO : "Assign personalized leave days by selecting year, location, sub-location, shift, category, and employee. This module allows tailoring leave entitlements at the individual employee level for greater flexibility and control.",
    SETTINGS_ATTENDANCE_ELIGIBILITY_CRITERIA_MODULE_INFO : "Configure company-wide criteria for Comp Off, Work From Home, and Permissions including entitlement rules and eligibility. Define global policies and regularization types with time-based values like expiry, past/future days, and minimum hour thresholds for full or half-day adjustments.",
    SETTINGS_LOAD_ENTITLEMENT_MODULE_INFO : "This module allows viewing and managing leave entitlements for employees based on filters like Employee ID, DOJ, Location, and Shift. It displays detailed leave categories with corresponding policy and entitled leaves for each individual.",

    //Settings Asset Configuration Module Info
    SETTINGS_ASSET_CONFIGURATION_MODULE_INFO : "This module allows managing asset vendor details along with associated asset categories and subcategories. Admins can add or edit vendor information such as name, contact, status, email, and address, and organize assets under defined software and hardware categories.",
    
    //Settings Dynamic Forms Module Info
    SETTINGS_DYNAMIC_FORMS_MODULE_INFO : "This module displays a categorized list of forms under Active, Inactive, and Draft statuses for PMS, allowing admins to search, view, and manage form configurations. Each form lists its module, name, creator, last updater, and current status for easy tracking and control.",

    //Expenses Module Info
    EXPENSES_MODULE_INFO : "Expenses section allows employees to add new expenses and track their status across different stages including Draft, Approved, Pending, Processed, and Rejected. Users can search expenses and view details like Expense Title, Date, Total Amount, Status, and available actions.",

    //Pms Module Info
    PMS_REVIEW_CYCLE_LIST_MODULE_INFO : "This module enables creation and tracking of employee review cycles with department, team, and location-level mapping. Users can create review cycles and link them to specific business units in order to track their status, such as Created or Initiated.",
    PMS_REVIEW_CYCLE_EMPLOYEE_LIST_MODULE_INFO : "This module provides a detailed listing of employees mapped to specific review cycles, with filters for department, location, and promotion status. It displays key information like review templates, current status, and final ratings to support performance evaluation tracking.",
    PMS_MY_PERFORMACE_REVIEW_MODULE_INFO : "This screen displays the logged-in employee’s active performance review cycle, along with details such as department, team, location, due date, assigned template, and current review status. It allows employees to monitor and act on their pending assessments.",
    PMS_MY_TEAM_PERFORMACE_REVIEW_MODULE_INFO : "This screen allows managers to view and manage performance reviews of their team members, including review cycle details, employee info, due dates, templates, and review statuses. It helps track progress and take timely actions on assessments.",

    //Pms Configuration Module Info
    PMS_CONFIGURATION_INCREMENT_PERCENTAGE_MODULE_INFO : "This screen enables configuration of increment percentages based on employee ratings within a selected review cycle. Admins can define rating scales, set percentage slabs for specific salary ranges, and associate them with departments, teams, and locations.",
    PMS_CONFIGURATION_ASSESSOR_CONFIGURATION_MODULE_INFO : "This section allows administrators to configure assessors for a selected review cycle by mapping them to departments, teams, and locations. Each assessor can be assigned a deadline date, rating responsibility, and the ability to add comments for evaluations." ,

    //Desk Allocation Module Info 
    DESK_ALLOCATION_MODULE_INFO : "The Desk Allocation page enables efficient workspace management by displaying desk statuses and allowing actions like reallocation, inactivation, maintenance scheduling, and viewing details. Users can filter by location, desk ID, type, shift, employee, and approver for precise control.",

    //Asset Allocation Module Info
    ASSET_ALLOCATION_MODULE_INFO : "The Asset Management page offers a comprehensive view of all assets, their status, and allocation details. Users can efficiently manage assets by reallocating, releasing, updating, or marking them as inactive or under maintenance, with access to detailed records for tracking.",

    //IT Support Module Info
    IT_SUPPORT_MODULE_INFO : "The IT Support section allows users to raise new tickets by providing details such as Ticket Priority, Subject, Description, and impacted Department or Team. Users can track tickets across various statuses including All, Open, Awaiting User, Solved, and Rejected, with options to search and manage ticket actions.",

    //Organizational Hierarchy Module Info
    ORGANIZATIONAL_HIERARCHY_MODULE_INFO : "The Organizational Hierarchy view displays detailed reporting structure and compensation info for the selected employee. Options are available to download the data as PDF, JPG, or Excel.",

    //Holidays Module Info
    HOLIDAYS_MODULE_INFO : "The Holidays page displays public and optional holidays for the selected year, with the ability to change the year using a dropdown. Each holiday is shown with its name, date, and an event for easy reference."

}