import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit} from '@angular/core';
import { ReactiveFormsModule, FormsModule, NgForm, FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { IReviewCycle, IDesignationNames } from '../add-assessor/add-assessor.modal';

@Component({
  selector: 'app-view-assessor',
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Select,
    TranslateModule,],
  templateUrl: './view-assessor.component.html',
  styleUrl: './view-assessor.component.scss'
})
export class ViewAssessorComponent implements OnInit,OnDestroy {
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
  @Input() updateData:any
  constructor(
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
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
