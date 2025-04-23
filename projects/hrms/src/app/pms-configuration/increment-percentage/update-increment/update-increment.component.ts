import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, NgForm, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { Select } from 'primeng/select';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../services/auth.service';
import { HttpService } from '../../../services/http.service';
import { OpenModalService } from '../../../services/open-modal.service';
import { RbacService } from '../../../services/rbac.service';
import { IReviewCycle, RatingDetail } from '../add-increment/increment.modal';

@Component({
  selector: 'app-update-increment',
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Select,
    TranslateModule,],
  templateUrl: './update-increment.component.html',
  styleUrl: './update-increment.component.scss'
})
export class UpdateIncrementComponent implements OnInit,OnDestroy{
  empinfo = {} as any;
  subscription!: Subscription;
  ratingrangeloop: number[] = [];
  UpdateIncrementalpercentage = {} as any;
  deletedRows: any[] = [];
  ratingscaledetailsarray = [] as any;
  Status:any;
  isLoading=false;
  myForm!: NgForm;
  deleteId: any;
  removerow: any;
  reviewCycledetailyById = {};
  reviewCycleDropDownData = [] as IReviewCycle[];
  @ViewChild('deletesuccess') deletesuccess: any;
  @ViewChild('deleterowincrement') deleterowincrement: any;
  @Input() updateData: any;
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
    console.log('Received data:', this.updateData);
    this.editDetails(this.updateData);
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getReviewCycledata();
  }
  editDetails(Values: any) {
    console.log(Values);
    // Populate the form with the selected values
    this.UpdateIncrementalpercentage = {
      id: Values.id,
      reviewCycleId: Values.reviewCycleId,
      department: Values.deptName.map((dept: any) => dept.departmentName).join(', '),
      location: Values.locationName.map((loc: any) => loc.locationName).join(', '),
      team: Values.subdeptName.map((loc: any) => loc.subDepartmentName).join(', '),
      sublocation: Values.sublocationName.map((loc: any) => loc.subLocationName).join(', '),
      ratingscale: Values.rating
    };

    // Populate the rating range loop
    if (this.UpdateIncrementalpercentage.ratingscale) {
      const ratingscale = this.UpdateIncrementalpercentage.ratingscale;
      const [start, end] = ratingscale.split(' to ').map(Number);
      this.ratingrangeloop = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    }

    // Map itemsdata to ratingscaledetailsarray
    this.ratingscaledetailsarray = Values?.itemsdata.map((item: any) => {
      console.log('Item:', item);
      return {
        id: item.id, // Include the id of the item
        min: item.min, // Correctly reference min value
        max: item.max, // Correctly reference max value
        ratingDetails: item.items.map((detail: any) => ({
          id: detail.id,
          percentage: detail.percentage,
          ratingColumn: detail.ratingColumn // Correctly reference ratingColumn
        }))
      };

    });
    console.log('Updated ratingscaledetailsarray:', this.ratingscaledetailsarray);
  }
    // Function to get all review cycle data
    getReviewCycledata() {
      this.subscription = this.http.getData(`reviewCycleHeader`).subscribe({
        next: (data: any) => {
          console.log('Review Cycle Data:', data);
          this.reviewCycleDropDownData = data.items as IReviewCycle[];
        },
        error: (err: any) => {
          console.error('Error fetching review cycle data:', err);
        },
      });
    }
  openModal(content: any) {
    this.modalService.open(content, { centered: true })
  }
  close() {
    this.modalService.dismissAll();
  }
  closeModal() {
    this.modalService.dismissAll();
    this.UpdateIncrementalpercentage = {}; // Reset the form
    this.ratingrangeloop = [];
    this.ratingscaledetailsarray = [];
  }
    //function to open the model popup
    openconfirmationModel(content: any) {
      this.modalService.open(content, { centered: true });
    }
    //function to open the model popup
    openconfirmationModelforcancle(content: any, form: any) {
      this.myForm = form
      this.modalService.open(content, { centered: true });
    }
    //function to delete
    openDeletepopup(content: any, id: any) {
      console.log(id)
      this.deleteId = id
      console.log(this.deleteId)
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
  
      console.log('Updated ratingscaledetailsarray:', this.ratingscaledetailsarray);
    }
    // Delete Row from FormArray
    deleteRow(index: number): void {
  
      if (this.ratingscaledetailsarray[index]) {
        const deletedRow = { ...this.ratingscaledetailsarray[index], isDeleted: true };
        this.deletedRows.push(deletedRow);
        this.ratingscaledetailsarray.splice(index, 1);
       
      }
      this.conformationPopup.openSuccessModal('Row Deleted Successfully')
      this.deleterow();
    }
    deleterow(){
      // this.modalRef = this.modalService.open(this.loading, { centered: true });
      const loggedinuser = this.authService.getToken();
      const currentDate = new Date();
      if (this.UpdateIncrementalpercentage) {
        const payload = {
          id: this.UpdateIncrementalpercentage.id, // Include the id from Values
          reviewCycleId: this.UpdateIncrementalpercentage.reviewCycleId,
          rating: this.UpdateIncrementalpercentage.ratingscale,
          isDeleted: false,
          createdBy: loggedinuser.employeeId,
          createdAt: currentDate,
          itemslist: [
            ...this.deletedRows.flatMap((row: any) =>
              row.ratingDetails.map((detail: any) => ({
                id: detail.id,
                percentageheaderconfigId: this.UpdateIncrementalpercentage.id, // Include the id of the item
                ratingId: detail.id, // Assuming ratingId is the same as detail.id
                ratingColumn: JSON.stringify(detail.ratingcolumns?? parseInt(detail.ratingColumn) ), // Correctly reference ratingColumn
                min: row.min, // Correctly reference min value
                max: row.max, // Correctly reference max value
                percentage: detail.percentage,
                createdAt: currentDate,
                isDeleted: true // Include the isDeleted flag
              }))
            ),
          ]
        };
        console.log('Final Payload:', payload);
        this.http.postdata(`IncrementalPercentage/update`, payload).subscribe({
          next: (response: any) => {
          },
          error: (err: any) => {
          
            console.log(err)
          },
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          complete: () => {
            //
          },
        })
      }
    }
      // Handle form submission
      updateincermement() {
        this.isLoading=true;
        // this.modalRef = this.modalService.open(this.loading, { centered: true });
        const loggedinuser = this.authService.getToken();
        const currentDate = new Date();
        if (this.UpdateIncrementalpercentage) {
          const payload = {
            id: this.UpdateIncrementalpercentage.id, // Include the id from Values
            reviewCycleId: this.UpdateIncrementalpercentage.reviewCycleId,
            rating: this.UpdateIncrementalpercentage.ratingscale,
            isDeleted: false,
            createdBy: loggedinuser.employeeId,
            createdAt: currentDate,
            itemslist: [
              ...this.ratingscaledetailsarray.flatMap((row: any) =>
                row.ratingDetails.map((detail: any) => ({
                  id: detail.id,
                  percentageheaderconfigId: this.UpdateIncrementalpercentage.id, // Include the id of the item
                  ratingId: detail.id, // Assuming ratingId is the same as detail.id
                  ratingColumn: JSON.stringify(detail.ratingcolumns?? parseInt(detail.ratingColumn) ), // Correctly reference ratingColumn
                  min: row.min, // Correctly reference min value
                  max: row.max, // Correctly reference max value
                  percentage: detail.percentage,
                  createdAt: currentDate,
                  isDeleted: row.isDeleted || false // Include the isDeleted flag
                }))
              )
            ]
          };
          console.log('Final Payload:', payload);
          this.http.postdata(`IncrementalPercentage/update`, payload).subscribe({
            next: (response: any) => {
              //console.log(response
              this.modalService.dismissAll();
              this.conformationPopup.openSuccessModal('Incremental Percentage Updated Successfully')
              
              
            },
            error: (err: any) => {
              this.isLoading=false;
              console.log(err)
              if (err.status === 404) {
                this.conformationPopup.openErrorModal('The requested resource was not found. Please check the URL or contact the administrator for assistance.');
              } else if (err.status === 500) {
                this.conformationPopup.openErrorModal(err.error.details);
               
              } else {
                this.conformationPopup.openErrorModal(err.error.message)
              }
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            complete: () => {
              this.isLoading=false;
          this.http.tirggerCountSignal.update((status) => ({
            ...status,
            global: true,
          }));
            },
          })
        }
      }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
