import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
import { OpenModalService } from '../../../services/open-modal.service';
import { Select } from 'primeng/select';
import { AccordionModule } from 'primeng/accordion';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-load-entitlements',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NoDataFoundComponent, Select, AccordionModule],
  templateUrl: './load-entitlements.component.html',
  styleUrl: './load-entitlements.component.scss',
  standalone: true,
})

export class LoadEntitlementsComponent {
  selectedEmployeeDetails: any;
  selectedEmployeeId: any;
  selectedFrequencyType: string = '';
  collectedCategoryIds: number[] = [];
  collectedLocationId: number = 0;
  collectedSubLocationId: number = 0;
  collectedShiftId: number = 0;
  // Map of categoryId -> policyId for the selected employee
  employeePolicyMap: Map<number, number> = new Map();
  // Map of categoryId -> isApplicableProRataLeave
  categoryProRataMap: Map<number, boolean> = new Map();
  // Map of categoryId -> { gradeId, allowedDays } for payload
  categoryGradeMap: Map<number, { gradeId: number; allowedDays: number }> = new Map();
  categoryFrequencyMap: Map<number, string> = new Map();
  categoryCycleHandlingMap: Map<number, string> = new Map();
  selectedCycleHandling: string = '';
  entitlementBreakdownData: any[] = [];
  categoryTablesOrdered: any[] = [];
  breakdownForm!: FormGroup;
  breakdownLoader: boolean = false;
  private originalBreakdownData: any[] = [];
  destroy$: Subject<boolean> = new Subject<boolean>();
  employeeOptions: { label: string; value: any }[] = [];
  isDisabled!: boolean;
  subscription!: Subscription;
  empdata = {} as any;
  jobDetails: any;
  employeeTouched = false;
  employeeiddetails: any[] = [];
  currentDate: Date = new Date();
  loggedinuser = {} as any;
  private employeeSelectionRequestVersion = 0;
  frequencyTypes: { label: string; value: string }[] = [
    { label: 'Monthly', value: 'MONTHLY' },
    { label: 'Quarterly', value: 'QUARTERLY' },
    { label: 'Half Yearly', value: 'HALF_YEARLY' },
    { label: 'Yearly', value: 'YEARLY' },
  ];
  cycleHandlingOptions: { label: string; value: string }[] = [
    { label: 'Frozen', value: 'FROZEN' },
    { label: 'Carry Forward', value: 'CARRY_FORWARD' },
    { label: 'Lapsed', value: 'LAPSED' },
  ];
  jobid: any;

  loading: boolean = false;

  // --- delete confirmation state ---
  pendingDeleteCardIdx: number = -1;
  pendingDeleteCatIdx: number = -1;
  @ViewChild('deleteConfirmTpl', { static: true }) deleteConfirmTpl!: TemplateRef<any>;
  @ViewChild('addConfirmTpl', { static: true }) addConfirmTpl!: TemplateRef<any>;
  @ViewChild('cancelConfirmTpl', { static: true }) cancelConfirmTpl!: TemplateRef<any>;

  // --- already entitled state ---
  alreadyEntitled: boolean = false;
  entitledData: any[] = [];
  viewCyclesEntry: any = null;
  showCyclesModal: boolean = false;
  @ViewChild('cyclesModalTpl', { static: true }) cyclesModalTpl!: TemplateRef<any>;

  // --- new multi-card state ---
  frequencyCards: {
    frequencyType: string;
    cycleHandling: string;
    selectedCategoryIdx: number;
    categories: {
      categoryId: number;
      categoryName: string;
      frequencyType: string;
      cycleHandling: string;
      deleted: boolean;
      tableData: any;
      originalData: any;
      formGroup: FormGroup;
      breakdownLoader: boolean;
      isModified: boolean;
      isExcluded: boolean;
      exclusionReason: string;
    }[];
  }[] = [];
  showAddForm: boolean = false;
  addForm: { frequency: string; categories: number[]; cycleHandling: string } =
    { frequency: '', categories: [], cycleHandling: '' };
  addFormTouched = { frequency: false, categories: false, cycleHandling: false };
  allCategoryOptions: { label: string; value: number }[] = [];
  availableCategoryOptions: { label: string; value: number }[] = [];
  private get conformationPopup(): OpenModalService { return this.confirmation; }

  constructor(
    private fb: FormBuilder,
    private http: HttpService,
    private authService: AuthService,
    private confirmation: OpenModalService,
    private modalService: NgbModal
  ) {
    this.breakdownForm = this.fb.group({ categories: this.fb.array([]) });
  }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getEmployeeId();
    this.getJobdetails();
  }

  getEmployeeId() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeiddetails = data;
        this.employeeOptions = data.map((emp: any) => {
          const fullName = emp.middleName
            ? `${emp.firstName} ${emp.middleName} ${emp.lastName}`
            : `${emp.firstName} ${emp.lastName}`;
          return { label: `${emp.fusionEmpId ?? ''} - ${fullName}`, value: emp.employeeId };
        });
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  getJobdetails() {
    this.subscription = this.http.getData('JobDetails/getAllJobdetails').subscribe({
      next: (data: any) => {
        this.jobDetails = data;
      },
      error: (reason: any) => {
        console.log(reason);
      },
    });
  }

  private nextEmployeeSelectionRequestVersion(): number {
    this.employeeSelectionRequestVersion += 1;
    return this.employeeSelectionRequestVersion;
  }

  private isActiveEmployeeSelection(employeeId: string, requestVersion: number): boolean {
    return (
      this.employeeSelectionRequestVersion === requestVersion &&
      String(this.selectedEmployeeId ?? '') === String(employeeId)
    );
  }

  private clearEmployeeFormFields(): void {
    const fields = ['dateOfJoining', 'WorkEmail', 'location', 'sublocation', 'shift'];
    fields.forEach(id => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (el) el.value = '';
    });
  }

  clearSelectedEmployee(markTouched: boolean = false): void {
    this.nextEmployeeSelectionRequestVersion();
    this.employeeTouched = markTouched ? true : this.employeeTouched;
    this.resetPage();
  }

  onEmployeeClear(): void {
    this.clearSelectedEmployee();
  }

  private resetEmployeeDataState(): void {
    this.selectedEmployeeDetails = null;
    this.selectedEmployeeId = null;
    this.selectedFrequencyType = '';
    this.selectedCycleHandling = '';
    this.frequencyCards = [];
    this.breakdownLoader = false;
    this.loading = false;
    this.showAddForm = false;
    this.addForm = { frequency: '', categories: [], cycleHandling: '' };
    this.addFormTouched = { frequency: false, categories: false, cycleHandling: false };
    this.allCategoryOptions = [];
    this.availableCategoryOptions = [];
    this.alreadyEntitled = false;
    this.entitledData = [];
    this.viewCyclesEntry = null;
    this.showCyclesModal = false;
    this.employeePolicyMap = new Map();
    this.categoryProRataMap = new Map();
    this.categoryGradeMap = new Map();
    this.categoryFrequencyMap = new Map();
    this.categoryCycleHandlingMap = new Map();
    this.collectedCategoryIds = [];
    this.categoryTablesOrdered = [];
    this.breakdownForm = this.fb.group({ categories: this.fb.array([]) });
    this.clearEmployeeFormFields();
  }

  onOptionClick(employeeId: string) {
    if (!employeeId) {
      this.clearSelectedEmployee();
      return;
    }

    const requestVersion = this.nextEmployeeSelectionRequestVersion();

    try {
      // Find corresponding details in Employeedata/ActiveEmployees
      this.selectedEmployeeDetails = this.employeeiddetails.find(
        (detail) => detail.employeeId === employeeId
      );
      this.fetchEmployeeDetails(employeeId, requestVersion);
      // Check if details are found for the selected employee
      if (this.selectedEmployeeDetails) {
        // Update HTML input boxes with retrieved employee details
        const dateOfJoiningInput = document.getElementById('dateOfJoining') as HTMLInputElement;
        const firstNameInput = document.getElementById('FirstName') as HTMLInputElement;
        const lastNameInput = document.getElementById('LastName') as HTMLInputElement;
        const workEmailInput = document.getElementById('WorkEmail') as HTMLInputElement;
        const probationStatusInput = document.getElementById('ProbationStatus') as HTMLInputElement;
        if (dateOfJoiningInput)
          dateOfJoiningInput.value = this.selectedEmployeeDetails.dateOfJoining
            ? this.formatDate(this.selectedEmployeeDetails.dateOfJoining) : '-';
        if (firstNameInput)
          firstNameInput.value = this.selectedEmployeeDetails.firstName || '-';
        if (lastNameInput)
          lastNameInput.value = this.selectedEmployeeDetails.lastName || '-';
        if (workEmailInput)
          workEmailInput.value = this.selectedEmployeeDetails.workEmail || '-';
        if (probationStatusInput)
          probationStatusInput.value = this.selectedEmployeeDetails.probationStatus || '-';
        // Now use the employeeId to find location, subLocation, and shiftName in JobDetails
        const employeeId = this.selectedEmployeeDetails.employeeId;
        // Find corresponding details in JobDetails
        const selectedJobDetails = this.jobDetails.find(
          (detail: { employeeId: any }) => detail.employeeId === employeeId

        );

        this.selectedFrequencyType = ''
        this.selectedCycleHandling = ''
        // Check if details are found for the selected employee in JobDetails
        if (selectedJobDetails) {
          // Update HTML input boxes with retrieved job details
          const locationInput = document.getElementById('location') as HTMLInputElement;
          const sublocationInput = document.getElementById('sublocation') as HTMLInputElement;
          const shiftInput = document.getElementById('shift') as HTMLInputElement;
          if (locationInput)
            locationInput.value = selectedJobDetails ? selectedJobDetails.locationName : '-';
          if (sublocationInput)
            sublocationInput.value = selectedJobDetails ? selectedJobDetails.sublocationName : '-';
          if (shiftInput)
            shiftInput.value = selectedJobDetails ? selectedJobDetails.shiftName : '-';
        } else {
          console.log('No details found for the selected employee in JobDetails/getAllJobdetails.');
        }
      } else {
        throw new Error(
          'No details found for the selected FusionEmpId in Employeedata/ActiveEmployees.'
        );
      }
    } catch (error) {
      // Display popup for missing details
      const modalElement = document.getElementById('entitled');
      // if (modalElement) {
      //   modalElement.classList.add('show');
      //   modalElement.style.display = 'block';
      //   this.StatusMsg = 'Job details are missing for the selected employee';
      // }
    }
  }

  // findEmployeeId(fusionEmpId: string): string | undefined {
  //   // employee data stored in this.employeeiddetails
  //   const employee = this.employeeiddetails.find(
  //     (emp) => emp.fusionEmpId === fusionEmpId
  //   );
  //   return employee ? employee.employeeId : undefined;
  // }

  leavePolicyRecords: any[] = [];
  // Method to process API response data and populate leavePolicyRecords
  processLeavePolicyData(data: any) {

    if (Array.isArray(data)) {
      this.leavePolicyRecords = data.map((record: any) => {
        const entitledLeaves = this.calculateEntitlement(
          record.dateOfJoining,
          record.allowedDays,
          record.isApplicableProRataLeave
        );
        return {
          category: record.name,
          policyLeaves: record.allowedDays,
          entitledLeaves: entitledLeaves,
          // Add other properties as needed
        };
      });
    }
  }

  // Assuming you get the API response in a method like this
  handleAPIData(response: any) {
    if (response && Array.isArray(response)) {
      this.processLeavePolicyData(response);
    } else {
      console.log('Invalid API response format.');
    }
  }

  // Initialize tableData array with objects
  tableData: {
    category: string;
    policyLeaves: number;
    isApplicableProRataLeave?: boolean;
    entitledLeaves: number;
    year: number; // Add year property
    categoryId: number; // Add categoryId property
  }[] = [];

  calculateEntitlement(
    dateOfJoining: string,
    allowedDays: number,
    isApplicableProRataLeave: boolean | null
  ): number {
    // Step 1: Convert dateOfJoining to Date object
    const doj = new Date(dateOfJoining);
    // Step 2: Get the current date
    const currentDate = new Date();
    // Step 3: Calculate elapsed days from the start of the year to DOJ
    const startOfYear = new Date(doj.getFullYear(), 0, 0);
    const elapsedDays = Math.floor(
      (doj.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    );
    // Step 4: Calculate total days in the current year
    const totalDaysInYear = this.isLeapYear(currentDate.getFullYear()) ? 366 : 365;
    // Step 5: Calculate entitled leaves based on isApplicableProRataLeave
    let entitledLeaves: number;
    if (isApplicableProRataLeave && typeof isApplicableProRataLeave === 'boolean') {
      // Step 5a: Calculate entitlement for pro-rata leave
      const workingDaysInYear = totalDaysInYear - elapsedDays;
      entitledLeaves = (allowedDays / totalDaysInYear) * workingDaysInYear;
    } else {
      // Step 5b: Use allowedDays as entitled leaves if pro-rata leave is not applicable
      entitledLeaves = allowedDays;
    }
    // Step 6: Round entitled leaves to the nearest 0.5
    entitledLeaves = Math.round(entitledLeaves * 2) / 2;
    // Step 7: Return entitled leaves
    return entitledLeaves;
  }

  // Check if a year is a leap year
  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  // Function to format date
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  editRow(entitledLeaves: HTMLTableCellElement, record: any) {
    // Create a new input element
    let input = document.createElement('input');
    input.value = entitledLeaves.innerText;
    // Add focus event listener to remove the outline
    input.addEventListener('focus', function () {
      this.style.outline = 'none';
      this.style.boxShadow = 'none';
      this.style.border = 'none';
      this.style.paddingLeft = '48%';
      this.style.paddingTop = '5%';
    });
    // Replace the td element with the input element
    entitledLeaves.replaceWith(input);
    // Focus the input element
    input.focus();
    // Add keypress event listener to restrict input and enforce limits
    input.addEventListener('keypress', function (e) {
      // Block the enter key
      if (e.keyCode === 13) {
        e.preventDefault();
        return;
      }
      // Check if the entered key is a digit or a valid decimal point
      if (!((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105) ||
        (e.key === '.' && this.value.indexOf('.') === -1))) {
        e.preventDefault();
      }
      const key = e.key;
      // Check if the pressed key is not a digit or a valid decimal point
      if (!(/^\d$/.test(key) || key === '.')) {
        e.preventDefault();
        return;
      }
      // Check if the entered value is less than or equal to policyLeaves
      if (parseFloat(this.value + e.key) > record.policyLeaves) {
        e.preventDefault();
      }
      // Check if the entered key is a decimal point and the current text already contains a decimal point
      if (e.key === '.' && this.value.indexOf('.') !== -1) {
        e.preventDefault();
      }
      // Check if the entered key is a number and the current text starts with '0'
      if (!isNaN(parseInt(e.key)) && this.value.startsWith('0')) {
        if (e.key !== '5' || this.value !== '0.') {
          e.preventDefault();
        }
      }
      // Check if the entered key is a number and the current text ends with '.'
      if (!isNaN(parseInt(e.key)) && this.value.endsWith('.')) {
        if (e.key !== '5') {
          e.preventDefault();
        }
      }
      // Check if the entered key is a number and the current text ends with '.5'
      if (!isNaN(parseInt(e.key)) && this.value.endsWith('.5')) {
        e.preventDefault();
      }
    });
    // Add paste event listener to prevent pasting into the cell
    input.addEventListener('paste', function (e) {
      e.preventDefault();
    });
    // Add input event listener to update the record's entitled leaves value in the tableData array
    input.addEventListener('input', () => {
      // Update the record's entitled leaves value in the tableData array with the new value from the cell
      record.entitledLeaves = parseFloat(input.value);
      // Update the button state
      this.updateButtonState();
    });
    // Add blur event listener to replace the input element with the td element
    input.addEventListener('blur', () => {
      // Replace the input element with the td element
      input.replaceWith(entitledLeaves);
      // Update the td element's innerText with the input value
      entitledLeaves.innerText = input.value;
    });
  }

  updateButtonState() {
    // Disable the button if any entitledLeaves field is empty
    const isAnyEmpty = this.tableData.some((record) => !record.entitledLeaves);
    const button = document.querySelector(
      '.btn.btn-primary'
    ) as HTMLButtonElement;
    if (button) {
      button.disabled = isAnyEmpty;
    }
  }

  StatusMsg: any;
  // sendEntitlementRequest() {
  //   // Iterate through each record in tableData and construct the request body for each record
  //   this.tableData.forEach((record) => {
  //     const requestBody = {
  //       employeeId: this.selectedEmployeeDetails.employeeId,
  //       year: record.year,
  //       addedBy: this.loggedinuser.employeeId,
  //       leaveEntitlements: [
  //         {
  //           employeeId: this.selectedEmployeeDetails.employeeId,
  //           year: record.year,
  //           addedBy: this.loggedinuser.employeeId,
  //           leaveCategoryId: record.categoryId,
  //           entitlementDays: record.entitledLeaves,
  //         },
  //       ],
  //     };
  //     this.http.postdata('LeaveEntitlements/load', requestBody).subscribe((response: any) => {
  //      this.confirmation.openSuccessModal('Leaves entitled successfully');
  //       setTimeout(function () {
  //         location.reload();
  //       }, 2000);
  //     });
  //   });
  // }

  sendEntitlementRequest() {
    if (!this.selectedEmployeeDetails || this.frequencyCards.length === 0) return;

    const employeeJobDetails = this.jobDetails.find((d: any) => d.employeeId === this.selectedEmployeeDetails.employeeId);
    const allEntitlements: any[] = [];

    for (const card of this.frequencyCards) {
      for (const entry of card.categories) {
        if (entry.deleted || !entry.tableData) continue;
        const table = entry.tableData;
        const policyId = this.employeePolicyMap.get(table.categoryId) ?? 0;
        const gradeInfo = this.categoryGradeMap.get(table.categoryId);
        const cyclesArray = this.getEntryCyclesArray(entry);

        const cycles = table.cycles.map((cycle: any, cycleIdx: number) => {
          const rowGroup = cyclesArray.at(cycleIdx) as FormGroup;
          let entitlementValue: number;
          if (table.isProRata) {
            const proCtrl = rowGroup.get('proRata_col_0');
            entitlementValue = Number(proCtrl?.value ?? rowGroup.get('col_0')?.value ?? 0);
          } else {
            entitlementValue = Number(rowGroup.get('col_0')?.value ?? 0);
          }
          return {
            cycle_no: cycle.cycleNo,
            cycle_start: cycle.start ? this.formatDateToISO(cycle.start) : null,
            cycle_end: cycle.end ? this.formatDateToISO(cycle.end) : null,
            entitlement: entitlementValue
          };
        });

        allEntitlements.push({
          categoryId: table.categoryId,
          policyId,
          frequencyType: this.categoryFrequencyMap.get(table.categoryId) ?? card.frequencyType,
          cycleHandling: this.categoryCycleHandlingMap.get(table.categoryId) ?? card.cycleHandling,
          allowedDays: gradeInfo?.allowedDays ?? 0,
          cycles
        });
      }
    }

    const payload = {
      jobType: 'LoadEntitlement',
      year: new Date().getFullYear(),
      locationId: this.collectedLocationId,
      subLocationId: this.collectedSubLocationId,
      shiftId: this.collectedShiftId,
      initiatedBy: this.empdata.employeeId,
      requestPayload: {
        employees: [
          {
            employeeId: this.selectedEmployeeDetails.employeeId,
            gradeId: employeeJobDetails?.gradeId ?? null,
            locationId: this.collectedLocationId,
            subLocationId: this.collectedSubLocationId,
            shiftId: this.collectedShiftId,
            entitlements: allEntitlements
          }
        ]
      }
    };

    this.loading = true;
    this.http.postdata('LeaveEntitlementJobs/create-entitlement', payload).subscribe({
      next: () => {
        this.loading = false;
        const empName = this.selectedEmployeeDetails?.firstName
          ? `${this.selectedEmployeeDetails.firstName} ${this.selectedEmployeeDetails.lastName ?? ''}`.trim()
          : 'Employee';
        this.confirmation.openSuccessModal(
          `Leave Entitlement added successfully.`
        );
        this.resetPage();
      },
      error: (err: any) => {
        this.loading = false;
        this.confirmation.openErrorModal(err?.error?.message || 'Failed to load entitlements');
      }
    });
  }

  // fetchEmployeeDetails(fusionEmpId: string) {
  //   // Step 1: Find the employeeId for the given fusionEmpId
  //   const employeeId = this.findEmployeeId(fusionEmpId);
  //   // Step 2: Check if employeeId is available
  //   if (employeeId) {
  //     // Step 3: Call the API endpoint with the employeeId
  //     this.sendAPIRequest(employeeId);
  //   } else {
  //     // Step 4: Handle scenarios where the employeeId is not provided
  //     console.log('Step 4: EmployeeId not provided.');
  //   }
  // }

  fetchEmployeeDetails(employeeId: string, requestVersion: number) {
    if (employeeId) {
      this.sendAPIRequest(employeeId, requestVersion);
    } else {
      console.log('EmployeeId not provided.');
    }
  }


  sendAPIRequest(employeeId: string, requestVersion: number) {
    if (!this.isActiveEmployeeSelection(employeeId, requestVersion)) return;

    // Clear the tableData array
    this.tableData = [];
    this.employeePolicyMap = new Map();
    this.categoryProRataMap = new Map();
    this.categoryGradeMap = new Map();
    this.categoryFrequencyMap = new Map();
    this.categoryCycleHandlingMap = new Map();
    this.categoryTablesOrdered = [];
    this.breakdownForm = this.fb.group({ categories: this.fb.array([]) });
    // Reset new multi-card state
    this.frequencyCards = [];
    this.showAddForm = false;
    this.addForm = { frequency: '', categories: [], cycleHandling: '' };
    this.addFormTouched = { frequency: false, categories: false, cycleHandling: false };
    this.allCategoryOptions = [];
    this.availableCategoryOptions = [];
    this.alreadyEntitled = false;
    this.entitledData = [];
    this.viewCyclesEntry = null;
    this.showCyclesModal = false;
    // Step 5: Sending API request to get leave policy details
    // Step 6: Find employee details from jobDetails
    const employeeDetails = this.jobDetails.find(
      (detail: any) => detail.employeeId === employeeId
    );
    if (!employeeDetails) {
      if (!this.isActiveEmployeeSelection(employeeId, requestVersion)) return;
      this.collectedCategoryIds = [];
      this.collectedLocationId = 0;
      this.collectedSubLocationId = 0;
      this.collectedShiftId = 0;
      this.breakdownLoader = false;
      return;
    }
    const { locationId, subLocationId, shiftId, gradeId } = employeeDetails;
    // Step 7: Prepare the request body
    const requestBody = {
      employeeId,
      year: new Date().getFullYear(),
      locationId,
      subLocationId,
      shiftId,
      entityReferenceId: gradeId,
      entityType: 'Grade',
      status: 'Published',
    };
    // Step 7: Call the API endpoint to get leave policy details
    this.http.postdata('LeavePolicy/getgeneralpolicies', requestBody)
      .subscribe({
        next: (response: any) => {
        if (!this.isActiveEmployeeSelection(employeeId, requestVersion)) return;
        // Collect categoryIds and job details from response
        if (Array.isArray(response) && response.length > 0) {
          this.collectedCategoryIds = response.map((item: any) => item.categoryId);
          this.collectedLocationId = response[0].locationId;
          this.collectedSubLocationId = response[0].subLocationId;
          this.collectedShiftId = response[0].shiftId;
          // Store categoryId -> policyId (id field) map for the employee
          this.employeePolicyMap = new Map(
            response.map((item: any) => [item.categoryId, item.id])
          );
          // Store categoryId -> isApplicableProRataLeave map
          this.categoryProRataMap = new Map(
            response.map((item: any) => [item.categoryId, item.orgLeaveCategories?.isApplicableProRataLeave === true])
          );
          // Store categoryId -> { gradeId, allowedDays } for payload
          this.categoryGradeMap = new Map(
            response.map((item: any) => [item.categoryId, { gradeId: item.entityReferenceId, allowedDays: item.allowedDays }])
          );
          this.categoryFrequencyMap = new Map(
            response.map((item: any) => [item.categoryId, item.frequencyType ?? item.frequency_type ?? response[0]?.frequencyType ?? response[0]?.frequency_type ?? 'YEARLY'])
          );
          this.categoryCycleHandlingMap = new Map(
            response.map((item: any) => [item.categoryId, item.cycleHandling ?? item.cycle_handling ?? response[0]?.cycleHandling ?? response[0]?.cycle_handling ?? ''])
          );
          // Build category dropdown options for Add New form
          this.allCategoryOptions = response.map((item: any) => ({
            label: item.orgLeaveCategories?.name ?? `Category ${item.categoryId}`,
            value: item.categoryId
          }));
          this.refreshAvailableCategoryOptions();
          this.loadEntitlementBreakdown(employeeId, locationId, subLocationId, shiftId, requestVersion);
          // Validate before load
          this.validateBeforeLoad(
            employeeId,
            this.collectedCategoryIds,
            this.collectedLocationId,
            this.collectedSubLocationId,
            this.collectedShiftId,
            requestVersion
          );
        } else {
          this.collectedCategoryIds = [];
          this.collectedLocationId = 0;
          this.collectedSubLocationId = 0;
          this.collectedShiftId = 0;
          this.frequencyCards = [];
          this.entitledData = [];
          this.alreadyEntitled = false;
          this.breakdownLoader = false;
        }
      },
      error: (err: any) => {
        if (!this.isActiveEmployeeSelection(employeeId, requestVersion)) return;
        console.error('Error fetching leave policies:', err);
        this.collectedCategoryIds = [];
        this.collectedLocationId = 0;
        this.collectedSubLocationId = 0;
        this.collectedShiftId = 0;
        this.frequencyCards = [];
        this.entitledData = [];
        this.alreadyEntitled = false;
        this.breakdownLoader = false;
      }
    });
    // Step 9: Call the API endpoint to fetch entitlements
    // (validateBeforeLoad is now called inside the policy response handler above)
  }

  validateBeforeLoad(employeeId: string, categoryIds: number[], locationId: number, subLocationId: number, shiftId: number, requestVersion: number = this.employeeSelectionRequestVersion): void {
    const payload = {
      employeeIds: [Number(employeeId)],
      categoryIds,
      locationId,
      subLocationId,
      shiftId,
      year: new Date().getFullYear()
    };
    this.http.postdata('LoadEntitlementValidator/validate-before-load', payload).subscribe({
      next: (res: any) => {
        if (!this.isActiveEmployeeSelection(employeeId, requestVersion)) return;
        const data = res?.data;
        if (data?.alreadyEntitled === true) {
          this.alreadyEntitled = true;
          this.entitledData = data.employees?.[0]?.categories ?? [];
        } else {
          this.alreadyEntitled = false;
          this.entitledData = [];
        }
      },
      error: () => {
        if (!this.isActiveEmployeeSelection(employeeId, requestVersion)) return;
        this.alreadyEntitled = false;
        this.entitledData = [];
      }
    });
  }

  processSingleResponse(item: any) {
    // Extract relevant data from the item
    const policyLeaves = item.allowedDays;
    const isApplicableProRataLeave = item.orgLeaveCategories?.isApplicableProRataLeave;
    // Calculate entitled leaves based on policy
    const entitledLeaves = this.calculateEntitlement(
      this.selectedEmployeeDetails.dateOfJoining,
      policyLeaves,
      isApplicableProRataLeave
    );
    // Push data to tableData array
    this.tableData.push({
      category: item.orgLeaveCategories.name,
      policyLeaves,
      isApplicableProRataLeave,
      entitledLeaves,
      year: item.year,
      categoryId: item.categoryId,
    });
    // Assign tableData to leavePolicyRecords
    this.leavePolicyRecords = this.tableData;
  }

  private loadEntitlementBreakdown(employeeId: string, locationId: number, subLocationId: number, shiftId: number, requestVersion: number = this.employeeSelectionRequestVersion): void {
    const payload = {
      employeeId: Number(employeeId),
      location_id: locationId,
      sub_location_id: subLocationId,
      shift_id: shiftId,
      year: new Date().getFullYear(),
    };

    this.breakdownLoader = true;
    this.frequencyCards = [];
    this.categoryTablesOrdered = [];
    this.breakdownForm = this.fb.group({ categories: this.fb.array([]) });

    this.http.postdata('OrgLeavesCategories/leave-entitlement-breakdown', payload).subscribe({
      next: (response: any) => {
        if (!this.isActiveEmployeeSelection(employeeId, requestVersion)) return;
        this.entitlementBreakdownData = response;
        this.originalBreakdownData = JSON.parse(JSON.stringify(Array.isArray(response?.categories) ? response.categories : []));
        this.buildFrequencyCardsFromBreakdown(response);
        this.breakdownLoader = false;
      },
      error: (err: any) => {
        if (!this.isActiveEmployeeSelection(employeeId, requestVersion)) return;
        console.error('Error fetching entitlement breakdown:', err);
        this.breakdownLoader = false;
        this.entitlementBreakdownData = [];
        this.originalBreakdownData = [];
        this.frequencyCards = [];
        this.categoryTablesOrdered = [];
        this.breakdownForm = this.fb.group({ categories: this.fb.array([]) });
      }
    });
  }

  onFrequencyChange(): void {
    if (!this.selectedCycleHandling || !this.collectedCategoryIds.length) return;
    const payload = {
      category_ids: this.collectedCategoryIds,
      frequency_type: this.selectedFrequencyType,
      location_id: this.collectedLocationId,
      sub_location_id: this.collectedSubLocationId,
      shift_id: this.collectedShiftId,
      year: new Date().getFullYear(),
    };
    this.breakdownLoader = true;
    this.categoryTablesOrdered = [];
    this.http.postdata('OrgLeavesCategories/leave-entitlement-breakdown', payload).subscribe({
      next: (response: any) => {
        this.entitlementBreakdownData = response;
        this.originalBreakdownData = JSON.parse(JSON.stringify(Array.isArray(response?.categories) ? response.categories : []));
        this.buildCategoryTables(response);
        this.breakdownLoader = false;
      },
      error: (err: any) => {
        console.error('Error fetching entitlement breakdown:', err);
        this.breakdownLoader = false;
        this.categoryTablesOrdered = [];
        this.breakdownForm = this.fb.group({ categories: this.fb.array([]) });
      }
    });
  }

  private buildCategoryTables(response: any): void {
    const frequencyType = response?.frequency_type ?? this.selectedFrequencyType;
    const categories = Array.isArray(response?.categories) ? response.categories : [];
    const tables: any[] = [];

    for (const category of categories) {
      const categoryId = category?.category_id;
      if (!categoryId) continue;
      const groups = Array.isArray(category?.groups) ? category.groups : [];
      const cycleMetaByNo = new Map<number, any>();
      const cycleEntitlementsByNo = new Map<number, number[]>();

      const employeePolicyId = this.employeePolicyMap.get(categoryId);
      let matchedGroupIdx = groups.findIndex((g: any) =>
        Array.isArray(g?.grades) && g.grades.some((gr: any) => gr?.policy_id === employeePolicyId)
      );
      if (matchedGroupIdx === -1) matchedGroupIdx = 0;
      const matchedGroup = groups[matchedGroupIdx];
      const matchedGrade = Array.isArray(matchedGroup?.grades)
        ? (matchedGroup.grades.find((gr: any) => gr?.policy_id === employeePolicyId) ?? matchedGroup.grades[0])
        : null;
      const columns = [{
        columnId: 0,
        gradeLabel: matchedGrade?.grade_name ?? '-',
        allowedDays: matchedGrade?.allowed_days ?? (typeof matchedGroup?.allowed_days === 'number' ? matchedGroup.allowed_days : 0),
        matchedPolicyId: matchedGrade?.policy_id ?? null
      }];

      const cycleProRataByNo = new Map<number, number | null>();
      groups.forEach((group: any, colIdx: number) => {
        const cycles = Array.isArray(group?.cycles) ? group.cycles : [];
        for (const c of cycles) {
          const cycleNo = c?.cycle_no;
          if (!cycleNo) continue;
          const start = c?.cycle_start ? new Date(c.cycle_start) : null;
          const end = c?.cycle_end ? new Date(c.cycle_end) : null;
          if (!cycleMetaByNo.has(cycleNo)) {
            cycleMetaByNo.set(cycleNo, { cycleNo, start, end, label: this.formatCycleLabel(frequencyType, cycleNo, start, end) });
          }
          if (!cycleEntitlementsByNo.has(cycleNo)) cycleEntitlementsByNo.set(cycleNo, new Array(columns.length).fill(null));
          cycleEntitlementsByNo.get(cycleNo)![colIdx] = typeof c?.entitlement === 'number' ? c.entitlement : null;
          if (colIdx === 0 && typeof c?.pro_rata_entitlement === 'number')
            cycleProRataByNo.set(cycleNo, c.pro_rata_entitlement);
        }
      });

      const cycleRows = Array.from(cycleMetaByNo.values()).sort((a, b) => a.cycleNo - b.cycleNo).map(cycle => {
        const proRataValue = cycleProRataByNo.get(cycle.cycleNo) ?? null;
        const isProRataCycle = proRataValue !== null;
        return {
          ...cycle,
          entitlements: cycleEntitlementsByNo.get(cycle.cycleNo) ?? new Array(columns.length).fill(null),
          isProRataCycle,
          proRataValue
        };
      });

      const isProRata = this.categoryProRataMap.get(categoryId) === true;
      tables.push({ categoryId, categoryName: category?.category_name ?? '-', frequencyType, columns, cycles: cycleRows, isProRata });
    }

    this.categoryTablesOrdered = tables;
    this.buildBreakdownForm(tables);
  }

  private buildFrequencyCardsFromBreakdown(response: any): void {
    const categories = Array.isArray(response?.categories) ? response.categories : [];
    const combinedCard: any = {
      frequencyType: '',
      cycleHandling: '',
      selectedCategoryIdx: 0,
      categories: []
    };

    for (const category of categories) {
      const categoryId = Number(category?.category_id);
      if (!categoryId) continue;

      const frequencyType =
        category?.frequency_type ??
        category?.frequencyType ??
        this.categoryFrequencyMap.get(categoryId) ??
        response?.frequency_type ??
        response?.frequencyType ??
        'YEARLY';

      const cycleHandling =
        category?.cycle_handling ??
        category?.cycleHandling ??
        this.categoryCycleHandlingMap.get(categoryId) ??
        response?.cycle_handling ??
        response?.cycleHandling ??
        '';

      const entry: any = {
        categoryId,
        categoryName: category?.category_name ?? `Category ${categoryId}`,
        frequencyType,
        cycleHandling,
        deleted: false,
        tableData: null,
        originalData: null,
        formGroup: this.fb.group({ cycles: this.fb.array([]) }),
        breakdownLoader: false,
        isModified: false,
        isExcluded: false,
        exclusionReason: '',
      };

      if (category?.is_applicable === false) {
        entry.isExcluded = true;
        entry.exclusionReason = category?.exclusion_reason ?? 'Not applicable';
      } else {
        entry.tableData = this.buildSingleCategoryTable(category, frequencyType);
        entry.originalData = JSON.parse(JSON.stringify(category));
        entry.formGroup = this.buildSingleCategoryForm(entry.tableData);
        entry.formGroup.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
          entry.isModified = true;
          this.formChangeCounter++;
        });
      }

      combinedCard.categories.push(entry);
    }

    this.frequencyCards = combinedCard.categories.length > 0 ? [combinedCard] : [];
  }

  private formatCycleLabel(frequencyType: string, cycleNo: number, start: Date | null, end: Date | null): string {
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).replace(',', '');
    if (!start || !end) {
      if (frequencyType === 'MONTHLY') return `M${cycleNo}`;
      if (frequencyType === 'QUARTERLY') return `Q${cycleNo}`;
      if (frequencyType === 'HALF_YEARLY') return `H${cycleNo}`;
      return cycleNo === 1 ? 'Year' : `Cycle ${cycleNo}`;
    }
    const range = `${formatDate(start)} - ${formatDate(end)}`;
    if (frequencyType === 'MONTHLY') return range;
    if (frequencyType === 'QUARTERLY') return `Q${cycleNo} (${range})`;
    if (frequencyType === 'HALF_YEARLY') return `H${cycleNo} (${range})`;
    if (frequencyType === 'YEARLY') return `Year (${range})`;
    return `Cycle ${cycleNo} (${range})`;
  }

  private halfDayValidator(control: AbstractControl): ValidationErrors | null {
    const v = Number(control.value);
    if (control.value === null || control.value === '' || !Number.isFinite(v)) return null;
    if (v < 0) return { halfDay: 'Value cannot be negative.' };
    const rounded = Math.round(v * 2) / 2;
    if (rounded !== v) return { halfDay: 'Value must be in increments of 0.5 (e.g. 0, 0.5, 1, 1.5...)' };
    return null;
  }

  private cellRangeValidator(allowedDays: number) {
    return (control: AbstractControl): ValidationErrors | null => {
      const v = Number(control.value);
      if (control.value === null || control.value === '' || !Number.isFinite(v)) return null;
      if (v < 0) return { cellRange: 'Value cannot be negative.' };
      if (v > allowedDays) return { cellRange: `Value cannot exceed ${allowedDays}.` };
      return null;
    };
  }

  private proRataMaxDaysValidator(control: AbstractControl): ValidationErrors | null {
    const v = Number(control.value);
    if (control.value === null || control.value === '' || !Number.isFinite(v)) return null;
    if (v > 366) return { proRataMaxDays: 'Pro-rata value cannot exceed 366 days.' };
    return null;
  }

  private proRataMaxValidator(colKey: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value === null || control.value === '') return null;
      const v = Number(control.value);
      const cycleEntitlement = Number((control.parent as FormGroup)?.get(colKey)?.value);
      if (Number.isFinite(v) && Number.isFinite(cycleEntitlement) && v > cycleEntitlement) {
        return { proRataExceeded: `Pro-rata value must not exceed the entitlement of ${cycleEntitlement} days.` };
      }
      return null;
    };
  }

  getProRataControl(catIndex: number, cycleIndex: number, colIdx: number): FormControl {
    return this.getCycleRow(catIndex, cycleIndex).get(`proRata_col_${colIdx}`) as FormControl;
  }

  getProRataError(catIndex: number, cycleIndex: number, colIdx: number): string | null {
    const ctrl = this.getProRataControl(catIndex, cycleIndex, colIdx);
    if (ctrl?.errors?.['proRataExceeded']) return ctrl.errors['proRataExceeded'];
    if (ctrl?.errors?.['halfDay']) return ctrl.errors['halfDay'];
    return null;
  }

  private columnSumValidator(colKey: string, allowedDays: number) {
    return (cyclesArray: AbstractControl): ValidationErrors | null => {
      const fa = cyclesArray as FormArray;
      const values = fa.controls.map(row => {
        const v = Number((row as FormGroup).get(colKey)?.value);
        return Number.isFinite(v) && v > 0 ? v : 0;
      });
      const total = values.reduce((a, b) => a + b, 0);
      if (total > allowedDays) {
        fa.controls.forEach((row, i) => {
          const ctrl = (row as FormGroup).get(colKey) as FormControl;
          if (!ctrl) return;
          const otherSum = values.reduce((a, b, idx) => idx !== i ? a + b : a, 0);
          const remaining = allowedDays - otherSum;
          if (values[i] > remaining) {
            ctrl.setErrors({ exceeded: `Total cannot exceed ${allowedDays}. Remaining: ${Math.floor(Math.max(remaining, 0) * 2) / 2}.` });
          } else {
            if (!ctrl.errors?.['halfDay']) ctrl.setErrors(null);
          }
        });
        return { columnExceeded: true };
      }
      fa.controls.forEach(row => {
        const ctrl = (row as FormGroup).get(colKey) as FormControl;
        if (ctrl?.errors?.['exceeded']) {
          const { exceeded, ...rest } = ctrl.errors;
          ctrl.setErrors(Object.keys(rest).length ? rest : null);
        }
      });
      if (total < allowedDays) return { columnShort: `Total must equal ${allowedDays}. Current: ${total}.` };
      return null;
    };
  }

  private buildBreakdownForm(orderedTables: any[]): void {
    const categoriesArray = this.fb.array(
      orderedTables.map(table => {
        const colKeys = (table.columns as any[]).map((_: any, i: number) => `col_${i}`);
        const validators = colKeys.map((key: string, i: number) => this.columnSumValidator(key, table.columns[i].allowedDays));
        const cyclesArray = this.fb.array(
          (table.cycles as any[]).map((cycle, cycleIdx) => {
            const controls: Record<string, FormControl> = {};
            colKeys.forEach((key: string, i: number) => {
              controls[key] = this.fb.control(cycle.entitlements?.[i] ?? null, [this.cellRangeValidator(table.columns[i].allowedDays), this.halfDayValidator.bind(this)]);
            });
            // Pro-rata controls — one per column
            if (table.isProRata) {
              colKeys.forEach((key: string, i: number) => {
                const proKey = `proRata_${key}`;
                const cycleEntitlement = cycle.entitlements?.[i] ?? null;
                const proRataVal = cycle.isProRataCycle ? cycle.proRataValue : cycleEntitlement;
                const ctrl = this.fb.control(
                  { value: proRataVal, disabled: !cycle.isProRataCycle },
                  [Validators.min(0), this.halfDayValidator.bind(this), this.proRataMaxValidator(key), this.proRataMaxDaysValidator.bind(this)]
                );
                controls[proKey] = ctrl;
              });
            }
            return this.fb.group(controls);
          }),
          validators
        );
        return this.fb.group({ categoryId: [table.categoryId], cycles: cyclesArray });
      })
    );
    this.breakdownForm = this.fb.group({ categories: categoriesArray });

    // Mirror entitlement value changes into pro-rata controls
    orderedTables.forEach((table, catIdx) => {
      if (!table.isProRata) return;
      const cyclesArray = this.getCyclesArray(catIdx);
      table.cycles.forEach((_: any, cycleIdx: number) => {
        const rowGroup = cyclesArray.at(cycleIdx) as FormGroup;
        table.columns.forEach((_col: any, colIdx: number) => {
          rowGroup.get(`col_${colIdx}`)?.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
            rowGroup.get(`proRata_col_${colIdx}`)?.setValue(val, { emitEvent: false });
          });
        });
      });
    });
  }

  get categoriesArray(): FormArray { return this.breakdownForm.get('categories') as FormArray; }

  // Step 8: per-entry helpers used by the new HTML
  getEntryCyclesArray(entry: any): FormArray {
    return entry.formGroup.get('cycles') as FormArray;
  }

  getEntryCellError(entry: any, cycleIdx: number, colKey: string): string | null {
    const ctrl = (this.getEntryCyclesArray(entry).at(cycleIdx) as FormGroup).get(colKey) as FormControl;
    if (ctrl?.errors?.['cellRange']) return ctrl.errors['cellRange'];
    if (ctrl?.errors?.['halfDay']) return ctrl.errors['halfDay'];
    return null;
  }

  getEntryProRataError(entry: any, cycleIdx: number, colIdx: number): string | null {
    const ctrl = (this.getEntryCyclesArray(entry).at(cycleIdx) as FormGroup).get(`proRata_col_${colIdx}`) as FormControl;
    if (ctrl?.errors?.['proRataMaxDays']) return ctrl.errors['proRataMaxDays'];
    if (ctrl?.errors?.['proRataExceeded']) return ctrl.errors['proRataExceeded'];
    if (ctrl?.errors?.['halfDay']) return ctrl.errors['halfDay'];
    return null;
  }

  getEntryColumnTotal(entry: any, colIdx: number): number {
    return this.getEntryCyclesArray(entry).controls.reduce((sum, row) => {
      const v = Number((row as FormGroup).get(`col_${colIdx}`)?.value);
      return sum + (Number.isFinite(v) && v > 0 ? v : 0);
    }, 0);
  }

  isEntryColumnValid(entry: any, colIdx: number): boolean {
    if (!entry.tableData) return true;
    return this.getEntryColumnTotal(entry, colIdx) === entry.tableData.columns[colIdx].allowedDays;
  }
  getCyclesArray(catIndex: number): FormArray { return this.categoriesArray.at(catIndex).get('cycles') as FormArray; }
  getCycleRow(catIndex: number, cycleIndex: number): FormGroup { return this.getCyclesArray(catIndex).at(cycleIndex) as FormGroup; }
  getCellControl(catIndex: number, cycleIndex: number, colKey: string): FormControl { return this.getCycleRow(catIndex, cycleIndex).get(colKey) as FormControl; }

  getCellError(catIndex: number, cycleIndex: number, colKey: string): string | null {
    const ctrl = this.getCellControl(catIndex, cycleIndex, colKey);
    if (ctrl?.errors?.['halfDay']) return ctrl.errors['halfDay'];
    if (ctrl?.errors?.['exceeded']) return ctrl.errors['exceeded'];
    return null;
  }

  getColumnTotal(catIndex: number, colIdx: number): number {
    const cyclesArray = this.getCyclesArray(catIndex);
    return cyclesArray.controls.reduce((sum, row) => {
      const v = Number((row as FormGroup).get(`col_${colIdx}`)?.value);
      return sum + (Number.isFinite(v) && v > 0 ? v : 0);
    }, 0);
  }

  isColumnValid(catIndex: number, colIdx: number): boolean {
    const table = this.categoryTablesOrdered[catIndex];
    if (!table) return true;
    return this.getColumnTotal(catIndex, colIdx) === table.columns[colIdx].allowedDays;
  }

  get isLoadButtonEnabled(): boolean {
    void this.formChangeCounter;
    if (!this.selectedEmployeeDetails || this.frequencyCards.length === 0) return false;

    const activeEntries = this.frequencyCards.flatMap(card =>
      card.categories.filter(e => !e.deleted && !e.isExcluded)
    );
    if (activeEntries.length === 0) return false;

    for (const card of this.frequencyCards) {
      for (const entry of card.categories) {
        if (entry.deleted || entry.isExcluded) continue;
        if (!entry.tableData) return false;
        const cyclesArray = this.getEntryCyclesArray(entry);
        for (let colIdx = 0; colIdx < entry.tableData.columns.length; colIdx++) {
          const hasEmptyCell = cyclesArray.controls.some(row => {
            const val = (row as any).get(`col_${colIdx}`)?.value;
            return val === null || val === undefined || val === '';
          });
          if (hasEmptyCell || !this.isEntryColumnValid(entry, colIdx)) return false;
          if (entry.tableData.isProRata) {
            const hasProRataError = cyclesArray.controls.some((row, cycleIdx) => {
              const cycle = entry.tableData.cycles[cycleIdx];
              if (!cycle?.isProRataCycle) return false;
              return !!this.getEntryProRataError(entry, cycleIdx, colIdx);
            });
            if (hasProRataError) return false;
          }
        }
      }
    }
    return true;
  }



  resetCategory(catIdx: number): void {
    const table = this.categoryTablesOrdered[catIdx];
    if (!table) return;
    const originalCat = this.originalBreakdownData.find((c: any) => Number(c?.category_id) === table.categoryId);
    if (!originalCat) return;
    const groups = Array.isArray(originalCat?.groups) ? originalCat.groups : [];
    const cycleEntitlementsByNo = new Map<number, number[]>();
    groups.forEach((group: any, colIdx: number) => {
      const cycles = Array.isArray(group?.cycles) ? group.cycles : [];
      for (const c of cycles) {
        const cycleNo = c?.cycle_no;
        if (!cycleNo) continue;
        if (!cycleEntitlementsByNo.has(cycleNo)) cycleEntitlementsByNo.set(cycleNo, new Array(table.columns.length).fill(null));
        cycleEntitlementsByNo.get(cycleNo)![colIdx] = typeof c?.entitlement === 'number' ? c.entitlement : null;
      }
    });
    const cyclesArray = this.getCyclesArray(catIdx);
    table.cycles.forEach((cycle: any, cycleIdx: number) => {
      const entitlements = cycleEntitlementsByNo.get(cycle.cycleNo) ?? new Array(table.columns.length).fill(null);
      const rowGroup = cyclesArray.at(cycleIdx) as FormGroup;
      table.columns.forEach((_: any, colIdx: number) => {
        rowGroup.get(`col_${colIdx}`)?.setValue(entitlements[colIdx], { emitEvent: false });
        cycle.entitlements[colIdx] = entitlements[colIdx];
      });
    });
    cyclesArray.updateValueAndValidity();
  }

  // Step 5a: build tableData for a single category (reuses existing cycle-building logic)
  private buildSingleCategoryTable(category: any, frequencyType: string): any {
    const categoryId = category?.category_id;
    const groups = Array.isArray(category?.groups) ? category.groups : [];
    const cycleMetaByNo = new Map<number, any>();
    const cycleEntitlementsByNo = new Map<number, number[]>();

    const employeePolicyId = this.employeePolicyMap.get(categoryId);
    let matchedGroupIdx = groups.findIndex((g: any) =>
      Array.isArray(g?.grades) && g.grades.some((gr: any) => gr?.policy_id === employeePolicyId)
    );
    if (matchedGroupIdx === -1) matchedGroupIdx = 0;
    const matchedGroup = groups[matchedGroupIdx];
    const matchedGrade = Array.isArray(matchedGroup?.grades)
      ? (matchedGroup.grades.find((gr: any) => gr?.policy_id === employeePolicyId) ?? matchedGroup.grades[0])
      : null;
    const columns = [{
      columnId: 0,
      gradeLabel: matchedGrade?.grade_name ?? '-',
      allowedDays: matchedGrade?.allowed_days ?? (typeof matchedGroup?.allowed_days === 'number' ? matchedGroup.allowed_days : 0),
      matchedPolicyId: matchedGrade?.policy_id ?? null
    }];

    const cycleProRataByNo = new Map<number, number | null>();
    groups.forEach((group: any, colIdx: number) => {
      const cycles = Array.isArray(group?.cycles) ? group.cycles : [];
      for (const c of cycles) {
        const cycleNo = c?.cycle_no;
        if (!cycleNo) continue;
        const start = c?.cycle_start ? new Date(c.cycle_start) : null;
        const end = c?.cycle_end ? new Date(c.cycle_end) : null;
        if (!cycleMetaByNo.has(cycleNo))
          cycleMetaByNo.set(cycleNo, { cycleNo, start, end, label: this.formatCycleLabel(frequencyType, cycleNo, start, end) });
        if (!cycleEntitlementsByNo.has(cycleNo)) cycleEntitlementsByNo.set(cycleNo, new Array(columns.length).fill(null));
        cycleEntitlementsByNo.get(cycleNo)![colIdx] = typeof c?.entitlement === 'number' ? c.entitlement : null;
        if (colIdx === 0 && typeof c?.pro_rata_entitlement === 'number')
          cycleProRataByNo.set(cycleNo, c.pro_rata_entitlement);
      }
    });

    const cycleRows = Array.from(cycleMetaByNo.values()).sort((a, b) => a.cycleNo - b.cycleNo).map(cycle => {
      const proRataValue = cycleProRataByNo.get(cycle.cycleNo) ?? null;
      const isProRataCycle = proRataValue !== null;
      return {
        ...cycle,
        entitlements: cycleEntitlementsByNo.get(cycle.cycleNo) ?? new Array(columns.length).fill(null),
        isProRataCycle,
        proRataValue
      };
    });

    const isProRata = this.categoryProRataMap.get(categoryId) === true;
    return { categoryId, categoryName: category?.category_name ?? '-', frequencyType, columns, cycles: cycleRows, isProRata };
  }

  formChangeCounter = 0; // triggers change detection when form values change

  // Step 5b: build reactive FormGroup for a single category table
  private buildSingleCategoryForm(table: any): FormGroup {
    const colKeys = (table.columns as any[]).map((_: any, i: number) => `col_${i}`);
    const validators = colKeys.map((key: string, i: number) => this.columnSumValidator(key, table.columns[i].allowedDays));
    const cyclesArray = this.fb.array(
      (table.cycles as any[]).map((cycle) => {
        const controls: Record<string, FormControl> = {};
        colKeys.forEach((key: string, i: number) => {
          controls[key] = this.fb.control(cycle.entitlements?.[i] ?? null, [this.cellRangeValidator(table.columns[i].allowedDays), this.halfDayValidator.bind(this)]);
        });
        if (table.isProRata) {
          colKeys.forEach((key: string, i: number) => {
            const proKey = `proRata_${key}`;
            const cycleEntitlement = cycle.entitlements?.[i] ?? null;
            const proRataVal = cycle.isProRataCycle ? cycle.proRataValue : cycleEntitlement;
            controls[proKey] = this.fb.control(
              { value: proRataVal, disabled: !cycle.isProRataCycle },
              [Validators.min(0), this.halfDayValidator.bind(this), this.proRataMaxValidator(key), this.proRataMaxDaysValidator.bind(this)]
            );
          });
        }
        return this.fb.group(controls);
      }),
      validators
    );
    const fg = this.fb.group({ categoryId: [table.categoryId], cycles: cyclesArray });
    fg.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.formChangeCounter++;
    });
    return fg;
  }

  openAddConfirmPopup(): void {
    this.modalService.open(this.addConfirmTpl, { centered: true, backdrop: 'static', size: 'md' });
  }

  executeAddConfirm(): void {
    this.modalService.dismissAll();
    this.onAddNewConfirm();
  }

  openCancelConfirmPopup(): void {
    this.modalService.open(this.cancelConfirmTpl, { centered: true, backdrop: 'static', size: 'md' });
  }

  executeCancel(): void {
    this.modalService.dismissAll();
    this.showAddForm = false;
    this.addForm = { frequency: '', categories: [], cycleHandling: '' };
    this.addFormTouched = { frequency: false, categories: false, cycleHandling: false };
  }

  confirmDeleteCategory(cardIdx: number, catIdx: number): void {
    this.pendingDeleteCardIdx = cardIdx;
    this.pendingDeleteCatIdx = catIdx;
    this.modalService.open(this.deleteConfirmTpl, { centered: true, backdrop: 'static', size: 'md' });
  }

  executeDeleteCategory(): void {
    this.softDeleteCategory(this.pendingDeleteCardIdx, this.pendingDeleteCatIdx);
    this.modalService.dismissAll();
    this.pendingDeleteCardIdx = -1;
    this.pendingDeleteCatIdx = -1;
  }

  // Step 5c: soft-delete a category; remove card if all categories deleted
  softDeleteCategory(cardIdx: number, catIdx: number): void {
    const card = this.frequencyCards[cardIdx];
    if (!card) return;
    card.categories[catIdx].deleted = true;
    const allDeleted = card.categories.every(c => c.deleted);
    if (allDeleted) {
      this.frequencyCards.splice(cardIdx, 1);
    } else if (card.selectedCategoryIdx === catIdx || card.categories[card.selectedCategoryIdx]?.deleted) {
      const nextIdx = card.categories.findIndex((c: any) => !c.deleted);
      card.selectedCategoryIdx = nextIdx >= 0 ? nextIdx : 0;
    }
    this.refreshAvailableCategoryOptions();
  }

  isCyclePastOrCurrent(cycle: any): boolean {
    return new Date(cycle.cycleStart) <= new Date() && cycle.status === 'PENDING';
  }

  retryCycle(jobId: any, cycle: any) {
    this.http.postbyId(`LeaveEntitlementJobs/${jobId}/retry`).subscribe({
      next: () => {
        this.modalService.dismissAll();
        this.conformationPopup.openSuccessModal('Leave Entitlement added successfully.');
        this.validateBeforeLoad(
          this.selectedEmployeeDetails.employeeId,
          this.collectedCategoryIds,
          this.collectedLocationId,
          this.collectedSubLocationId,
          this.collectedShiftId
        );
      },
      error: (err) => {
        console.error(err);
        this.conformationPopup.openErrorModal(err?.error?.message || 'Retry failed');
      }
    });
  }

  resetEntry(entry: any): void {
    if (!entry.tableData || !entry.originalData) return;
    const groups = Array.isArray(entry.originalData?.groups) ? entry.originalData.groups : [];
    const cycleEntitlementsByNo = new Map<number, number[]>();
    groups.forEach((group: any, colIdx: number) => {
      const cycles = Array.isArray(group?.cycles) ? group.cycles : [];
      for (const c of cycles) {
        const cycleNo = c?.cycle_no;
        if (!cycleNo) continue;
        if (!cycleEntitlementsByNo.has(cycleNo))
          cycleEntitlementsByNo.set(cycleNo, new Array(entry.tableData.columns.length).fill(null));
        cycleEntitlementsByNo.get(cycleNo)![colIdx] = typeof c?.entitlement === 'number' ? c.entitlement : null;
      }
    });
    const cyclesArray = this.getEntryCyclesArray(entry);
    entry.tableData.cycles.forEach((cycle: any, cycleIdx: number) => {
      const entitlements = cycleEntitlementsByNo.get(cycle.cycleNo) ?? new Array(entry.tableData.columns.length).fill(null);
      const rowGroup = cyclesArray.at(cycleIdx) as FormGroup;
      entry.tableData.columns.forEach((_: any, colIdx: number) => {
        rowGroup.get(`col_${colIdx}`)?.setValue(entitlements[colIdx], { emitEvent: false });
        cycle.entitlements[colIdx] = entitlements[colIdx];
        // Reset proRata control from original backend value
        if (entry.tableData.isProRata && cycle.isProRataCycle) {
          const originalGroups = Array.isArray(entry.originalData?.groups) ? entry.originalData.groups : [];
          const originalCycle = originalGroups[0]?.cycles?.find((c: any) => c.cycle_no === cycle.cycleNo);
          const originalProRata = typeof originalCycle?.pro_rata_entitlement === 'number' ? originalCycle.pro_rata_entitlement : entitlements[colIdx];
          rowGroup.get(`proRata_col_${colIdx}`)?.setValue(originalProRata, { emitEvent: false });
        }
      });
    });
    cyclesArray.updateValueAndValidity();
    entry.isModified = false;
  }

  resetAllEntries(card: any): void {
    card.categories.filter((e: any) => !e.deleted).forEach((entry: any) => this.resetEntry(entry));
  }

  getSelectedCardEntry(card: any): any | null {
    if (!card?.categories?.length) return null;
    const currentEntry = card.categories[card.selectedCategoryIdx];
    if (currentEntry && !currentEntry.deleted) return currentEntry;
    const nextIdx = card.categories.findIndex((entry: any) => !entry.deleted);
    if (nextIdx === -1) return null;
    card.selectedCategoryIdx = nextIdx;
    return card.categories[nextIdx];
  }

  get combinedBreakdownCard(): any | null {
    return this.frequencyCards[0] ?? null;
  }

  resetAll(): void {
    this.categoryTablesOrdered.forEach((_, idx) => this.resetCategory(idx));
  }

  get isDojCurrentYear(): boolean {
    if (!this.selectedEmployeeDetails?.dateOfJoining) return false;
    return new Date(this.selectedEmployeeDetails.dateOfJoining).getFullYear() === new Date().getFullYear();
  }

  formatLabel(value: string): string {
    return value
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  openCyclesModal(entry: any): void {
    this.viewCyclesEntry = entry;
    this.modalService.open(this.cyclesModalTpl, { centered: true, size: 'xl', backdrop: 'static' });
  }

  closeCyclesModal(): void {
    this.modalService.dismissAll();
    this.viewCyclesEntry = null;
  }

  formatEntitledDate(dateStr: string): string {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  // Option A: returns existing card's cycleHandling for a frequency, or null
  getExistingCardCycleHandling(frequencyType: string): string | null {
    const card = this.frequencyCards.find(c => c.frequencyType === frequencyType);
    return card ? card.cycleHandling : null;
  }

  refreshAvailableCategoryOptions(): void {
    const globalActiveIds = new Set(
      this.frequencyCards.flatMap(card => card.categories.filter(c => !c.deleted).map(c => c.categoryId))
    );
    // console.log('[refresh] called from:', new Error().stack?.split('\n')[2]?.trim());
    // console.log('[refresh] frequencyCards snapshot:', this.frequencyCards.map(c => ({ freq: c.frequencyType, cats: c.categories.filter(x => !x.deleted).map(x => x.categoryId) })));
    // console.log('[refresh] globalActiveIds:', [...globalActiveIds]);
    // console.log('[refresh] allCategoryOptions:', this.allCategoryOptions.map(o => o.value));
    this.availableCategoryOptions = [...this.allCategoryOptions.filter(opt => !globalActiveIds.has(opt.value))];
    // console.log('[refresh] availableCategoryOptions AFTER filter:', this.availableCategoryOptions.map(o => o.value));
    this.addForm.categories = this.addForm.categories.filter(id => !globalActiveIds.has(id));
    // console.log('[refresh] addForm.categories AFTER clean:', this.addForm.categories);
  }

  // Step 4: called when admin clicks Confirm on the Add New form
  onAddNewConfirm(): void {
    const { frequency, categories, cycleHandling } = this.addForm;
    if (!frequency || !categories.length || !cycleHandling) return;
    const activeEmployeeId = this.selectedEmployeeDetails?.employeeId;
    if (!activeEmployeeId) return;
    const requestVersion = this.employeeSelectionRequestVersion;

    // Card is keyed by frequency + cycleHandling combination
    let card = this.frequencyCards.find(c => c.frequencyType === frequency && c.cycleHandling === cycleHandling);
    if (!card) {
      card = { frequencyType: frequency, cycleHandling, selectedCategoryIdx: 0, categories: [] };
      this.frequencyCards.push(card);
    }

    this.showAddForm = false;
    this.addForm = { frequency: '', categories: [], cycleHandling: '' };
    this.addFormTouched = { frequency: false, categories: false, cycleHandling: false };

    const entryMap = new Map<number, any>();
    for (const categoryId of categories) {
      const categoryName = this.allCategoryOptions.find(o => o.value === categoryId)?.label ?? `Category ${categoryId}`;
      const entry: any = {
        categoryId,
        categoryName,
        deleted: false,
        tableData: null,
        originalData: null,
        formGroup: this.fb.group({ cycles: this.fb.array([]) }),
        breakdownLoader: true,
        isModified: false,
        isExcluded: false,
        exclusionReason: '',
      };
      card!.categories.push(entry);
      entryMap.set(categoryId, entry);
    }

    const payload = {
      category_ids: categories,
      frequency_type: frequency,
      location_id: this.collectedLocationId,
      sub_location_id: this.collectedSubLocationId,
      shift_id: this.collectedShiftId,
      year: new Date().getFullYear(),
      employeeId: activeEmployeeId,
    };

    this.http.postdata('OrgLeavesCategories/leave-entitlement-breakdown', payload).subscribe({
      next: (response: any) => {
        if (!this.isActiveEmployeeSelection(activeEmployeeId, requestVersion)) return;
        const cats = Array.isArray(response?.categories) ? response.categories : [];
        for (const catData of cats) {
          const entry = entryMap.get(catData.category_id);
          if (!entry) continue;
          if (catData.is_applicable === false) {
            entry.isExcluded = true;
            entry.exclusionReason = catData.exclusion_reason ?? 'Not applicable';
            entry.tableData = null;
            entry.breakdownLoader = false;
          } else {
            entry.tableData = this.buildSingleCategoryTable(catData, frequency);
            entry.originalData = JSON.parse(JSON.stringify(catData));
            entry.formGroup = this.buildSingleCategoryForm(entry.tableData);
            entry.isModified = false;
            entry.formGroup.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
              entry.isModified = true;
              this.formChangeCounter++;
            });
            entry.breakdownLoader = false;
          }
        }
        // Mark any unmatched entries as done loading
        entryMap.forEach(entry => { entry.breakdownLoader = false; });
      },
      error: () => {
        if (!this.isActiveEmployeeSelection(activeEmployeeId, requestVersion)) return;
        entryMap.forEach(entry => { entry.breakdownLoader = false; });
      }
    });

    this.refreshAvailableCategoryOptions();
  }

  private resetPage(): void {
    this.resetEmployeeDataState();
  }

  blockInvalidEntitlementKeys(event: KeyboardEvent): void {
    const blocked = ['-', '+', 'e', 'E', 'ArrowDown'];
    if (blocked.includes(event.key)) event.preventDefault();
  }

  clampEntitlementInput(event: Event, entry: any, cycleIdx: number, colIdx: number, allowedDays: number): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    // Don't clamp mid-typing decimals like "0." or "1."
    if (raw.endsWith('.')) return;
    let v = parseFloat(raw);
    if (isNaN(v) || v < 0) v = 0;
    if (v > allowedDays) v = allowedDays;
    const rounded = Math.round(v * 2) / 2;
    if (rounded !== parseFloat(raw)) {
      input.value = String(rounded);
      const ctrl = (this.getEntryCyclesArray(entry).at(cycleIdx) as FormGroup).get(`col_${colIdx}`);
      ctrl?.setValue(rounded, { emitEvent: true });
    }
  }

  isAnyCategoryModified(card: any): boolean {
  if (!card?.categories) return false;

  for (let c of card.categories) {
    if (!c.deleted && c.isModified) return true;
  }
  return false;
}

  private formatDateToISO(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}T00:00:00.000Z`;
  }

  close() {
    window.location.reload();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
