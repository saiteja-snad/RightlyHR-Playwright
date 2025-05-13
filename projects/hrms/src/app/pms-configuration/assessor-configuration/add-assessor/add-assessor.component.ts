import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { IReviewCycle } from '../../increment-percentage/add-increment/increment.modal';
import { IDesignationNames } from './add-assessor.modal';
import moment from 'moment';
@Component({
  selector: 'app-add-assessor',
  imports: [CommonModule, FormsModule, Select, TranslateModule],
  templateUrl: './add-assessor.component.html',
  styleUrl: './add-assessor.component.scss',
})

export class AddAssessorComponent implements OnInit, OnDestroy {
  empinfo = {} as any;
  subscription!: Subscription;
  postassesorConfiguration = {} as any;
  Status: any;
  isLoading = false;
  myForm!: NgForm;
  deleteId: any;
  removeRowdata: any;
  reviewCycledetailyById = {};
  reviewCycleDropDownData = [] as IReviewCycle[];
  reviewCycleData = [] as IDesignationNames[];
  assesorDetails = [] as any;
  currentDate: any;
  activeEmplist = [] as any;
  @ViewChild('deletesuccess') deletesuccess: any;
  @ViewChild('deleterowincrement') deleterowincrement: any;

  constructor(private authService: AuthService, private conformationPopup: OpenModalService, private http: HttpService,
    private modalService: NgbModal, public rbac: RbacService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getReviewCycledata();
    this.getAllasessors();
    this.getAllActiveEmpList();
    const today = new Date();
    this.currentDate = this.formatDate(today);
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }
  
  getAllasessors() {
    this.subscription = this.http.getData('entityAttributeValues?entity=PMS&attribute=assessorconfig').subscribe({
      next: (data: any) => {
        this.reviewCycleData = data;
      },
    });
  }

  //function to get all active employees list
  getAllActiveEmpList() {
    this.subscription = this.http.getData(`Employeedata/ActiveEmployees`).subscribe({
        next: (res: any) => {
          this.activeEmplist = res.map((employee: any) => {
            return {
              ...employee,
              fullName: `${employee.fusionEmpId ? 
                employee.fusionEmpId + ' - ' : '' }${employee.firstName} ${employee.middleName ? employee.middleName + ' ' : '' }${employee.lastName}`,
            };
          });
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        error: (err: unknown) => { },
      });
  }

  // Check row state and trigger UI updates
  checkRowState(index: number) {
    const detail = this.assesorDetails[index];
    if (this.isRowFilled(detail)) {
      // Log if row is filled
      console.log(`Row ${index} is filled`);
    } else {
      // Log if row is incomplete
      console.log(`Row ${index} is incomplete`);
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

  // Function to get review cycle data by ID and patch the form
  getReviewCycledataById() {
    let id: any;
    if (this.postassesorConfiguration.id) {
      id = this.postassesorConfiguration.id;
    }
    this.subscription = this.http.getData(`reviewCycleHeader/${id}`).subscribe({
      next: (data: any) => {
        this.reviewCycledetailyById = data;
        // Patch the form fields
        if (this.postassesorConfiguration) {
          (this.postassesorConfiguration.department = data[0]?.departments?.map((loc: any) => loc?.departmentName).join(', ')),
          (this.postassesorConfiguration.ratingId = data.id),
          (this.postassesorConfiguration.location = data[0]?.locations?.map((loc: any) => loc?.locationName).join(', ')),
          (this.postassesorConfiguration.sublocation = data[0]?.sublocations?.map((loc: any) => loc?.subLocationName).join(', ')),
          (this.postassesorConfiguration.team = data[0]?.subdepartments?.map((loc: any) => loc?.subDepartmentName).join(', '));
          this.initialAddRowCall();
        }
      },
      error: (err: any) => {
        this.postassesorConfiguration = {};
      },
    });
  }

  openModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  closeModal() {
    this.modalService.dismissAll();
    this.postassesorConfiguration = {}; // Reset the form
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
  deleteRow(index: number): void {
    this.assesorDetails.splice(index, 1);
    this.conformationPopup.openSuccessModal('Row Deleted Successfully');
  }

  // Handle form submission
  onSubmit() {
    this.isLoading = true;
    const loggedinuser = this.authService.getToken();
    const currentDate = new Date();
    const today = new Date().setHours(0, 0, 0, 0);
    const hasPastDeadline = this.assesorDetails.some((row: any) => {
      const deadline = new Date(row.deadlineindays).setHours(0, 0, 0, 0);
      return deadline < today;
    });
    if (hasPastDeadline) {
      this.isLoading = false;
      this.conformationPopup.openErrorModal("Deadline date cannot be in the past");
      return;
    }
    if (this.postassesorConfiguration) {
      const payload = {
        reviewCycleId: this.postassesorConfiguration.id,
        isDeleted: false,
        createdBy: loggedinuser.employeeId,
        createdAt: currentDate,
        items: this.assesorDetails?.map((row: any) => ({
          assessor: row.assessors,
          dueDate: row.deadlineindays,
          isView: row.view,
          isCommentsVisible: row.comments,
          isRatingVisible: row.rating,
          isDeleted: false,
          createdAt: currentDate,
          assessorEmployeeIds: row?.assessorempId?.toString(),
        })),
      };
      this.http.postdata(`Assessor/AddAssessor`, payload).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal('Assessor Configurations Added Successfully');
        },
        error: (err: any) => {
          this.isLoading = false;
          if (err.status === 404) {
            this.conformationPopup.openErrorModal('The requested resource was not found. Please check the URL or contact the administrator for assistance.');
          } else if (err.status === 500) {
            this.conformationPopup.openErrorModal(err.error.Message);
          } else {
            this.conformationPopup.openErrorModal(err.error.Message);
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-empty-function
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
