import { Component, model, OnDestroy, OnInit, TemplateRef, viewChild, ViewChild } from '@angular/core';
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
import { PaginatorModule } from 'primeng/paginator';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';

@Component({
  selector: 'app-apprisal-list',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SelectModule, TranslateModule, MultiSelectModule, PaginatorModule, NoDataFoundComponent, DataLoaderContentComponent],
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

  reviewCyclename!: string;
  selectedIds: number[] = [];
  allSelected = false;
  authorityDetailsForAppraisal = [] as any;
  status!: string;
  authorityDetailsForPromotion = [] as any;

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
  rows = 10;
  collectionSize!: number;
  searchQuery = '';
  first = 0;
  totalRecords = 0;

  modalRef!: NgbModalRef;

  promotedOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];

  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 }
  ];

  @ViewChild('loading') loading: any;
  @ViewChild('addEmployee') addEmployee: any;
  @ViewChild('confirmation') confirmation: any;
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
    this.getAuthorityDetails();
    this.getAppraisalAuthorityDetails();
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

  onReviewCycleChange(selectedValue: any): void {
      
    const selectedId = selectedValue.value;
    if (!selectedId) {
      console.error('No value selected.');
      return;
    }
  
    const selectedCycle = this.getSelectedCycle(selectedId);
    if (!selectedCycle) {
      return;
    }

    this.selectedReviewCycle = selectedCycle;
    this.reviewCycleID = selectedCycle.id
  
    this.updateStatuses(selectedCycle.status);
    this.resetDropdownData();
  
    const { locations, sublocations, departments, subdepartments } = selectedCycle;
    this.updateDropdowns(locations, sublocations, departments, subdepartments);
  
    this.patchFormValues(selectedId, departments, subdepartments, locations, sublocations);
  
    this.setAdditionalFields(locations, sublocations, departments, subdepartments);
  
    const params = this.buildParams(selectedCycle.id);
    this.first = 0;
    this.searchText = null;
    this.rows= 10;
    this.getEmployeesOfTheReviewCycle(params);
  }
  
  getSelectedCycle(selectedId: any) {
    return this.reviewCyclesList.find((item: any) => item.id == selectedId.id);
  }
  
  updateStatuses(status: string) {
    this.createdStatuses = status.trim().toLowerCase() === 'created' ? ['created'] : [];
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
    return {
      page: 1,
      pageSize: 10,
      reviewcycleid: reviewCycleId,
      promotion: this.promoted?.value || '',
    };
  }
  
  onPromotedChange(event: any): void {
    this.promoted = this.dependentdropdowns.get('promoted')?.value
    const params = {
      reviewcycleid: this.reviewCycleID,
      page: this.page,
      pageSize: this.pageSize,
      promotion: this.promoted?.value,
    };
    this.getEmployeesOfTheReviewCycle(params);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;

    const params: { reviewcycleid: any; page: number; pageSize: number; searchQuery?: string } = {
      reviewcycleid: this.reviewCycleID,
      page: this.page,
      pageSize: this.pageSize
    };

    if (this.searchText) {
      params.searchQuery = this.searchText;
    }

    this.getEmployeesOfTheReviewCycle(params);
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize; 
    this.page = 1;
    this.first = 0;

    const params:  { reviewcycleid: any; page: number; pageSize: number; searchQuery?: string }  = {
      reviewcycleid: this.reviewCycleID,
      page: this.page,
      pageSize: this.pageSize
    };

    if (this.searchText) {
      params.searchQuery = this.searchText;
    }

    this.getEmployeesOfTheReviewCycle(params);
  }

  onSearchTextChange(): void {
    if (this.searchText) {
      const params:  { reviewcycleid: any; page: number; pageSize: number; searchQuery?: string }  = {
        reviewcycleid: this.reviewCycleID,
        page: this.page,
        pageSize: this.pageSize
      };

      this.getEmployeesOfTheReviewCycle(params); 
    } else {
      this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id });
    }
  }

  getEmployeesOfTheReviewCycle(params: any): void {
    this.dataload = true;
    // params.pageSize = fetchAll ? 10000 : this.pageSize;
    
    if (this.searchText) {
      params.searchQuery = this.searchText;
    }

    this.http.getDataIncludeParams("ReviewCycleItem", params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.listOfAllEmployees = data.items || [];
        this.reportOfAllEmployees = data.items || [];
        this.filteredEmployees = this.listOfAllEmployees;
        this.collectionSize = data.totalCount;

        // if (this.searchText) {
        //   this.filterEmployees();
        // }
        // this.getEmployeesOfTheReviewCycleforReport();
      },
      error: (err) => {
        this.dataload = false;
      },
      complete: () => {
        this.dataload = false;
      }
    });
  }

  getEmployeesOfTheReviewCycleforReport(): void {
    const params: { reviewcycleid: any; promotion: any; searchQuery?: string } = {
      reviewcycleid: this.selectedReviewCycle?.id,
      promotion: this.promoted?.value || '',
    };

    if (this.searchText) {
      params.searchQuery = this.searchText;
    }

    this.dataload = true;
    this.http.getDataIncludeParams("ReviewCycleItem", params).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.reportOfAllEmployees = data.items || [];
      },
      error: (err) => {
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

  onHeaderCheckboxChange(event: any): void {
    this.allSelected = event.target.checked;
    this.filteredEmployees.forEach(employee => {
      if (employee.status !== 'Review on Hold') {
        employee.selected = this.allSelected;
      }
    });
    this.selectedIds = this.allSelected ? this.filteredEmployees.filter(emp => emp.status !== 'Review on Hold').map(emp => emp.id) : [];
  }

  onCheckboxChange(event: any, id: number): void {
    const employee = this.filteredEmployees.find(emp => emp.id === id);
    if (employee) {
      employee.selected = event.target.checked;

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

    const allSelected = this.filteredEmployees.every(emp => emp.selected);
    const headerCheckbox = document.getElementById('flexCheckDefaultHeader') as HTMLInputElement;

    if (headerCheckbox) {
      if (allSelected) {
        headerCheckbox.checked = true; 
      } else {
        headerCheckbox.checked = false; 
      }
    }
    const anySelected = this.filteredEmployees.some(emp => emp.selected);
    if (!anySelected) {
      this.selectedIds = [];
    }
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true });
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
    this.http.getByDownload<Blob>(`Report/downloadletter/${iteamid.reviewEmployeeId}?lettertype=PromotionLetter&reviewcycleitemid=${iteamid.id}`, { responseType: 'blob' as 'json' })
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: Blob) => {
          const blob = new Blob([data], { type: 'application/pdf' }); 
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${iteamid.reviewEmployeeIdName}-Promotion Letter.pdf`; 
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.modal.openSuccessModal('Promotion Letter Downloaded Successfully');
        },
        error: (err) => {
          this.modal.openErrorModal(err.error.message? err.error.message : 'Failed to download letter');
        },
      });
  }

  downloadletter(iteamid: any) {
    this.http.getByDownload<Blob>(`Report/downloadletter/${iteamid.reviewEmployeeId}?lettertype=PerformanceAppraisal&reviewcycleitemid=${iteamid.id}`, { responseType: 'blob' as 'json' })
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: Blob) => {
          const blob = new Blob([data], { type: 'application/pdf' }); 
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${iteamid.reviewEmployeeIdName}-Appraisal Letter.pdf`; 
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          this.modal.openSuccessModal('Appraisal Letter Downloaded Successfully');
        },
        error: (err) => {
          this.modal.openErrorModal('Failed to download letter');
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
        this.modalService.dismissAll();
        this.modal.openSuccessModal('Employee is Kept on Hold');
      },
      error: (err) => {
        if (this.modalRef) {
          this.modalRef.close();
        }
        this.modal.openErrorModal( err.error.message? err.error.message : 'Error updating review template');
      },
      complete: () =>{
        this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
      }
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

  assignReviewTemplate(form: FormGroup) {
    this.modalRef = this.modalService.open(this.loading, { centered: true });
    const formData= form.value;

    const payload = {
      reviewTemplateId: formData.reviewTemplateId.formId,
    }

    const id = this.selectedIds.toString();
    this.http.putData(`ReviewCycleItem/update/${id}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        if (this.modalRef) {
          this.modalRef.close();
        }
        this.modalService.dismissAll();
        this.modal.openSuccessModal('Form Assigned Successfully');
      },
      error: (err) => {
        this.selectedIds = [];
        if (err.status === 404) {
          this.modal.openErrorModal('Select atleast one employee to assign the template');
        }
        else if (err.status === 400) {
          this.modal.openErrorModal(err.error.message || 'An error occurred while assigning the template');
        } else {
          this.modal.openErrorModal(err.error.message || 'An error occurred while assigning the template');
        }
        if (this.modalRef) {
          this.modalRef.close();
        }
      },
      complete: () => {
        this.selectedIds = [];
        this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
        this.reviewtemplatedropdowns.reset();
        this.reviewtemplatedropdowns.reset();
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

  onclickStatusupdate(status: string) {
    this.status = status;
  }

  getAppraisalAuthorityDetails() {
    const offertype = 'Appraisal Letter'
    this.http.getData(`SignaturesList?LetterType=${offertype}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        // this.authorityDetailsForAppraisal = data
        this.authorityDetailsForAppraisal = data.map((user: any) => ({
          ...user,
          fullName: `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`
        }));
      }
    })
  }

  genarateAppraisalletter(itemId: any, form: FormGroup) {
    const formData = form.value;
    const params = new URLSearchParams({
      reviewcycleitemId: itemId,
      employeeId: this.empinfo.employeeId,
      lettertype: 'performanceappraisal',
      effectivedate: formData.effectiveFromDATE,
      signatureempId: formData.signaturename.employeeId,
      status: this.status
    });

    this.http.getData(`AppraisalLetter/generateappraisalletter/?${params.toString()}`)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
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
    }
  }

  SentLetters() {
    this.http.postletters(`AppraisalLetter/releaseappraisalletter?reviewcycleitemId=${this.selectedIds || this.allSelected}&employeeId=${this.empinfo.employeeId}&lettertype=performanceappraisal&status=${this.status}`)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.modal.openSuccessModal('Appraisal Letter Sent Successfully');
        },
        error: (err: any) => {
          if (err.status === 500) {
            this.modal.openErrorModal(err.error.details || 'An error occurred while sending letters');
          } else {
            this.modal.openErrorModal(err.error.details || 'An error occurred while sending letters');
          }
        },
        complete: () => {
          this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
        }
    });
  }

  sendLetters(): void {
    const reviewCycleItemIds = this.selectedIds || this.allSelected;
  
    if (!reviewCycleItemIds || reviewCycleItemIds.length === 0) {
      this.modal.openErrorModal('No review cycle items selected.');
      return;
    }
  
    const reviewcycleitemIdStr = Array.isArray(reviewCycleItemIds)
      ? reviewCycleItemIds.join(',')
      : reviewCycleItemIds;
  
    const params = new URLSearchParams({
      reviewcycleitemId: reviewcycleitemIdStr,
      employeeId: this.empinfo.employeeId.toString(),
      lettertype: 'performanceappraisal',
      status: this.status
    });
  
    this.http.postletters(`AppraisalLetter/releaseappraisalletter?${params.toString()}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.modalService.dismissAll();
          this.modal.openSuccessModal('Appraisal Letter Sent Successfully');
        },
        error: (err: any) => {
          const errorMessage = err.error?.details || 'An error occurred while sending letters';
          this.modal.openErrorModal(errorMessage);
        },
        complete: () => {
          this.getEmployeesOfTheReviewCycle({reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize});
        }
      });
  }
  
  getAuthorityDetails() {
    const offertype = 'Promotion Letter'
    this.http.getData(`SignaturesList?LetterType=${offertype}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        // this.authorityDetailsForPromotion = data
        this.authorityDetailsForAppraisal = data.map((user: any) => ({
          ...user,
          fullName: `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`
        })); 
      }
    })
  }

  genaratePromotionletter(itemId: any, form: FormGroup) {
    const formData = form.value;

    const params = new URLSearchParams({
      reviewcycleitemId: itemId,
      employeeId: this.empinfo.employeeId,
      lettertype: 'PromotionLetter',
      effectivedate: formData.effectiveFromDATE,
      signatureempId: formData.signaturename.employeeId,
      status: this.status
    });

    this.http.getData(`AppraisalLetter/generateappraisalletter/?${params.toString()}`)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.modal.openSuccessModal('Promotion Letter Generated Successfully');
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

  SentpromationLetters(): void {
    this.http.postletters(`AppraisalLetter/releaseappraisalletter?reviewcycleitemId=${this.selectedIds || this.allSelected}&employeeId=${this.empinfo.employeeId}&lettertype=PromotionLetter&status=${this.status}`).pipe(takeUntil(this.destroy$)).subscribe({
      next: (data: any) => {
        this.modal.openSuccessModal('Promotion Letter Sent Successfully');
      },
      error: (err: any) => {
        if (err.status === 500) {
          this.modal.openErrorModal(err.error.details || 'An error occurred while sending letters');
        } else {
          this.modal.openErrorModal(err.error.details || 'An error occurred while sending letters');
        }
      },
      complete: () => {
        this.getEmployeesOfTheReviewCycle({ reviewcycleid: this.selectedReviewCycle.id, page: this.page, pageSize: this.pageSize });
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
    const selectedEmployeeId = event.value?.employeeId;
    const selectedEmployee = this.employeesList.find(
      (employee: any) => employee.employeeId == selectedEmployeeId
    );

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
      reviewEmployeeId: this.addEmployeeForm.value.employeeName.employeeId,
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
      'Final Rating': employee.overallRating || '-',
    }));

    const fileType = 'excel'; 
    this.reviewCyclename = payload[0]['Review Cycle Name']
    this.http.postDatareport(`reviewCycleHeader/export?fileType=${fileType}`, payload).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: Blob) => {
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
        this.modal.openErrorModal(err.error.message ? err.error.message : 'Error exporting data')
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
    this.http.getData(`AppraisalLetter/generateappraisalletter/?reviewcycleitemId=${this.selectedIds || this.allSelected}&employeeId=${this.empinfo.employeeId}&lettertype=performanceappraisal&effectivedate=${this.Effectivedatefrom.get('effectiveFromDATE')?.value}&signatureempId=${this.Effectivedatefrom.get('signaturename')?.value}&status=${this.status}`)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => {
          this.modalService.dismissAll();
          this.modal.openSuccessModal('Appraisal Letters Generated Successfully');
        },
        error: (err: any) => {
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
    this.http.getData(`AppraisalLetter/generateappraisalletter/?reviewcycleitemId=${this.selectedIds || this.allSelected}&employeeId=${this.empinfo.employeeId}&lettertype=PromotionLetter&effectivedate=${this.Effectivedatefrom.get('effectiveFromDATE')?.value}&signatureempId=${this.Effectivedatefrom.get('signaturename')?.value}&status=${this.status}`)
      .pipe(takeUntil(this.destroy$)).subscribe({
        next: (data: any) => { 
          this.modal.openSuccessModal('Promotion Letter Generated Successfully');
        },
        error: (err: any) => {
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

  closeModal() {
    this.reviewtemplatedropdowns.reset();
    this.modalService.dismissAll();
    this.Effectivedatefrom.reset();
  }

  openConfirmation(){
    this.modalService.open(this.confirmation, { centered: true, backdrop: 'static'})
  }

  close(){
    this.modalService.dismissAll();
    this.addEmployeeForm.reset();
    this.reviewtemplatedropdowns.reset();
    this.Effectivedatefrom.reset();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }
}
