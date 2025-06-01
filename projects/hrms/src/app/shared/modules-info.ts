export const MODULE_INFOS = {
    //Settings Employee Fields Module Info
    SETTINGS_EMPLOYEE_FIELDS_MODULE_INFO : "Define and manage core employee data sections such as personal details, job info, documents, and policies. Central hub for configuring fields that shape the employee profile structure.",
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
    SETTINGS_ROLES_PERMISSIONS_MODULE_INFO : "Define user roles and assign permissions to control access across modules. Manage role hierarchies and streamline data security through role-based access.",
    SETTINGS_ROLES_MODULE_INFO : "Define organizational roles like HR, Manager, or Employee and associate them with specific responsibilities. Roles serve as the base for access and approval structures.",
    SETTINGS_ROLES_PERMISSION_MODULE_INFO : "Assign module access and specific actions like create, edit, or view to each role. This ensures users only see and perform tasks allowed for their role.",
    SETTINGS_ROLES_ASSIGNEE_MODULE_INFO : "Map employees to their appropriate roles so they inherit the correct permissions. This mapping ensures system-level access is accurately controlled.",

    //Settings Time off Module Info
    SETTINGS_TIME_OFF_MODULE_INFO : "Manage employee leave lifecycle from application to approval, including comp-offs, permissions, and regularization. Enables smooth tracking, manager actions, and real-time balance visibility.", 
    SETTINGS_LEAVE_CATEGORY_MODULE_INFO : "Create leave types such as Sick Leave, Paid Leave, and Casual Leave and set rules like carry-forward or accrual. Categories are used in the employee leave application interface.",
    SETTINGS_LEAVE_ALLOCATION_MODULE_INFO : "Configure yearly leave entitlements by selecting year, location, sub-location, shift, and category. Allocate specific leave days to various grades to standardize time-off across departments and roles.",
    SETTINGS_FLEXIBLE_LEAVE_ALLOCATION_MODULE_INFO : "Assign personalized leave days by selecting year, location, sub-location, shift, category, and employee. This module allows tailoring leave entitlements at the individual employee level for greater flexibility and control.",
    SETTINGS_ATTENDANCE_ELIGIBILITY_CRITERIA_MODULE_INFO : "Configure company-wide criteria for Comp Off, Work From Home, and Permissions including entitlement rules and eligibility. Define global policies and regularization types with time-based values like expiry, past/future days, and minimum hour thresholds for full or half-day adjustments.",
    SETTINGS_LOAD_ENTITLEMENT_MODULE_INFO : "This module allows viewing and managing leave entitlements for employees based on filters like Employee ID, DOJ, Location, and Shift. It displays detailed leave categories with corresponding policy and entitled leaves for each individual.",

    //Settings Asset Configuration Module Info
    SETTINGS_ASSET_CONFIGURATION_MODULE_INFO : "This module allows managing asset vendor details along with associated asset categories and subcategories. Admins can add or edit vendor information such as name, contact, status, email, and address, and organize assets under defined software and hardware categories.",
    SETTINGS_ASSET_CONFIGURATION_VENDOR_DETAILS:"Manage and track vendor information for all your assets in one place. Easily view contact details, status, and addresses for seamless vendor coordination.",
    SETTINGS_ASSET_CONFIGURATION_ASSET_CATEGORY:"Create and organize categories like Hardware or Software to manage your assets better. Helps in easy tracking and reporting of asset types.",
    SETTINGS_ASSET_CONFIGURATION_ASSET_SUB_CATEGORY:"Define detailed subcategories under each asset type like Desktop, Windows, or Mouse. Makes asset tracking more specific and organized.",

    //Settings Dynamic Forms Module Info
    SETTINGS_DYNAMIC_FORMS_MODULE_INFO : "This module displays a categorized list of forms under Active, Inactive, and Draft statuses for PMS, allowing admins to search, view, and manage form configurations. Each form lists its module, name, creator, last updater, and current status for easy tracking and control.",
    SETTINGS_DYNAMIC_FORMS_ACTIVE_FORMS : "Create and manage customizable forms for various modules like PMS and Probation. Control fields, workflows, and visibility to streamline data collection across teams.",
    SETTINGS_DYNAMIC_FORMS_INACTIVE_FORMS : "Design, manage, and reuse custom forms for modules like PMS. Inactive forms to maintain clean workflows without losing past data.",
    SETTINGS_DYNAMIC_FORMS_DRAFT_FORMS : "Design and manage custom forms for any module with ease. Track them by status Draft—to build, pause, or finalize forms at your pace.",
    SETTINGS_DYNAMIC_FORMS_FORM_SETTINGS : "Customize form scoring with flexible rating scales for performance reviews, feedback, or assessments. Define rating types, ranges, and apply them to any section within your dynamic forms.",

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
    HOLIDAYS_MODULE_INFO : "The Holidays page displays public and optional holidays for the selected year, with the ability to change the year using a dropdown. Each holiday is shown with its name, date, and an event for easy reference.",

    //Reports Module Standard Reports Module Info
    STANDARD_REPORTS_MODULE_INFO: "Get a clear view of employee data across the organization. Access ready-made reports on joining details, job locations, family info, compensation, and more — all in one place for easy export and analysis.", 
    STANDARD_REPORTS_EMPLOYEE_MASTER_DATA_MODULE_INFO : "The Employee Master Data Reports page allows generation and export of comprehensive Employee Master Data based on selected date ranges and employee status. It displays detailed employee information including personal, contact, educational, statutory, banking, and job-related details for accurate HR recordkeeping.",
    STANDARD_REPORTS_JOB_LOCATION_WISE_DATA_MODULE_INFO : "The Job Location Wise Data report lists employees filtered by job location and joining date. It includes personal details, contact numbers, and placeholders for job-related information such as role, shift, and department, allowing generation and export of structured job allocation data.",
    STANDARD_REPORTS_BRANCH_LOCATION_WISE_DATA_MODULE_INFO : "The Branch Location Wise Data report enables generation of employee information based on selected branch locations. It filters records by branch code and joining date, helping HR teams organize, export, and analyze employee distribution across different office branches.",
    STANDARD_REPORTS_FAMILY_MEMBERS_DATA_MODULE_INFO : "The Family Members Data report provides information on employees' family members, including relationship and dependency details. It is generated based on employee status and supports export for records and compliance.",

    //Reports Module Custom Reports Module Info
    CUSTOM_REPORTS_MODULE_INFO : "The Custom Reports section enables users to generate employee reports by selecting specific fields from Personal, Job. Reports can be filtered, customized, and exported for analysis or documentation.",

    //Attendance Reports Module Info
    ATTENDANCE_REPORTS_MODULE_INFO : "Get a complete view of employee attendance reports, including leave, comp off, WFH, permissions, and absences. Helps track availability, ensure compliance, and support workforce planning.",
    ATTENDANCE_LEAVE_REPORTS_MODULE_INFO : "Displays detailed information on all leave applications submitted by employees, including types of leave, start and end dates, number of days availed, department, reporting manager, and approval status.",
    ATTENDANCE_LEAVE_SUMMARY_REPORTS_MODULE_INFO : "Provides a summarized view of leave balances and leave availed by employees across various leave types. Useful for tracking total entitlement, usage, and remaining balance for each employee.",
    ATTENDANCE_COMP_OFF_REPORTS_MODULE_INFO : "Shows compensatory off records for employees who have worked beyond normal working hours or on holidays. Includes applied dates, approved days, and usage status.",
    ATTENDANCE_WFH_REPORTS_MODULE_INFO : "Lists all work-from-home requests along with dates, approval status, employee details, and related comments. Helps HR track remote work utilization and approvals.",
    ATTENDANCE_ABSENT_REPORTS_MODULE_INFO : "Captures all unplanned or unauthorised absences within a selected date range. Helps identify patterns in absenteeism for compliance and corrective action.",
    ATTENDANCE_INACTIVE_EMPLOYEE_REPORTS_MODULE_INFO : "The Inactive Employee Report shows leave entitlements, availed leaves, and balance for inactive employees. It aids in exit processing and compliance audits.",
    ATTENDANCE_YEARLY_SUMMARY_REPORTS_MODULE_INFO : "Provides an annual summary of attendance, leaves, permissions, and other related activities for each employee. Helps HR analyze yearly trends and employee availability.",
    ATTENDANCE_PERMISSION_REPORTS_MODULE_INFO : "Lists all short-duration permissions taken by employees (e.g., late arrivals, early exits), including timing, reason, and manager approval status.",
    ATTENDANCE_REGULARIZATION_REPORTS_MODULE_INFO : "Monitor attendance regularization requests submitted by employees and their approval status.Shows requests for attendance regularization submitted by employees for missed or incorrect entries. Includes dates, corrections made, and approval status.",

    //Monthly Attendance Report Module Info
    MONTHLY_ATTENDANCE_REPORT_MODULE_INFO : "The Monthly Attendance Report allows users to generate a consolidated view of employee attendance, including leaves, work-from-home, permissions, and regularizations. This report supports accurate payroll processing, compliance checks, and performance tracking.",

     //Reports Module Standard Reports Module Info
     POLICY_REPORTS_MODULE_INFO: "Get a comprehensive overview of policy development across departments. Easily filter and track which policies were assigned to whom and when.", 
     POLICY_REPORTS_POLICY_ACK_REPORT_MODULE_INFO : "Monitor employee compliance by tracking who acknowledgedwhich policies ans when. Userful for audits, policy rollout tracking, and ensuring accountability across teams.",
    //Calendar Module Info 
    CALENDAR_MODULE_INFO : "The Calendar page provides a monthly view highlighting key employee events such as birthdays, anniversaries, new joinees, and holidays with respective icons. It helps users stay informed and celebrate milestones by displaying detailed event information on each relevant date.",

    //Policies Module Info
    POLICIES_MODULE_INFO : "The Policies page lists all organizational policies for the selected year, including policy name, description, and downloadable attachments. Users can view specific policy documents like leave policies, holiday policies, and workplace conduct guidelines for easy reference.",

    //Time off Module Info
    TIME_OFF_LEAVES_MODULE_INFO : "The Leave  section displays the total leaves and categorizes them into statuses like Waiting for Approval, Approved, Processed, Rejected, and Cancelled.Employees can apply for different leave types and track approvals and balances.",
    TIME_OFF_LEAVES_TEAM_LEAVE_BALANCE_MODULE_INFO : "The Team Leave Balance section displays the yearly leave balance for team members, including allowed, utilized, booked, and available days. It also shows counts for rejected and cancelled leaves, helping managers track and manage team leave efficiently.",
    TIME_OFF_LEAVES_TEAM_LEAVE_SUMMARY_MODULE_INFO : "The Team Leave Summary section provides a monthly and yearly overview of each team member’s leave activities, including total leaves taken, work-from-home days, permission hours, and regularization hours. It helps managers monitor attendance and ensure policy adherence.",
    TIME_OFF_LEAVES_ORG_LEAVE_BALANCE_MODULE_INFO : "The Org Leave Balance section displays the leave entitlements of employees across different categories for the selected manager and year. It includes allowed, utilized, booked, and available days for each leave type, offering a comprehensive organizational leave overview.",
    TIME_OFF_COMPOFF_ENTITLEMENT_MODULE_INFO : "The Comp-Off section allows employees to request compensatory off and tracks requests across statuses such as Waiting for Approval, Approved, Processed, and Rejected. It lists details like Worked Date, Availed Date, Reason, Applied Date, and current Status.",
    TIME_OFF_WFH_ONDUTY_MODULE_INFO : "The Work From Home (WFH) section allows users to request WFH and track its status, with a current month balance displayed. It shows Worked Date, Availed days, Reason, Applied Date, Status, and available actions.",
    TIME_OFF_PERMISSION_MODULE_INFO : "The Permission section allows employees to request short-duration time off by specifying the permission date, duration in hours, reason, and permission type. Statuses like Waiting for Approval, Approved, or Rejected are shown for tracking.",
    TIME_OFF_REGULARIZATION_MODULE_INFO : "The Regularization section enables employees to request attendance corrections, showing statuses like Waiting for Approval, Approved, Processed, and Rejected. It lists Requested Date, Regularization Date, Duration in Hours, Reason, Type, and Status.",
    TIME_OFF_ON_BEHALF_OF_MODULE_INFO : "The On Behalf Of section allows managers or authorized users to apply for leave on behalf of selected employees. It displays leave details including Date, Leave Type, Duration, Availed, Start and End Date, Reason, and Status across various approval stages.",
    TIME_OFF_PENDING_APPROVAL_MODULE_INFO : "The Pending Approvals section lists all employee requests (e.g., Time-Off, WFH, Comp-Off) awaiting action. It allows managers to approve or reject requests.",
    TIME_OFF_ON_BEHALF_OF_APPROVALS_MODULE_INFO : "The On Behalf Of Approvals section allows authorized users to manage and approve requests submitted by employees. It includes categories such as Time Off, Comp Off, WFH, and Permissions, each showing the count of pending items for review.",
    TIME_OFF_GLOBAL_PERMISSION_MODULE_INFO : "The Global Permissions section allows bulk permission requests across departments and teams. Each request includes details like requester, duration, employee list, and reason.",

    //Events Module Info
    EVENTS_MODULE_INFO : "The Events section displays all upcoming and past events, allowing users to view and manage event details. New events can be created under Custom Events with date, title, description, and attachments for effective communication.",

    //Letters Module Info 
    OFFER_LETTER_MODULE_INFO : "Generate and issue offer letters to selected candidates through the system. HR can configure templates, fill in role-specific details like compensation and joining date, and share them digitally. Candidates can view or download the offer for their reference.",
    APPOINTMENT_LETTER_MODULE_INFO : "Issue appointment letters upon successful joining of an employee. These letters confirm employment terms such as designation, reporting manager, and location. The system allows generation using pre-defined templates and employee details.",
    TRAINEE_OFFER_LETTER_MODULE_INFO : "Send trainee-specific offer letters to shortlisted candidates. The letter outlines training duration, stipend (if applicable), and terms. Templates can be customized and shared digitally for acknowledgment.",
    TRAINEE_APPOINTMENT_LETTER_MODULE_INFO : "Generate appointment letters for trainees once they join the organization. These letters confirm training terms, department allocation, and reporting structure. Letters can be downloaded or shared directly from the system.",
    WELCOME_LETTER_MODULE_INFO : "Share a personalized welcome letter with new joiners. The letter introduces them to the organization, culture, and point-of-contact. HR can customize templates and send them along with onboarding instructions.",
    ADDRESS_PROOF_LETTER_MODULE_INFO : "Generate address proof letters upon employee request. This letter confirms the employee’s official work location and employment details, often used for official or residential purposes.",
    BANK_LOAN_LETTER_MODULE_INFO : "Provide employment confirmation letters for bank loan applications. The letter includes details like designation, salary, and employment tenure. It can be downloaded or printed on company letterhead.",
    APPRAISAL_LETTER_MODULE_INFO : "Issue appraisal letters post-performance evaluations. The letter highlights appraisal period, performance rating, and summary feedback. Templates can be customized and issued to individual employees.",
    SALARY_REVISION_LETTER_MODULE_INFO : "Generate salary revision letters for employees whose compensation has changed. The letter details the new salary structure, effective date, and any remarks. HR can issue them in bulk or individually.",
    PROMOTION_LETTER_MODULE_INFO : "Share promotion letters confirming an employee’s new designation and responsibilities. The letter reflects updated role details and effective dates, and can be generated based on promotion approvals.",
    RELIEVING_LETTER_MODULE_INFO : "Issue relieving letters to employees upon exit. This letter confirms their resignation acceptance, last working date, and relieving status. It can be generated after completing the exit process.",
    PROBATION_CONFIRMATION_LETTER_MODULE_INFO : "Generate confirmation letters for employees who successfully complete their probation. The letter includes confirmation date and updated employment status, and can be downloaded or shared by HR.",
    PROBATION_EXTENSION_LETTER_MODULE_INFO : "Issue extension letters when an employee’s probation is extended. The letter outlines the new extension period and expectations. HR can generate it with relevant remarks and approvals.",

    //Dashboard Module Info
    DASHBOARD_MODULE_INFO : "The Dashboard provides a summary view of employee and trainee statuses, prospective employees, current job openings, and probation details. It also offers quick access to document history, displaying key information like username, date, designation, status, and options to download relevant documents.",
    PROSPECTIVE_EMPLOYEES_MODULE_INFO : "The Prospective Employees page lists candidates with details such as ID, name, personal email, phone number, location, designation, and sub-status reflecting their onboarding progress. Users can add new prospective employees and search the list for efficient candidate management.",
    ACTIVE_EMPLOYEES_MODULE_INFO : "The Active Employees page displays essential details of current employees, including ID, name, contact info, location, shift, and designation. It also allows generating documents such as address proof, bank loan letters, and promotion letters by clicking the 'Generate Document' option for each employee.",
    INACTIVE_EMPLOYEES_MODULE_INFO : "The Inactive Employees page displays essential details of employees who are no longer active, including ID, name, work email, phone number, location, shift, and designation. It also provides an option to generate documents such as experience letters and relieving letters for each inactive employee.",
    PROBATION_EMPLOYEES_MODULE_INFO : "The Probation Employees page displays details of employees currently on probation, including ID, name, email, phone number, probation dates, and designation. It also allows generating documents related to probation status directly from the list.",
    PROSPECTIVE_TRAINEES_MODULE_INFO : "The Prospective Trainees page displays key details such as ID, name, email, phone number, location, designation, training duration, and sub-status. It allows adding new prospective trainees and tracking their onboarding stages.",
    ACTIVE_TRAINEES_MODULE_INFO : "The Active Trainee page displays essential details of current trainees, including ID, name, contact information, location, training status, and designation. Clicking on a trainee’s profile navigates to a detailed view of their profile for further information.",
    INACTIVE_TRAINEES_MODULE_INFO : "The Inactive Trainees page displays a list of trainees who are no longer active, including ID, name, personal email, phone number, location, shift, and designation. It allows users to review past trainee records for reference and administrative purposes.",
    CURRENT_OPENINGS_MODULE_INFO : "The Current Openings section allows HR to post jobs and manage job listings categorized as Active or Inactive. It also tracks applicant statuses through stages like Applied, Interview Process, Rejected, On Hold, Request for Onboarding, Onboarded, and Archive, with search functionality for applicants.",

    //Attendance Module Info 
    ATTENDANCE_MODULE_INFO : "The Attendance section displays a day-wise record for the selected month (May 2025), showing check-in/out times, duration, attendance status, and actions like Apply Leave and Regularization. It also highlights weekends, holidays, and provides an Attendance Summary showing total holidays and absences.",

    //My info Personal Module info 
    PERSONAL_MODULE_BASIC_INFORMATION_MODULE_INFO : "The Basic Information section captures essential employee details such as Employee ID, Salutation, First Name, Middle Name, Last Name, Gender, Date of Birth, Blood Group, and Marital Status. This section allows users to update these fields and save or cancel changes as needed.",
    PERSONAL_MODULE_ONBOARDING_DOCUMENTS_MODULE_INFO :"The Onboarding Documents section displays documents uploaded by prospective employees, including Aadhaar, PAN, and others. HR can view each document and take actions such as verifying or rejecting them to ensure compliance before onboarding.",
    PERSONAL_MODULE_ADDRESS_DETAILS_MODULE_INFO : "The Address Details section captures the employee’s Current and Permanent addresses, including Address Lines, City, State, Country, and Zip/Postal Code. Users can enter or update these details and choose to mark the Permanent Address as the same as the Current Address for convenience.",
    PERSONAL_MODULE_CONTACT_DETAILS_MODULE_INFO : "The Contact Details section captures the employee’s Work Number, Phone Number, Work Email, and Personal Email, including country code selection for phone numbers. Users can update and save these details to ensure accurate communication information.",
    PERSONAL_MODULE_EMERGENCEY_CONTACT_DETAILS_MODULE_INFO : "The Emergency Contact section records details of two emergency contacts, including Name, Email ID, Phone Number with country code, and Relationship. Users can add or update this information to ensure timely communication during emergencies.",
    PERSONAL_MODULE_EDUCATION_DETAILS_MODULE_INFO : "The Education Details section allows employees to add, view, and manage their academic qualifications, including Education level, University, Specialization, GPA, Duration, and supporting Documents. Users can upload new records, download existing documents, and perform actions like edit or delete.",
    PERSONAL_MODULE_IDENTITY_DETAILS_MODULE_INFO : "The Identity Details section allows employees to add and manage their identity documents by specifying Identity Type, Identity Number, and attaching supporting files. Users can download existing attachments and perform actions such as edit or delete records.",
    PERSONAL_MODULE_FAMILY_DETAILS_MODULE_INFO : "The Family Details section enables employees to add and manage information about their family members, including Name, Relationship, Date of Birth, and Dependent status. Users can add new entries and perform actions such as edit or delete existing records.",
    PERSONAL_MODULE_BANK_DETAILS_MODULE_INFO : "The Bank Details section allows employees to add and manage their bank accounts by providing Bank Name, Account Holder's Name, Account Number, IFSC Code, and uploading proof documents. Users can designate a primary bank account and perform actions like edit or delete records.",
    PERSONAL_MODULE_VISA_DETAILS_MODULE_INFO : "The Visa Details section enables employees to add and manage visa information including Visa Type, Issue Date, Expiry Date, Issued Country, and Status. Users can add new visa records and perform actions such as edit or delete existing entries.",

    //My info Job Module info 
    JOB_MODULE_PRE_ONBOARDING_DETAILS_MODULE_INFO : "The Pre-Onboarding Details section captures key milestones like offer, appointment, and trainee offer dates, along with the sender's name and current status. It helps track the progression of onboarding documents.",
    JOB_MODULE_ONBOARDING_DETAILS_MODULE_INFO : "The Onboarding Details section includes the employee's joining date, probation timeline, statutory components (PF, ESIC, PT), and background check status. It also captures prior experience, remote login eligibility, and work location to ensure a complete onboarding record.",
    JOB_MODULE_JOB_DETAILS_MODULE_INFO : "The Job Details section displays the employee's job history with fields like effective date, job role, grade, department, reporting structure, and work location. It allows adding new records to track role changes and organizational alignment over time.",
    JOB_MODULE_SEPARATION_DETAILS_MODULE_INFO : "The Separation Details section outlines the resignation or exit request, including raised date, notice period, last working day, reason, request type, and current approval status. It helps in managing employee offboarding and tracking request progress efficiently.",
    JOB_MODULE_NO_DUE_CLEARANCE_DETAILS_MODULE_INFO : "The No Due Clearance Details section provides information on department-wise clearance requests, showing requested date, approver name, approval status, sub-status, and the employee’s last working day. This ensures smooth offboarding by tracking pending clearances.",
    JOB_MODULE_PROBATION_DETAILS_MODULE_INFO : "The Probation Details section displays information about the employee's probation period, including start and end dates, duration in days, extension details, and approval status. It helps monitor probation progress and manage timely confirmations or extensions.",
    JOB_MODULE_PREVIOUS_EXPERIENCE_DETAILS_MODULE_INFO : "The Previous Experience Details section allows employees to add and view their past employment history, including company name, job role, employment type, duration, and supporting documents. It supports efficient background verification and career progression tracking.",
    JOB_MODULE_CERTIFICATION_DETAILS_MODULE_INFO : "The Certification Details section enables employees to add and manage their certifications, including certification name, ID, issue and expiry dates, and upload relevant documents. This ensures credential tracking for compliance and professional development.",
    JOB_MODULE_COMPENSATION_DETAILS_MODULE_INFO : "The Compensation Details section displays the employee's salary structure, including effective date, pay type, frequency, overtime eligibility, reason for change, and yearly CTC. It helps maintain transparency and track compensation changes efficiently.",
    JOB_MODULE_DESK_DETAILS_MODULE_INFO : "The Desk Details section provides a record of desk allocations for the employee, including desk ID, type, status, allocated date, and released date. This helps in tracking workspace assignments and availability.",
    JOB_MODULE_ASSETS_DETAILS_MODULE_INFO : "The Assets Details section displays the list of assets assigned to the employee, including asset ID, category, sub-category, model, serial number, allocated date, and released date. It ensures effective tracking and management of issued assets.",
    JOB_MODULE_OFFBOARDING_DETAILS_MODULE_INFO : "The Offboarding Details section captures key information regarding an employee's exit, including the reason for leaving, eligibility for rehire, relieving type, and last working day. This ensures a structured and compliant offboarding process.",
    JOB_MODULE_TRAINEE_ONBOARD_REQUEST_MODULE_INFO : "The Trainee Onboard Request section displays trainee onboarding details, including the request date, training start and end dates, extended dates if applicable, and current status. It also allows tracking of training feedback for evaluation and onboarding decisions.",

    //My Info Documents Module Info
    DOCUMENTS_MODULE_INFO : "The Document section provides categorized storage for important organizational files, including employee documents, appraisal/promotion letters, and policy documents. Users can navigate through folders and subfolders to view file details.",

    //Team Members Module Info 
    TEAM_MEMBERS_MODULE_INFO : "Clicking on the Team Members tab will display the list of team members, with a button at the top to change the TM or RM. You can update the Reporting Manager (RM) or Team Manager (TM) for individual employees or apply changes in bulk for a group.",
}