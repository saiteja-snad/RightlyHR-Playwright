import { Component, model, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { TranslateModule } from '@ngx-translate/core';
import { MultiSelectModule } from 'primeng/multiselect';
import { environment } from '../../../environments/environment';
import { NgbModal, NgbModalRef, NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { OpenModalService } from '../../services/open-modal.service';
import { IReviewCycleEmployee } from './review-cycle-emp.model';

@Component({
  selector: 'app-apprisal-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectModule, TranslateModule, MultiSelectModule, NgbPagination],
  templateUrl: './apprisal-list.component.html',
  styleUrl: './apprisal-list.component.scss'
})
export class ApprisalListComponent implements OnInit, OnDestroy {
  dependentdropdowns!: FormGroup;
  reviewtemplatedropdowns!: FormGroup;
  updatereviewtemplatedropdowns!: FormGroup;
  Effectivedatefrom!: FormGroup;
  addEmployeeForm!: FormGroup;

  customLabelTemplate: string | undefined;
  listofReviewTemplates: any;
  reviewCyclesList: IReviewCycleEmployee[] = [];

  jobLocationDropDownData: any;
  subLocationsDropdown: any;
  departmentDetails: any;
  reviewCycleID: any;
  selectedReviewCycle: any;
  createdStatuses: string[] = [];
  subDepartmentIds: any;
  loctionIds: any;
  subLoctionIds: any;
  departmentIds: any;
  subDepartmentsDropdownValues: any;
  promoted: any;
  listOfAllEmployees: any[] = [];
  reportOfAllEmployees: any[] = [];
  dataload = false;
  filteredEmployees: any[] = [];
  searchText: any;
  seletedid: any;
  Status: any;
  empinfo = {} as any;
  selectedemployeereviewtemplate: any;
  employeesList: any;
  employeeStatuses: string[] = [];

  page = 1;
  pageSize = 10;
  collectionSize!: number;
  searchQuery = ''
  modalRef!: NgbModalRef;

  promotedOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  @ViewChild('loading') loading: any;
  @ViewChild('addEmployee') addEmployee: any;
  destroy$: Subject<boolean> = new Subject<boolean>();

  ngOnInit() {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') ?? '{}');
    this.intitalizeForm();
    this.initiateAddEmployeeForm();
    this.getAllReviewCyclesList();
    this.getAllReviewTemplates();
    this.initiatetemplatedropdownsForm();
    this.initialupdatereviewtemplatedropdownsForm();
    this.initiondateForm();
  }

  constructor(
    private http: HttpService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private modal: OpenModalService,
  ) { }

  intitalizeForm() {
    this.dependentdropdowns = this.fb.group({
      selectedReviewCycle: [null],
      departmentId: [{ value: [], disabled: true }],
      subDepartmentId: [{ value: [], disabled: true }],
      locationId: [{ value: [], disabled: true }],
      subLocationId: [{ value: [], disabled: true }],
      promoted: [null],
    });
  }

  getAllReviewCyclesList() {
    this.http.getData("reviewCycleHeader").pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.reviewCyclesList = data.items as IReviewCycleEmployee[];
        this.employeeStatuses = this.reviewCyclesList.map((employee: { status: any; }) => employee.status.trim().toLowerCase());
        this.createdStatuses = this.employeeStatuses.filter(status => status === 'created');
      }
    })
  }

  getAllReviewTemplates() {
    const params = {
      status: 'Active',
      moduleid: environment.PMSrequestmoduleId,
    };
    this.http.getDataIncludeParams('Form/getAllFormDetails', params).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.listofReviewTemplates = data;
        },
      });
  }

  // onReviewCycleChange(selectedValue: any): void {
  //   this.dependentdropdowns.get('promoted')?.reset();
  //   const selectedId = selectedValue.value;
  //   if (!selectedId) {
  //     console.error('No value selected.');
  //     return;
  //   }

  //   const selectedCycle = this.reviewCyclesList.find((item: any) => item.id == selectedId.id);
  //   this.reviewCycleID = selectedCycle?.id ?? null;
  //   this.selectedReviewCycle = selectedCycle
  //   if (!selectedCycle) {
  //     console.error('Selected review cycle not found.');
  //     return;
  //   }
  //   this.selectedReviewCycle = selectedCycle;

  //   if (selectedCycle.status.trim().toLowerCase() === 'created') {
  //     this.createdStatuses = ['created'];
  //   } else {
  //     this.createdStatuses = [];
  //   }

  //   console.log(this.createdStatuses); 

  //   this.jobLocationDropDownData = [];
  //   this.subLocationsDropdown = [];
  //   this.departmentDetails = [];
  //   this.subDepartmentsDropdownValues = [];
  //   // this.jobLocationDropDownData = selectedCycle.locations ?? [];
  //   // this.subLocationsDropdown = selectedCycle.sublocations ?? [];
  //   // this.departmentDetails = selectedCycle.departments ?? [];
  //   // this.subDepartmentsDropdownValues = selectedCycle.subdepartments ?? [];
  //   // const locationIds = Array.isArray(selectedCycle.locations) ? selectedCycle.locations.map((item: any) => item.locationId).join(',') : '';
  //   // const subLocationIds = Array.isArray(selectedCycle.sublocations) ? selectedCycle.sublocations.map((item: any) => item.subLocationId).join(',') : '';
  //   // const depIds = Array.isArray(selectedCycle.departments) ? selectedCycle.departments.map((item: any) => item.departmentId).join(',') : '';
  //   const depIds = selectedCycle.departments ?? [];
  //   this.departmentDetails = depIds;
  //   // const subDepIds = Array.isArray(selectedCycle.subdepartments) ? selectedCycle.subdepartments.map((item: any) => item.subDepartmentId).join(',') : '';
  //   const subDepIds = selectedCycle.subdepartments ?? [];
  //   this.subDepartmentsDropdownValues = subDepIds;

  //   const locationIds = selectedCycle.locations ?? [];
  //   this.jobLocationDropDownData = locationIds;

  //   const subLocationIds = selectedCycle.sublocations ?? [];
  //   this.subLocationsDropdown = subLocationIds;

  //   this.dependentdropdowns.patchValue({
  //     selectedReviewCycle: selectedId,
  //     departmentId: depIds,
  //     subDepartmentId: subDepIds,
  //     locationId: locationIds,
  //     subLocationId: subLocationIds,
  //   });

  //   this.loctionIds = locationIds
  //   this.subLoctionIds = subLocationIds
  //   this.departmentIds = depIds
  //   this.subDepartmentIds = subDepIds

  //   const params = {
  //     page: this.page,
  //     pageSize: this.pageSize,
  //     reviewcycleid: selectedCycle.id,
  //     promotion: this.promoted || '',

  //   };
  //   console.log(params)
  //   this.getEmployeesOfTheReviewCycle(params);
  // }

  onReviewCycleChange(selectedValue: any): void {
    // this.dependentdropdowns.get('promoted')?.reset();
  
    const selectedId = selectedValue.value;
    if (!selectedId) {
      console.error('No value selected.');
      return;
    }
  
    const selectedCycle = this.getSelectedCycle(selectedId);
    if (!selectedCycle) {
      console.error('Selected review cycle not found.');
      return;
    }
    this.selectedReviewCycle = selectedCycle;
    this.reviewCycleID = selectedCycle.id
  
    this.updateStatuses(selectedCycle.status);
    this.resetDropdownData();
  
    const { locations, sublocations, departments, subdepartments } = selectedCycle;
    this.updateDropdowns(locations, sublocations, departments, subdepartments);
  
    // Patching values into the form
    this.patchFormValues(selectedId, departments, subdepartments, locations, sublocations);
  
    // Set additional fields for further use
    this.setAdditionalFields(locations, sublocations, departments, subdepartments);
  
    const params = this.buildParams(selectedCycle.id);
    console.log(params);
    this.getEmployeesOfTheReviewCycle(params);
  }
  
  getSelectedCycle(selectedId: any) {
    return this.reviewCyclesList.find((item: any) => item.id == selectedId.id);
  }
  
  updateStatuses(status: string) {
    this.createdStatuses = status.trim().toLowerCase() === 'created' ? ['created'] : [];
    console.log(this.createdStatuses);
  }
  
  resetDropdownData() {
    this.jobLocationDropDownData = [];
    this.subLocationsDropdown = [];
    this.departmentDetails = [];
    this.subDepartmentsDropdownValues = [];
  }
  
  updateDropdowns(locations: any[], sublocations: any[], departments: any[], subdepartments: any[]) {
    this.jobLocationDropDownData = locations ?? [];
    this.subLocationsDropdown = sublocations ?? [];
    this.departmentDetails = departments ?? [];
    this.subDepartmentsDropdownValues = subdepartments ?? [];
  }
  
  patchFormValues(selectedId: any, departments: any[], subdepartments: any[], locations: any[], sublocations: any[]) {
    this.dependentdropdowns.patchValue({
      selectedReviewCycle: selectedId,
      departmentId: departments ?? [],
      subDepartmentId: subdepartments ?? [],
      locationId: locations ?? [],
      subLocationId: sublocations ?? [],
    });
  }
  
  setAdditionalFields(locations: any[], sublocations: any[], departments: any[], subdepartments: any[]) {
    this.loctionIds = locations.map(location => location.locationId).join(',');
    this.subLoctionIds = sublocations.map(subLocation => subLocation.subLocationId).join(',');
    this.departmentIds = departments.map(department => department.departmentId).join(',');
    this.subDepartmentIds = subdepartments.map(subDepartment => subDepartment.subDepartmentId).join(',');
  }
  
  buildParams(reviewCycleId: any) {
    console.log(reviewCycleId)
    return {
      page: this.page,
      pageSize: this.pageSize,
      reviewcycleid: reviewCycleId,
      promotion: this.promoted?.value || '',
    };
  }
  
  onPromotedChange(event: any): void {
    this.promoted = this.dependentdropdowns.get('promoted')?.value
    console.log(this.promoted)
    const params = {
      reviewcycleid: this.reviewCycleID,
      page: this.page,
      pageSize: this.pageSize,
      promotion: this.promoted?.value,
    };
    this.getEmployeesOfTheReviewCycle(params);
  }

  onPageChange(newPage: number) {
    const params = {
      reviewcycleid: this.reviewCycleID,
      page: this.page,
      pageSize: this.pageSize
    };
    console.log('Page changed to:', this.page);
    this.getEmployeesOfTheReviewCycle(params);
  }

  onPageSizeChange(newPageSize: number) {
    console.log('Page size changed to:', newPageSize);
    this.page = 1;
    console.log(this.page)
    const params = {
      reviewcycleid: this.reviewCycleID,
      page: this.page,
      pageSize: this.pageSize
    };
    this.getEmployeesOfTheReviewCycle(params);
  }

  onSearchTextChange(): void {
    if (this.searchText) {
      this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id }, true); 
    } else {
      this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id });
    }
  }

  getEmployeesOfTheReviewCycle(params: any, fetchAll = false): void {
    this.dataload = true;
    const pageSize = fetchAll ? 10000 : this.pageSize;
    params.pageSize = pageSize;
    params.pageNumber = this.pageSize;
    this.http.getDataIncludeParams("ReviewCycleItem", params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.listOfAllEmployees = data.items || [];
        this.reportOfAllEmployees = data.items || [];
        this.filteredEmployees = this.listOfAllEmployees;

        this.collectionSize = data.totalCount;
        this.dataload = false;
        if (this.searchText) {
          this.filterEmployees();
        }
        this.getEmployeesOfTheReviewCycleforReport()
      },
      error: (err) => {
        console.error('Error getting employees:', err);
        this.dataload = false;
      },
      complete: () => {
        this.dataload = false;
      }
    });
  }

  getEmployeesOfTheReviewCycleforReport(): void {
    const params = {
      reviewcycleid: this.selectedReviewCycle?.id,
      promotion: this.promoted?.value || '',
    };
    this.dataload = true;
    this.http.getDataIncludeParams("ReviewCycleItem", params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        console.log(data)
        this.reportOfAllEmployees = data.items || [];
      },
      error: (err) => {
        console.error('Error getting employees:', err);
        this.dataload = false;
      },
      complete: () => {
        this.dataload = false;
      }
    });
  }

  filterEmployees(): void {
    if (!this.searchText) {
      this.filteredEmployees = this.listOfAllEmployees;
    } else {
      const searchTextLower = this.searchText.toLowerCase();
      this.filteredEmployees = this.listOfAllEmployees.filter(employee => {
        return Object.values(employee).some(val =>
          val && val.toString().toLowerCase().includes(searchTextLower)
        );
      });
      this.collectionSize = this.filteredEmployees.length;
    }
  }

  selectedIds: number[] = [];
  allSelected = false;
  onHeaderCheckboxChange(event: any): void {
    this.allSelected = event.target.checked;
    this.filteredEmployees.forEach(employee => {
      if (employee.status !== 'Review on Hold') {
        employee.selected = this.allSelected;
      }
    });
    this.selectedIds = this.allSelected ? this.filteredEmployees.filter(emp => emp.status !== 'Review on Hold').map(emp => emp.id) : [];
    console.log(this.selectedIds);
  }

  onCheckboxChange(event: any, id: number): void {
    const employee = this.filteredEmployees.find(emp => emp.id === id);
    if (employee) {
      employee.selected = event.target.checked;

      // Update selected IDs array
      if (employee.selected) {
        if (!this.selectedIds.includes(id)) {
          this.selectedIds.push(id);
        }
      } else {
        const index = this.selectedIds.indexOf(id);
        if (index > -1) {
          this.selectedIds.splice(index, 1);
        }
      }
    }

    // Check header checkbox state
    const allSelected = this.filteredEmployees.every(emp => emp.selected);
    const headerCheckbox = document.getElementById('flexCheckDefaultHeader') as HTMLInputElement;

    if (headerCheckbox) {
      if (allSelected) {
        headerCheckbox.checked = true; // All rows are selected
      } else {
        headerCheckbox.checked = false; // Deselect header checkbox
      }
    }
    const anySelected = this.filteredEmployees.some(emp => emp.selected);
    // Clear selectedIds array if no rows are selected
    if (!anySelected) {
      this.selectedIds = [];
    }
    console.log('Selected IDs:', this.selectedIds);
  }

  openModal(content: any) {
    console.log(content)
    this.modalService.open(content, { centered: true })
  }

  OnClickToassesinreviewTemplate(data: any) {
    if (data) {
      if (!this.selectedIds.includes(data)) {
        this.selectedIds.push(data);
      }
    } else {
      const index = this.selectedIds.indexOf(data);
      if (index > -1) {
        this.selectedIds.splice(index, 1);
      }
    }
  }

  downloadPromotionletter(iteamid: any) {
    console.log(iteamid);

    this.http.getByDownload<Blob>(`Report/downloadletter/${iteamid.reviewEmployeeId}?lettertype=PromotionLetter&reviewcycleitemid=${iteamid.id}`, { responseType: 'blob' as 'json' })
      .pipe(takeUntil(this.destroy$)).subscribe({

        next: (data: Blob) => {
          console.log('Received byte data:', data);
          const blob = new Blob([data], { type: 'application/pdf' }); // Ensure correct MIME type
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${iteamid.reviewEmployeeIdName}-Promotion Letter.pdf`; // Set file name
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          // this.Status = 'Promotion Letter Downloaded Successfully';
          this.modal.openSuccessModal('Promotion Letter Downloaded Successfully');
          // this.modalService.open(this.success, { centered: true });
        },
        error: (err) => {
          console.error('Error downloading letter:', err);
          this.Status = 'Failed to download letter';
        },
      });
  }

  downloadletter(iteamid: any) {
    console.log(iteamid);

    this.http.getByDownload<Blob>(`Report/downloadletter/${iteamid.reviewEmployeeId}?lettertype=PerformanceAppraisal&reviewcycleitemid=${iteamid.id}`, { responseType: 'blob' as 'json' })
      .pipe(takeUntil(this.destroy$)).subscribe({

        next: (data: Blob) => {
          console.log('Received byte data:', data);
          const blob = new Blob([data], { type: 'application/pdf' }); // Ensure correct MIME type
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${iteamid.reviewEmployeeIdName}-Appraisal Letter.pdf`; // Set file name
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          // this.Status = 'Appraisal Letter Downloaded Successfully';
          // this.modalService.open(this.success, { centered: true });
          this.modal.openSuccessModal('Appraisal Letter Downloaded Successfully');
        },
        error: (err) => {
          console.error('Error downloading letter:', err);
          this.Status = 'Failed to download letter';
        },
      });
  }

  holdemployee(seletedid: any) {
    this.modalRef = this.modalService.open(this.loading, { centered: true });
    const payload = {
      status: 'Review on Hold',
      createdBy: this.empinfo.employeeId,
    }
    this.http.putData(`ReviewCycleItem/updatestatus/${seletedid}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        if (this.modalRef) {
          this.modalRef.close();
        }
        this.modalService.dismissAll()
        this.modal.openSuccessModal('Employee is Kept on Hold');
        this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
      },
      error: (err) => {
        console.error('Error updating review template:', err);
        if (this.modalRef) {
          this.modalRef.close();
        }
      },
    });
  }

  initiatetemplatedropdownsForm() {
    this.reviewtemplatedropdowns = this.fb.group({
      reviewTemplateId: [null, [Validators.required]],
    });
  }

  initialupdatereviewtemplatedropdownsForm() {
    this.updatereviewtemplatedropdowns = this.fb.group({
      reviewTemplateId: [null, [Validators.required]],
    });
  }

  assignReviewTemplate() {
    this.modalRef = this.modalService.open(this.loading, { centered: true });
    console.log(this.selectedemployeereviewtemplate)
    const payload = {
      reviewTemplateId: this.reviewtemplatedropdowns.value.reviewTemplateId,
    }
    const id = this.selectedIds.toString();
    this.http.putData(`ReviewCycleItem/update/${id}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        if (this.modalRef) {
          this.modalRef.close();
        }
        this.modalService.dismissAll()
        this.reviewtemplatedropdowns.reset()
        this.selectedIds = [];
        // this.Status = 'Form Assigned Successfully'
        // this.modalService.open(this.success, { centered: true });
        this.modal.openSuccessModal('Form Assigned Successfully')
        this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
      },
      error: (err) => {
        this.selectedIds = [];
        console.error('Error updating review template:', err);
        if (err.status === 404) {
          // this.Status ='Select atleast one employee to assign the template';
          // this.modalService.open(this.errormessagecloseall, { centered: true });
          this.modal.openErrorModal('Select atleast one employee to assign the template');
        }
        else if (err.status === 400) {
          // this.Status =err.error.message || 'An error occurred while assigning the template';
          // this.modalService.open(this.errormessagecloseall, { centered: true });
          this.modal.openErrorModal(err.error.message || 'An error occurred while assigning the template');
        } else {
          // this.Status =err.error.details || 'An error occurred while assigning the template';
          // this.modalService.open(this.errormessagecloseall, { centered: true });
          this.modal.openErrorModal(err.error.message || 'An error occurred while assigning the template');
        }
        if (this.modalRef) {
          this.modalRef.close();
        }
      },
      complete: () => {
        this.selectedIds = [];
      },
    });
  }

  resumeanemployee(seletedid: any) {
    this.modalRef = this.modalService.open(this.loading, { centered: true });
    const payload = {
      status: 'Resume',
      createdBy: this.empinfo.employeeId,
    }
    this.http.putData(`ReviewCycleItem/updatestatus/${seletedid}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        if (this.modalRef) {
          this.modalRef.close();
        }
        this.modalService.dismissAll();
        this.modal.openSuccessModal('Employee is Resumed Successfully');
      },
      error: (err) => {
        console.error('Error updating review template:', err);
        if (this.modalRef) {
          this.modalRef.close();
        }
      },
      complete: () => {
        this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
      }
    });
  }

  status!: string;
  onclickStatusupdate(status: string) {
    this.status = status;
    console.log(this.status);
  }

  authorityDetailsForAppraisal = [] as any;
  getAppraisalAuthorityDetails() {
    const offertype = 'Appraisal Letter'
    this.http.getData(`SignaturesList?LetterType=${offertype}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        console.log(data);
        this.authorityDetailsForAppraisal = data
      }
    })
  }

  genarateAppraisalletter(iteamid: any) {
    console.log(iteamid)
    this.http.getData(`AppraisalLetter/generateappraisalletter/?reviewcycleitemId=${iteamid}&employeeId=${this.empinfo.employeeId}&lettertype=performanceappraisal&effectivedate=${this.Effectivedatefrom.get('effectiveFromDATE')?.value}&signatureempId=${this.Effectivedatefrom.get('signaturename')?.value}&status=${this.status}`)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          this.modal.openSuccessModal('Appraisal Letter Generated Successfully');
        },
        error: (err) => {
          if (err.status === 500) {
            this.modal.openErrorModal(err.error.details || 'An error occurred while generating letters');
          }
          else if (err.status === 409) {
            this.modal.openErrorModal(err.error.details || 'An error occurred while generating letters');
          }
          else {
            this.modal.openErrorModal(err.error.details || 'An error occurred while generating letters');
          }
        },
        complete: () =>{
          this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
          this.Effectivedatefrom.reset();
        }
      })

  }

  initiondateForm() {
    this.Effectivedatefrom = this.fb.group({
      effectiveFromDATE: [null, [Validators.required]],
      signaturename: [null, [Validators.required]],
    });
  }

  Click(id: number, status: string) {
    if (id) {
      this.selectedIds.push(id);
      this.status = status;
      console.log(this.status);
    }
  }

  SentLetters() {
    this.http.postletters(`AppraisalLetter/releaseappraisalletter?reviewcycleitemId=${this.selectedIds || this.allSelected}&employeeId=${this.empinfo.employeeId}&lettertype=performanceappraisal&status=${this.status}`)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
          this.modal.openSuccessModal('Appraisal Letter Sent Successfully');
        },
        error: (err: any) => {
          console.error('Error generating letters:', err);
          if (err.status === 500) {
            this.modal.openErrorModal(err.error.details || 'An error occurred while sending letters');
          } else {
            this.modal.openErrorModal(err.error.details || 'An error occurred while sending letters');
          }
        }
      });
  }

  authorityDetailsForPromotion = [] as any;
  getAuthorityDetails() {
    const offertype = 'Promotion Letter'
    this.http.getData(`SignaturesList?LetterType=${offertype}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        console.log(data);
        this.authorityDetailsForPromotion = data
      }
    })
  }

  genaratePromotionletter(iteamid: any) {
    console.log(iteamid)
    this.http.getData(`AppraisalLetter/generateappraisalletter/?reviewcycleitemId=${iteamid}&employeeId=${this.empinfo.employeeId}&lettertype=PromotionLetter&effectivedate=${this.Effectivedatefrom.get('effectiveFromDATE')?.value}&signatureempId=${this.Effectivedatefrom.get('signaturename')?.value}&status=${this.status}`,)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          console.log(data)

          this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
          // this.Status = 'Promotion Letter Generated Successfully'
          // this.modalService.open(this.success, { centered: true });
          this.modal.openSuccessModal('Promotion Letter Generated Successfully')
          this.Effectivedatefrom.reset()
        },
        error: (err) => {
          console.error('Error generating letter:', err);
          if (err.status === 500) {
            // this.Status = err.error.details || 'An error occurred while generating letters';
            // this.modalService.open(this.errormessage, { centered: true });
            this.modal.openErrorModal(err.error.details || 'An error occurred while generating letters');
          }
          else if (err.status === 409) {
            // this.Status = err.error.message || 'An error occurred while generating letters';
            // this.modalService.open(this.errormessagecloseall, { centered: true });
            this.modal.openErrorModal(err.error.details || 'An error occurred while generating letters');
          }
          else {
            // this.Status = err.error.details || 'An error occurred while generating letters';
            // this.modalService.open(this.errormessagecloseall, { centered: true });
            this.modal.openErrorModal(err.error.details || 'An error occurred while generating letters');
          }
        },
      })
  }

  SentpromationLetters(): void {
    console.log(this.selectedIds);
    this.http.postletters(`AppraisalLetter/releaseappraisalletter?reviewcycleitemId=${this.selectedIds || this.allSelected}&employeeId=${this.empinfo.employeeId}&lettertype=PromotionLetter&status=${this.status}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        console.log(data);
        this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
        // this.Status = 'Promotion Letter Sent Successfully';
        // this.modalService.open(this.success, { centered: true });
        this.modal.openSuccessModal('Promotion Letter Sent Successfully');
      },
      error: (err: any) => {
        console.error('Error generating letters:', err);
        if (err.status === 500) {
          // this.Status = err.error.details || 'An error occurred while sending letters';
          // this.modalService.open(this.errormessage, { centered: true });
          this.modal.openErrorModal(err.error.details || 'An error occurred while sending letters');
        } else {
          // this.Status = err.error.message || 'An error occurred while sending letters';
          // this.modalService.open(this.errormessage, { centered: true });
          this.modal.openErrorModal(err.error.details || 'An error occurred while sending letters');
        }
      }
    });
  }

  initiateAddEmployeeForm() {
    this.addEmployeeForm = this.fb.group({
      reviewCycleName: [{ value: null, disabled: true }, [Validators.required]],
      employeeName: [null, [Validators.required]],
      department: [{ value: null, disabled: true }, [Validators.required]],
      team: [{ value: null, disabled: true }, [Validators.required]],
      location: [{ value: null, disabled: true }, [Validators.required]],
      subLocation: [{ value: null, disabled: true }, [Validators.required]],
    });
  }

  openCreate() {
    this.patchFormValuesAddEmployeeForm()
    this.modalService.open(this.addEmployee, {
      size: 'lg',
      centered: true,
    });
    const params = {
      reviewcycleid: this.selectedReviewCycle.id,
      locationId: this.loctionIds,
      subLocationId: this.subLoctionIds,
      departmentId: this.departmentIds,
      subDepartmentId: this.subDepartmentIds
    };
    this.getEmployeesList(params);
  }

  getEmployeesList(params: any) {
    this.http.getDataIncludeParams("reviewCycleHeader/getAllemployees", params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.employeesList = []
        this.employeesList = data
      }
    })
  }

  onEmployeeChange(event: any): void {
    const selectedEmployeeId = event.target.value;
    console.log(selectedEmployeeId)
    const selectedEmployee = this.employeesList.find(
      (employee: any) => employee.employeeId == selectedEmployeeId
    ); // Find the employee details

    if (selectedEmployee) {
      this.addEmployeeForm.patchValue({
        department: selectedEmployee.departmentName ?? '',
        team: selectedEmployee.subdepartmentName ?? '',
        location: selectedEmployee.locationName ?? '',
        subLocation: selectedEmployee.subLocationName ?? '',

      });
    }
  }

  patchFormValuesAddEmployeeForm(): void {
    this.addEmployeeForm.patchValue({
      reviewCycleName: this.selectedReviewCycle.reviewCycleName ?? '',
    });
  }

  addEmployeetoreviewcylce() {
    this.modalRef = this.modalService.open(this.loading, { centered: true });
    const payload = {
      reviewCycleHeaderId: this.selectedReviewCycle.id,
      reviewEmployeeId: this.addEmployeeForm.value.employeeName,
      status: 'Self Assessment Pending',
      createdBy: this.empinfo.employeeId,
      createdAt: new Date()
    }
    this.http.postdata('reviewCycleHeader/reviewitem', payload).subscribe({
      next: (data: any) => {
        if (this.modalRef) {
          this.modalRef.close(); 
        }
        this.modalService.dismissAll();
        this.modal.openSuccessModal('Employee Added Successfully');
      },
      error: (err) => {
        if (this.modalRef) {
          this.modalRef.close(); 
        }
        console.error('Error adding employee:', err);
      },
      complete:()=>{
        this.addEmployeeForm.reset();
        this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
      }
    });
  }

  formatDate(dateString: string): string {
    if (dateString) {
      if (dateString != '') {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear().toString();
        return `${day}-${month}-${year}`;
      }
    }
    return dateString;
  }

  reviewCyclename!: string;
  reportdata(): void {
    const payload = this.reportOfAllEmployees.map(employee => ({
      'Review Cycle Name': employee.reviewCycleHeaderIdName,
      'Employee Name': employee.reviewEmployeeIdName,
      'Department': employee.departmentName,
      'Team': employee.subDepartmentName,
      'Location': employee.locationName,
      'Sub Location': employee.subLocationName,
      'Date Of Joining': this.formatDate(employee.dateofjoining) || '-',
      'Effective Date': this.formatDate(employee.effectivedate) || '-',
      'Current Salary': employee.currentSalaryAuto,
      'Current Designation': employee.currentDesignation,
      'Revised Designation': employee.revisedDesignation || '-',
      'Appraisal Increment Percentage': employee.incrementPercentageAuto || '-',
      'Appraisal Increment Amount': employee.incrementAmountAuto || '-',
      'Appraisal Revised Salary': employee.revisedSalaryAuto || '-',
      'Manual Increment Percentage': employee.considerManualInputs ? employee.incrementPercentageMannual : '-',
      'Manual Increment Amount': employee.considerManualInputs ? employee.incrementAmountMannual : '-',
      'Manual Revised Salary': employee.considerManualInputs ? employee.revisedSalaryMannual : '-',
      'Salary Correction Percentage': employee.isSalaryCorrection ? employee.salaryCorrectionIncrementPercentage : '-',
      'Salary Correction Increment Amount': employee.isSalaryCorrection ? employee.salaryCorrectionIncrementAmount : '-',
      'Salary Correction Revised Salary': employee.isSalaryCorrection ? employee.salaryCorrectionRevisedAmount : '-',
      'Employee Over All Rating': employee.employeeoverallrating || '-',
      'Team Manager Over All Rating': employee.tmoverallrating || '-',
      'Reporting Manager Over All Rating': employee.rmoverallrating || '-',
      'HR Over All Rating': employee.hroverallrating || '-',
    }));

    const fileType = 'excel'; // Define the file type
    this.reviewCyclename = payload[0]['Review Cycle Name']
    this.http.postDatareport(`reviewCycleHeader/export?fileType=${fileType}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: Blob) => {
        console.log('Export successful', response);
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.reviewCyclename}-Appraisal Report.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        this.modalService.dismissAll();
        this.modal.openSuccessModal('Appraisal Report Downloaded Successfully');
      },
      error: (err: any) => {
        console.error('Error exporting data:', err);
      }
    });
  }

  showGeneratePromotionButton(): any {
    return this.listOfAllEmployees.some(employee => employee.applicableForPromotion === true && employee.status === 'Completed');
  }

  showGenerateAppirtialButton(): any {
    return this.listOfAllEmployees.some(employee => employee.applicableForPromotion === false && employee.status === 'Completed');
  }

  showsentAppirtialButton(): any {
    return this.listOfAllEmployees.some(employee => employee.status === 'Appraisal Letter Generated');
  }

  showsentpromotionButton(): any {
    return this.listOfAllEmployees.some(employee => employee.status === 'Promotion Letter Generated');
  }

  generateLetters(): void {
    console.log(this.selectedIds);
    this.http.getData(`AppraisalLetter/generateappraisalletter/?reviewcycleitemId=${this.selectedIds || this.allSelected}&employeeId=${this.empinfo.employeeId}&lettertype=performanceappraisal&effectivedate=${this.Effectivedatefrom.get('effectiveFromDATE')?.value}&signatureempId=${this.Effectivedatefrom.get('signaturename')?.value}&status=${this.status}`)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.modal.openSuccessModal('Appraisal Letters Generated Successfully');
        },
        error: (err: any) => {
          console.error('Error generating letters:', err);
          if (err.status === 500) {
            this.modal.openErrorModal(err.error.details || 'An error occurred while generating letters')
          }
          else if (err.status === 409) {
            this.modal.openErrorModal(err.error.details || 'An error occurred while generating letters')
          }
          else {
            this.modal.openErrorModal(err.error.details || 'An error occurred while generating letters')
          }
        },
        complete: () =>{
          this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
          this.Effectivedatefrom.reset();
        }
      });
  }

  onclickstatusforappraisal(Value: string) {
    this.status = Value;
    this.SentLetters();
  }

  onclickstatusforPromotion(Value: string) {
    this.status = Value;
    this.SentpromationLetters();
  }

  generatepromationLetters(): void {
    console.log(this.selectedIds);
    this.http.getData(`AppraisalLetter/generateappraisalletter/?reviewcycleitemId=${this.selectedIds || this.allSelected}&employeeId=${this.empinfo.employeeId}&lettertype=PromotionLetter&effectivedate=${this.Effectivedatefrom.get('effectiveFromDATE')?.value}&signatureempId=${this.Effectivedatefrom.get('signaturename')?.value}&status=${this.status}`)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          console.log(data);
          this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
          // this.Status = 'Promotion Letter Generated Successfully';
          // this.modalService.open(this.success, { centered: true });
          this.modal.openSuccessModal('Promotion Letter Generated Successfully');
          this.Effectivedatefrom.reset();

        },
        error: (err: any) => {
          console.error('Error generating letters:', err);
          if (err.status === 500) {
            // this.Status = err.error.details || 'An error occurred while generating letters';
            // this.modalService.open(this.errormessage, { centered: true });
            this.modal.openErrorModal(err.error.details || 'An error occurred while generating letters')
          }
          else if (err.status === 409) {
            // this.Status = err.error.message || 'An error occurred while generating letters';
            // this.modalService.open(this.errormessagecloseall, { centered: true });
            this.modal.openErrorModal(err.error.details || 'An error occurred while generating letters')
          }
          else {
            // this.Status = err.error.details || 'An error occurred while generating letters';
            // this.modalService.open(this.errormessagecloseall, { centered: true });
            this.modal.openErrorModal(err.error.details || 'An error occurred while generating letters')
          }
          this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
        }
      });
  }

  closeModal() {
    this.Effectivedatefrom.reset();
    this.reviewtemplatedropdowns.reset();
    this.modalService.dismissAll();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
