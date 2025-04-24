import { CommonModule } from '@angular/common';
import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgbPopoverModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DropdownModule } from 'primeng/dropdown';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { UpdateAssessorComponent } from './update-assessor/update-assessor.component';
import { ViewAssessorComponent } from './view-assessor/view-assessor.component';
import { AddAssessorComponent } from './add-assessor/add-assessor.component';
import { DataLoaderContentComponent } from "../../shared/data-loader-content/data-loader-content.component";
@Component({
  selector: 'app-assessor-configuration',
  imports: [CommonModule, RouterModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule, NoDataFoundComponent, DataLoaderContentComponent],
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

  constructor(private http: HttpService, private modalService: NgbModal, 
    private conformationPopup: OpenModalService, public rbac: RbacService ) {
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
  }

  openAdd() {
    this.modalService.open(AddAssessorComponent, {centered: true, backdrop: 'static', size: 'xl'});
  }

  openDelete(content: any, data: any) {
    this.deleteId = data.assessor.id;
    this.modalService.open(content, { backdrop: 'static', centered: true });
  }

  editDetails(data: any) {
    const modalRef = this.modalService.open(UpdateAssessorComponent, {centered: true, backdrop: 'static', size: 'xl'});
    modalRef.componentInstance.updateData = data;
  }

  viewDetails(data: any) {
    const modalRef = this.modalService.open(ViewAssessorComponent, {centered: true, backdrop: 'static', size: 'xl',});
    modalRef.componentInstance.updateData = data;
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
        console.log('errors', err);
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

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
