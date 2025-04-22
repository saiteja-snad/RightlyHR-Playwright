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
  selector: 'app-view-increment',
  imports: [CommonModule,
    ReactiveFormsModule,
    FormsModule,
    Select,
    TranslateModule,],
  templateUrl: './view-increment.component.html',
  styleUrl: './view-increment.component.scss'
})
export class ViewIncrementComponent implements OnInit,OnDestroy {
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
