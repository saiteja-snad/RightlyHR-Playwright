import { CommonModule } from '@angular/common';
import { Component, Input, input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, NgForm, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { IReviewCycle, IDesignationNames } from '../add-assessor/add-assessor.modal';

@Component({
  selector: 'app-update-assessor',
  imports: [ CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Select,
    TranslateModule,],
  templateUrl: './update-assessor.component.html',
  styleUrl: './update-assessor.component.scss'
})
export class UpdateAssessorComponent implements OnInit,OnDestroy {
  empinfo = {} as any;
  subscription!: Subscription;
  updateassesorConfiguration = {} as any;
  Status: any;
  isLoading = false;
  myForm!: NgForm;
  deleteId: any;
  removeRowdata:any
  reviewCycledetailyById = {};
  reviewCycleDropDownData = [] as IReviewCycle[];
  reviewCycleData = [] as IDesignationNames[];
  assesorDetails = [] as any;
  currentDate: any;
  activeEmplist = [] as any;
  headerId: any;
  deletedRows: any[] = [];
  @ViewChild('deletesuccess') deletesuccess: any;
  @ViewChild('deleterowincrement') deleterowincrement: any;
  @Input() updateData:any
  constructor(
    private router: Router,
    private authService: AuthService,
    private conformationPopup: OpenModalService,
    private http: HttpService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    public rbac: RbacService
  ) {}
  ngOnInit(): void {
    console.log('assesor date',this.updateData);
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.editDetails(this.updateData);
    this.getReviewCycledata();
    this.getAllasessors();
    this.getAllActiveEmpList();
    const currentdate = moment();
    this.currentDate = this.formatDate(currentdate);
  }
    //function to edit the details
    editDetails(Values: any) {
      this.getAllActiveEmpList();
      this.headerId = Values.assessor.id;
      // Ensure Values.departmentNames is defined before using map
      const departmentNames = Values.departmentNames ? Values.departmentNames.map((dept: any) => dept.departmentName).join(', ') : '';
      const locationNames = Values.locationNames ? Values.locationNames.map((loc: any) => loc.locationName).join(', ') : '';
      const teamNames = Values.subDepartmentNames ? Values.subDepartmentNames.map((loc: any) => loc.subDepartmentName).join(', ') : '';
      const sublocationNames = Values.subLocationNames ? Values.subLocationNames.map((loc: any) => loc.subLocationName).join(', ') : '';
  
      // Populate the form with the selected values
      this.updateassesorConfiguration = {
        id: Values.id,
        reviewCycleId: Values.reviewCycleId,
        department: departmentNames,
        location: locationNames,
        team: teamNames,
        sublocation: sublocationNames
      };
  
      // Map assessorItems to ratingscaledetailsarray
      this.assesorDetails = Values.assessorItems ? Values.assessorItems.map((item: any) => {
        return {
          ...item,
          id: item.id,
          assessors: item.assessor,
          assessorempId: parseInt(item.assessorEmployeeIds),
          assessorEmpName: item.assessorEmpName,
          deadlineindays: item.dueDate.split('T')[0], // Extract date part,
          comments: item.isCommentsVisible,
          rating: item.isRatingVisible,
          view: item.isView
        };
  
      }) : [];
      console.log('Ratingscale Details:', this.assesorDetails);
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
          console.log(data);
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
              fullName: `${
                employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''
              }${employee.firstName} ${
                employee.middleName ? employee.middleName + ' ' : ''
              }${employee.lastName}`,
              
            };
          });
          console.log(this.activeEmplist);
        },
        error: (err: any) => {},
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
  closeModal() {
    this.modalService.dismissAll();
    this.updateassesorConfiguration = {}; // Reset the form
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
    console.log(id);
    this.deleteId = id;
    console.log(this.deleteId);
    this.modalService.open(content, { centered: true });
  }
  clearindexdata(index:any){
    if (this.assesorDetails && this.assesorDetails[index]) {
      // Clear the data for the specific index
      this.assesorDetails[index] = {
          assessors: null,
          deadlineindays: null,
          assessorempId: null,
          comments: false,
          rating: false,
          view: false
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
      assessorempId: null
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
    this.isLoading=true;
    const loggedinuser = this.authService.getToken();
    const currentDate = moment();
    if (this.updateassesorConfiguration) {
      const payload = {
        reviewCycleId: this.updateassesorConfiguration.reviewCycleId,
        isDeleted: false,
        createdBy: loggedinuser.employeeId,
        createdAt: currentDate?.toISOString(),
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
            aessorEmployeeIds: item.assessorempId?.toString()
          })),
          ...this.deletedRows.map((item: any) => ({
            id: item.id,
            assessor: item.assessors,
            dueDate: item.deadlineindays,
            isRatingVisible: item.rating,
            isCommentsVisible: item.comments,
            isView: item.view,
            isDeleted: true, // Ensure the isDeleted flag is set to true
            createdAt: currentDate.toISOString(),
            aessorEmployeeIds: item.assessorempId?.toString()
          }))
        ]
      };
      this.http.putData(`Assessor/UpdateReviewAssessorHeaderConfig/${this.headerId}`, payload).subscribe({
        next: (response: any) => {
          this.isLoading=false;
          console.log('API response:', response);
            this.modalService.dismissAll();
            this.conformationPopup.openSuccessModal('Assessor Configurations Updated Successfully')
        },
        error: (err: any) => {
          console.error('Error:', err);
          this.isLoading=false;
         this.conformationPopup.openErrorModal(err.error)
       
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
