import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NoDataFoundComponent } from "../../../shared/no-data-found/no-data-found.component";
@Component({
  selector: 'app-load-entitlements',
  imports: [CommonModule, FormsModule, NoDataFoundComponent],
  templateUrl: './load-entitlements.component.html',
  styleUrl: './load-entitlements.component.scss',
})

export class LoadEntitlementsComponent {
  @ViewChild('dropdownMenu') dropdownMenu!: ElementRef;
  selectedEmployeeDetails: any;
  fusionEmployeeId: any;
  isDisabled!: boolean;
  subscription!: Subscription;
  empdata = {} as any;
  jobDetails: any;
  employeeiddetails: any[] = [];
  isDropdownOpen: boolean = false;
  currentDate: Date = new Date();
  loggedinuser = {} as any;
  loading: boolean = false;
  constructor(
    private http: HttpService,
    private renderer: Renderer2,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loggedinuser = this.authService.getToken();
    this.empdata = JSON.parse(localStorage.getItem('fusionuser') || '{}');
    this.getEmployeeId();
    this.getJobdetails();
  }

  getEmployeeId() {
    this.subscription = this.http.getData('Employeedata/ActiveEmployees').subscribe({
      next: (data: any) => {
        this.employeeiddetails = data; // Populate employeeiddetails array with data
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

  toggleDropdown(dropcategory: string) {
    if (dropcategory === 'empid') {
      const menu = this.dropdownMenu.nativeElement;
      if (menu.style.display === 'none' || !menu.style.display) {
        // Check if the menu is hidden or not set
        this.populateDropdown(); // Populate dropdown menu when opened
        menu.style.display = 'block';
      } else {
        menu.style.display = 'none';
      }
    }
  }

  populateDropdown() {
    // Clear existing content
    this.clearDropdown();
    // Check if employeeiddetails is defined and not empty
    if (this.employeeiddetails && this.employeeiddetails.length > 0) {
      // Populate dropdown with filtered Fusion Employee IDs
      const dropdownElement = this.dropdownMenu.nativeElement;
      const searchTextLower = (this.fusionEmployeeId || '').toLowerCase();
      const searchTextParts = searchTextLower.split(' ');
      const filteredEmployees = this.employeeiddetails.filter((employee) => {
        // Build the searchable text by conditionally including middleName
        const fullNameForSearch = employee.middleName
          ? `${employee.fusionEmpId} ${employee.firstName} ${employee.middleName} ${employee.lastName}`
          : `${employee.fusionEmpId} ${employee.firstName} ${employee.lastName}`;
        const employeeText = fullNameForSearch.toLowerCase();
        return searchTextParts.every((part: string) =>
          employeeText.includes(part)
        );
      });

      filteredEmployees.forEach((employee) => {
        // Build the display text with proper spacing
        const fullName = employee.middleName
          ? `${employee.firstName} ${employee.middleName} ${employee.lastName}`
          : `${employee.firstName} ${employee.lastName}`;
        const displayText = `${employee.fusionEmpId} - ${fullName}`;
        const option = this.renderer.createElement('a');
        option.textContent = displayText;
        option.className = 'dropdown-item';
        this.renderer.listen(option, 'click', () =>
          this.onOptionClick(employee.fusionEmpId)
        );
        this.renderer.appendChild(dropdownElement, option);
      });
    }
  }

  clearDropdown() {
    // Clear existing content from dropdown
    const dropdownElement = this.dropdownMenu.nativeElement;
    dropdownElement.innerHTML = '';
  }

  onSearchChange(searchText: string) {
    // Update dropdown menu when search input changes
    this.fusionEmployeeId = searchText; // Update model with search text
    if (searchText.trim() === '') {
      this.clearDropdown();
      this.renderer.setStyle(this.dropdownMenu.nativeElement,'display','none');
    } else {
      this.populateDropdown();
      this.renderer.setStyle(this.dropdownMenu.nativeElement,'display','block');
    }
  }

  onOptionClick(fusionEmpId: string) {
    try {
      this.fetchEmployeeDetails(fusionEmpId);
      this.fusionEmployeeId = fusionEmpId;
      // Close the dropdown menu
      this.dropdownMenu.nativeElement.style.display = 'none';
      // Find corresponding details in Employeedata/ActiveEmployees
      this.selectedEmployeeDetails = this.employeeiddetails.find(
        (detail) => detail.fusionEmpId === fusionEmpId
      );
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
      if (modalElement) {
        modalElement.classList.add('show');
        modalElement.style.display = 'block';
        this.StatusMsg = 'Job details are missing for the selected employee';
      }
    }
  }

  findEmployeeId(fusionEmpId: string): string | undefined {
    // employee data stored in this.employeeiddetails
    const employee = this.employeeiddetails.find(
      (emp) => emp.fusionEmpId === fusionEmpId
    );
    return employee ? employee.employeeId : undefined;
  }

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

  onClearSearch() {
    this.fusionEmployeeId = '';
    location.reload();
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
  sendEntitlementRequest() {
    // Iterate through each record in tableData and construct the request body for each record
    this.tableData.forEach((record) => {
      const requestBody = {
        employeeId: this.selectedEmployeeDetails.employeeId,
        year: record.year,
        addedBy: this.loggedinuser.employeeId,
        leaveEntitlements: [
          {
            employeeId: this.selectedEmployeeDetails.employeeId,
            year: record.year,
            addedBy: this.loggedinuser.employeeId,
            leaveCategoryId: record.categoryId,
            entitlementDays: record.entitledLeaves,
          },
        ],
      };
      this.http.postdata('LeaveEntitlements/load', requestBody).subscribe((response: any) => {
        const modalElement = document.getElementById('successhide');
        if (modalElement) {
          modalElement.classList.add('show');
          modalElement.style.display = 'block';
          this.StatusMsg = 'Leaves Entitled Successfully';
        }
        setTimeout(function () {
          location.reload();
        }, 2000);
      });
    });
  }

  fetchEmployeeDetails(fusionEmpId: string) {
    // Step 1: Find the employeeId for the given fusionEmpId
    const employeeId = this.findEmployeeId(fusionEmpId);
    // Step 2: Check if employeeId is available
    if (employeeId) {
      // Step 3: Call the API endpoint with the employeeId
      this.sendAPIRequest(employeeId);
    } else {
      // Step 4: Handle scenarios where the employeeId is not provided
      console.log('Step 4: EmployeeId not provided.');
    }
  }

  sendAPIRequest(employeeId: string) {
    // Clear the tableData array
    this.tableData = [];
    // Step 5: Sending API request to get leave policy details
    // Step 6: Find employee details from jobDetails
    const employeeDetails = this.jobDetails.find(
      (detail: any) => detail.employeeId === employeeId
    );
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
      .subscribe((response: any) => {
        // Step 8: Process the API response
        if (Array.isArray(response)) {
          // If it's an array, process each item
          response.forEach((item) => {
            this.processSingleResponse(item);
          });
        } else if (typeof response === 'object') {
          // If it's an object, process it
          this.processSingleResponse(response);
        } else {
          // Handle unexpected response format
          console.log('Step 8: Unexpected API response format.');
        }
      });
    // Step 9: Call the API endpoint to fetch entitlements
    this.fetchEntitlements(employeeId);
  }

  fetchEntitlements(employeeId: string) {
    // Step 9: Sending API request to fetch entitlements
    this.http
      .getData(`LoadEntitlementValidator/getLoadEntitlements/${employeeId}`)
      .subscribe(
        (response: any) => {
          // Ensure response is an array
          if (Array.isArray(response) && response.length > 0) {
            // Get the current year
            const currentYear = new Date().getFullYear();
            // Check if any record for the current year exists
            const hasCurrentYearRecord = response.some(
              (record) => record.year === currentYear
            );
            if (hasCurrentYearRecord) {
              // Display popup only when a record for the current year is found
              const modalElement = document.getElementById('entitled');
              if (modalElement) {
                modalElement.classList.add('show');
                modalElement.style.display = 'block';
                this.StatusMsg = 'Leaves already entitled';
              }
            } else {
              console.log('No entitlements data found for the current year:', currentYear);
              // Do nothing or handle as per requirement
            }
          } else {
            console.log('No entitlements data found.');
            // Handle case where response is empty or not an array
          }
        },
        (error) => {
          console.log('Error fetching entitlements:', error);
          // Handle error case
        }
      );
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

  close() {
    window.location.reload();
  }
}