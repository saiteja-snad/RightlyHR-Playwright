import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { Subscription } from 'rxjs';
import { IReviewCycle, RatingDetail } from './increment.modal';
@Component({
  selector: 'app-add-increment',
  imports: [CommonModule, FormsModule, Select, TranslateModule],
  templateUrl: './add-increment.component.html',
  styleUrl: './add-increment.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class AddIncrementComponent implements OnInit, OnDestroy {
  empinfo = {} as any;
  subscription!: Subscription;
  ratingrangeloop: number[] = [];
  postincrementalpercentage = {} as any;
  ratingscaledetailsarray = [] as any;
  Status: any;
  isLoading = false;
  myForm!: NgForm;
  deleteId: any;
  removerow: any;
  reviewCycledetailyById = {};
  reviewCycleDropDownData = [] as IReviewCycle[];
  @ViewChild('deletesuccess') deletesuccess: any;
  @ViewChild('deleterowincrement') deleterowincrement: any;

  constructor(private authService: AuthService, private conformationPopup: OpenModalService,
    private http: HttpService, private modalService: NgbModal, public rbac: RbacService) { }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getReviewCycledata();
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
    if (this.postincrementalpercentage.id) {
      id = this.postincrementalpercentage.id;
    }
    this.subscription = this.http.getData(`reviewCycleHeader/${id}`).subscribe({
      next: (data: any) => {
        this.reviewCycledetailyById = data;
        // Patch the form fields
        if (this.postincrementalpercentage) {
          (this.postincrementalpercentage.department = data[0]?.departments?.map((loc: any) => loc?.departmentName).join(', ')),
          (this.postincrementalpercentage.ratingId = data.id),
          (this.postincrementalpercentage.location = data[0]?.locations?.map((loc: any) => loc?.locationName).join(', ')),
          (this.postincrementalpercentage.sublocation = data[0]?.sublocations?.map((loc: any) => loc?.subLocationName).join(', ')),
          (this.postincrementalpercentage.team = data[0]?.subdepartments?.map((loc: any) => loc?.subDepartmentName).join(', ')),
          (this.postincrementalpercentage.ratingscale = `${data[0]?.minimumRatingScale ?? '' } to ${data[0]?.maximumRatingScale ?? ''}`);
        }
        // Generate dynamic rating rows
        this.getdetailsrelatedtoreviewcycle(
          data[0].minimumRatingScale,
          data[0].maximumRatingScale
        );
      },
      error: (err: any) => {
        this.ratingrangeloop = [];
        this.ratingscaledetailsarray = [];
        this.postincrementalpercentage = {};
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
    this.postincrementalpercentage = {}; // Reset the form
    this.ratingrangeloop = [];
    this.ratingscaledetailsarray = [];
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

  validateNumber(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const numericValue = inputElement.value.replace(/[^0-9]/g, ''); // Allow only numeric characters
    inputElement.value = numericValue;
  }

  //function to add the columns based on max and min values
  getdetailsrelatedtoreviewcycle(start: any, end: any) {
    // Clear the previous range before adding new values
    this.ratingrangeloop = [];
    this.ratingscaledetailsarray = [];
    const range = [];
    for (let i = start; i <= end; i++) {
      range.push(i);
    }
    this.ratingrangeloop = range;
    // Add initial rows dynamically
    if (this.ratingrangeloop.length > 0) {
      this.addRow();
    }
  }

  // Add Row to FormArray
  addRow() {
    // Create a new row with empty values for minvalue, maxvalue, and ratingDetails
    const newRow = {
      minvalue: null,
      maxvalue: null,
      ratingDetails: [] as RatingDetail[],
    };
    // Populate the ratingDetails based on the existing ratingrangeloop
    this.ratingrangeloop.forEach((columnValue) => {
      newRow.ratingDetails.push({
        percentage: null,
        ratingcolumns: columnValue, // Use the current rating column values
      });
    });
    // Push the new row into the existing array reference
    this.ratingscaledetailsarray.push(newRow);
  }

  // Delete Row from FormArray
  deleteRow(index: number): void {
    // Remove the row at the specified index
    this.ratingscaledetailsarray.splice(index, 1);
    this.conformationPopup.openSuccessModal('Row Deleted Successfully');
  }

  // Handle form submission
  onSubmit() {
    this.isLoading = true;
    const loggedinuser = this.authService.getToken();
    const currentDate = new Date();
    if (this.postincrementalpercentage) {
      const payload = {
        reviewCycleId: this.postincrementalpercentage.id,
        rating: this.postincrementalpercentage.ratingscale,
        isDeleted: false,
        createdBy: loggedinuser.employeeId,
        createdAt: currentDate,
        itemslist: this.ratingscaledetailsarray.flatMap((row: any) =>
          row.ratingDetails.map((detail: any) => ({
            min: row.minvalue,
            max: row.maxvalue,
            ratingColumn: JSON.stringify(detail.ratingcolumns),
            percentage: detail.percentage,
            createdAt: currentDate,
            isDeleted: false,
          }))
        ),
      };
      this.http.postdata(`IncrementalPercentage`, payload).subscribe({
        next: (response: any) => {
          this.modalService.dismissAll();
          this.conformationPopup.openSuccessModal(
            'Increment Percentage Configurations Added Successfully'
          );
        },
        error: (err: any) => {
          this.isLoading = false;
          console.log(err);
          if (err.status === 404) {
            this.conformationPopup.openErrorModal(
              'The requested resource was not found. Please check the URL or contact the administrator for assistance.'
            );
          } else if (err.status === 500) {
            this.conformationPopup.openErrorModal(err.error.details);
          } else {
            this.conformationPopup.openErrorModal(err.error.message);
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