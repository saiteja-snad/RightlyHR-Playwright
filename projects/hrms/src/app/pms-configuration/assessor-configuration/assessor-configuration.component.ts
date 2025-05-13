import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { UpdateAssessorComponent } from './update-assessor/update-assessor.component';
import { ViewAssessorComponent } from './view-assessor/view-assessor.component';
import { AddAssessorComponent } from './add-assessor/add-assessor.component';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
import moment from 'moment';
import { IReviewCycle, IDesignationNames } from './add-assessor/add-assessor.modal';
import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
@Component({
  selector: 'app-assessor-configuration',
  imports: [CommonModule, RouterModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, NoDataFoundComponent, DataLoaderContentComponent, TranslateModule, Select,
  ],
  templateUrl: './assessor-configuration.component.html',
  styleUrl: './assessor-configuration.component.scss'
})

export class AssessorConfigurationComponent implements OnInit, OnDestroy {
  dataload = false;
  empinfo = {} as any;
  subscription!: Subscription;
  searchValue: any;
  deleteId: any;
  ratingscaledetailsarray = [] as any;
  options = [
    { label: 10, value: 10 },
    { label: 15, value: 15 },
    { label: 20, value: 20 },
    { label: 25, value: 25 },
  ];
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  searchQuery = '';
  first = 0;
  totalRecords = 0;
  searchText = '';
  assessorDetailsget: any[] = [];
  updateassesorConfiguration = {} as any;
  Status: any;
  isLoading = false;
  myForm!: NgForm;
  removeRowdata: any;
  reviewCycledetailyById = {};
  reviewCycleDropDownData = [] as IReviewCycle[];
  reviewCycleData = [] as IDesignationNames[];
  assesorDetails = [] as any;
  currentDate: any;
  activeEmplist = [] as any;
  headerId: any;
  deletedRows: any[] = [];
  @ViewChild('updateAssessor') updateAssessor: any;

  constructor(private http: HttpService, private modalService: NgbModal, 
    private conformationPopup: OpenModalService, public rbac: RbacService, private authService: AuthService, ) {
    effect(() => {
      if (this.http.tirggerCountSignal().global) {
        this.getAllAssesorConfigurationdata(this.page, this.pageSize);
        this.http.tirggerCountSignal.update((status) => ({
          ...status,
          global: false,
        }));
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllAssesorConfigurationdata(this.page, this.pageSize);
    this.getAllasessors(),
    this.getReviewCycledata(),
    this.getAllActiveEmpList()
  }

  openAdd() {
    this.modalService.open(AddAssessorComponent, {centered: true, backdrop: 'static', size: 'xl'});
  }

  openDelete(content: any, data: any) {
    this.deleteId = data.assessor.id;
    this.modalService.open(content, { backdrop: 'static', centered: true });
  }

  updateDetails(data: any) {
    const modalRef = this.modalService.open(UpdateAssessorComponent, {centered: true, backdrop: 'static', size: 'xl'});
    modalRef.componentInstance.updateData = data;
  }

  viewDetails(data: any) {
    const modalRef = this.modalService.open(ViewAssessorComponent, {centered: true, backdrop: 'static', size: 'xl',});
    modalRef.componentInstance.updateData = data;
  }

  openHoldMsg(){
    this.conformationPopup.openErrorModal('Review Cycle kept on hold');
  }

  onSearchTextChange(): void {
    this.page = 1;        
    this.first = 0; 
    this.getAllAssesorConfigurationdata(this.page, this.pageSize);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getAllAssesorConfigurationdata(this.page, this.pageSize);
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize; 
    this.page = 1;
    this.first = 0;
    this.getAllAssesorConfigurationdata(this.page, this.pageSize);
  }

  //function to get the globalpermissions details
  getAllAssesorConfigurationdata(pagenum: number, pagesize: number): void {
    const params: { pageNumber: number; pageSize: number; searchparam?: string } = {
      pageNumber: pagenum,
      pageSize: pagesize,
    };
    
    if (this.searchText) {
      params.searchparam = this.searchText;
    }

    this.dataload = true;
    this.subscription = this.http.getpagentiontData(`Assessor/GetAssessors`, params).subscribe({
      next: (response: any) => {
        this.assessorDetailsget = response.items || [];
        this.collectionSize = response.totalCount;
      },
      error: (err: any) => {
        this.dataload = false;
      },
      complete: () => {
        this.dataload = false;
      },
    });
  }

  getNamesAsString(array: any, type: string): string {
    if (!Array.isArray(array)) {
      return '';
    }
    switch (type) {
      case 'locationName':
        return array.map((item: any) => item.locationName).join(', ');
      case 'subLocationName':
        return array.map((item: any) => item.subLocationName).join(', ');
      case 'departmentName':
        return array.map((item: any) => item.departmentName).join(', ');
      case 'subDepartmentName':
        return array.map((item: any) => item.subDepartmentName).join(', ');
      default:
        return '';
    }
  }

  //function to inactivate the incremental persentage
  deleteData() {
    const payload = {
      reviewCycleId: this.deleteId,
    };
    this.http.postdata(`Assessor/delete?id=${this.deleteId}`, payload).subscribe({
      next: (response: any) => {
        this.getAllAssesorConfigurationdata(this.page, this.pageSize);
        this.conformationPopup.openSuccessModal('Deleted Successfully')
      },
      error: (err: any) => {
        this.conformationPopup.openErrorModal(err.error.message)
      },
      complete: () => { },
    });
  }

  // Update Assessor Configuration After Initiating the Review Cycle
  editDetails(Values: any) {
    this.headerId = Values.assessor.id;

    this.updateassesorConfiguration = {
      id: Values.id,
      reviewCycleId: Values.reviewCycleId,
      department: Values.departmentNames?.map((d: any) => d.departmentName).join(', ') || '',
      location: Values.locationNames?.map((l: any) => l.locationName).join(', ') || '',
      team: Values.subDepartmentNames?.map((s: any) => s.subDepartmentName).join(', ') || '',
      sublocation: Values.subLocationNames?.map((s: any) => s.subLocationName).join(', ') || '',
    };

    this.assesorDetails = Values.assessorItems?.map((item: any) => ({
      ...item,
      assessors: item.assessor,
      assessorempId: parseInt(item.assessorEmployeeIds),
      assessorEmpName: item.assessorEmpName,
      deadlineindays: item.dueDate?.split('T')[0],
      comments: item.isCommentsVisible,
      rating: item.isRatingVisible,
      view: item.isView,
    })) || [];

    this.modalService.open(this.updateAssessor, { size: 'xl', centered: true, backdrop: 'static' });
  }

  formatDate(date: any) {
    return date?.split('T')[0];
  }

  getAllasessors() {
    this.subscription = this.http
      .getData('entityAttributeValues?entity=PMS&attribute=assessorconfig')
      .subscribe({
        next: (data: any) => {
          this.reviewCycleData = data;
        },
      });
  }

  //function to get all active employees list
  getAllActiveEmpList() {
    this.subscription = this.http
      .getData(`Employeedata/ActiveEmployees`)
      .subscribe({
        next: (res: any) => {
          this.activeEmplist = res.map((employee: any) => {
            return {
              ...employee, // Spread the existing properties (like fusionEmpId, firstName, etc.)
              fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
                }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : ''
                }${employee.lastName}`,
            };
          });
        },
        error: (err: any) => { },
      });
  }

  // Check row state and trigger UI updates
  checkRowState(index: number) {
    const detail = this.assesorDetails[index];
    if (this.isRowFilled(detail)) {
    }
  }

  initialAddRowCall() {
    this.assesorDetails = [];
    this.addRow();
  }

  // Helper function to check if a row is filled
  isRowFilled(detail: any): boolean {
    // Check if mandatory fields are filled
    return !!(detail.assessors && detail.deadlineindays);
  }

  // Function to get all review cycle data
  getReviewCycledata() {
    this.subscription = this.http.getData(`reviewCycleHeader`).subscribe({
      next: (data: any) => {
        this.reviewCycleDropDownData = data.items as IReviewCycle[];
      },
      error: (err: any) => {
        console.error('Error fetching review cycle data:', err);
      },
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  close() {
    this.modalService.dismissAll();
  }

  //function to open the model popup
  openconfirmationModel(content: any) {
    this.modalService.open(content, { centered: true });
  }

  //function to open the model popup
  openconfirmationModelforcancle(content: any, form: any) {
    this.myForm = form;
    this.modalService.open(content, { centered: true });
  }

  //function to delete
  openDeletepopup(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  clearindexdata(index: any) {
    if (this.assesorDetails && this.assesorDetails[index]) {
      // Clear the data for the specific index
      this.assesorDetails[index] = {
        assessors: null,
        deadlineindays: null,
        assessorempId: null,
        comments: false,
        rating: false,
        view: false,
      };
    }
  }

  // Add Row to FormArray
  addRow() {
    const newRow = {
      assessors: null,
      deadlineindays: null,
      view: null,
      rating: null,
      comments: null,
      assessorempId: null,
    };
    this.assesorDetails.push(newRow);
  }

  // Delete Row from FormArray
  deleteupdateRow(index: number) {
    if (this.assesorDetails[index]) {
      const deletedRow = { ...this.assesorDetails[index], isDeleted: true };
      this.deletedRows.push(deletedRow);
      this.assesorDetails.splice(index, 1);
    }
    this.conformationPopup.openSuccessModal('Row Deleted Successfully');
  }

  // Handle form submission
  Updateassessor() {
    this.isLoading = true;
    const loggedinuser = this.authService.getToken();
    const currentDate = moment().startOf('day');

    // Check for past deadline dates
    const invalidDeadline = this.assesorDetails.some((item: any) => {
      const deadline = moment(item.deadlineindays).startOf('day');
      return deadline.isBefore(currentDate);
    });

    if (invalidDeadline) {
      this.isLoading = false;
      this.conformationPopup.openErrorModal("Deadline date cannot be in the past");
      return;
    }

    if (this.updateassesorConfiguration) {
      const payload = {
        reviewCycleId: this.updateassesorConfiguration.reviewCycleId,
        isDeleted: false,
        createdBy: loggedinuser.employeeId,
        createdAt: currentDate.toISOString(),
        reviewAssessorItems: [
          ...this.assesorDetails.map((item: any) => ({
            id: item.id,
            assessor: item.assessors,
            dueDate: item.deadlineindays,
            isRatingVisible: item.rating,
            isCommentsVisible: item.comments,
            isView: item.view,
            isDeleted: false,
            createdAt: currentDate.toISOString(),
            aessorEmployeeIds: item.assessorempId?.toString(),
          })),
          ...this.deletedRows.map((item: any) => ({
            id: item.id,
            assessor: item.assessors,
            dueDate: item.deadlineindays,
            isRatingVisible: item.rating,
            isCommentsVisible: item.comments,
            isView: item.view,
            isDeleted: true,
            createdAt: currentDate.toISOString(),
            aessorEmployeeIds: item.assessorempId?.toString(),
          })),
        ],
      };

      this.http
        .putData(`Assessor/UpdateReviewAssessorHeaderConfig/${this.headerId}`, payload)
        .subscribe({
          next: (response: any) => {
            this.isLoading = false;
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal(
              'Assessor Configurations Updated Successfully'
            );
          },
          error: (err: any) => {
            this.isLoading = false;
            if (err.status === 400) {
              this.conformationPopup.openErrorModal('An Assessor cannot be added more than once');
            } else if (err.status === 409) {
              this.conformationPopup.openErrorModal("Assessors cannot have the same Deadline Date");
            } else {
              this.conformationPopup.openErrorModal(err.error.Message);
            }
          },
          complete: () => {
            this.isLoading = false;
            this.http.tirggerCountSignal.update((status) => ({
              ...status,
              global: true,
            }));
          },
        });
    }
  }

  showAssessorActionDropdown(item: any): boolean {
    return (
      (this.rbac.allowedToAccess('Assessor Update(Status - Created).view') && item?.reviewCycleHeaderStatus === 'Created') ||
      (this.rbac.allowedToAccess('Assessor Delete(Status - Created).view') && item?.reviewCycleHeaderStatus === 'Created') ||
      (this.rbac.allowedToAccess('Assessor Update(Status - Initiated).view') && item?.reviewCycleHeaderStatus === 'Initiated') ||
      (this.rbac.allowedToAccess('Assessor Update(Status - Review On Hold).view') && item?.reviewCycleHeaderStatus === 'Review on Hold')
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
