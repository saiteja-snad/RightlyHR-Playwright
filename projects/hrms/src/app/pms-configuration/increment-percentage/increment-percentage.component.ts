import { Component, effect, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { filter, Subscription } from 'rxjs';
import { HttpService } from '../../services/http.service';
import { OpenModalService } from '../../services/open-modal.service';
import { RbacService } from '../../services/rbac.service';
import { AddIncrementComponent } from './add-increment/add-increment.component';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { NoDataFoundComponent } from '../../shared/no-data-found/no-data-found.component';
import { UpdateIncrementComponent } from './update-increment/update-increment.component';
import { ViewIncrementComponent } from './view-increment/view-increment.component';
import { DataLoaderContentComponent } from '../../shared/data-loader-content/data-loader-content.component';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { MODULE_INFOS } from '../../shared/modules-info';
import { SettingsHeaderComponent } from "../../shared/settings-tabs/settings-header/settings-header.component";
@Component({
  selector: 'app-increment-percentage',
  imports: [CommonModule, RouterModule, NgbPopoverModule, FormsModule, PaginatorModule, DropdownModule,
    NoDataFoundComponent, DataLoaderContentComponent, ModuleInformationComponent, SettingsHeaderComponent],
  templateUrl: './increment-percentage.component.html',
  styleUrl: './increment-percentage.component.scss',
})

export class IncrementPercentageComponent implements OnInit, OnDestroy {
  moduleinfo : string = '';
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
searchQuery = '';
  page = 1;
  pageSize = 10;
  rows = 10;
  collectionSize!: number;
  first = 0;
  totalRecords = 0;
  searchText = '';
  
  IncementalDetailsget: any[] = [];

  constructor(private http: HttpService, private modalService: NgbModal, private conformationPopup: OpenModalService, public rbac: RbacService, public readonly router: Router) {
    effect(() => {
      if (this.http.tirggerCountSignal().global) {
        this.getAllIncrementalPercentagedata(this.page, this.pageSize);
        this.http.tirggerCountSignal.update((status) => ({
          ...status,
          global: false,
        }));
      }
    });
  }

  ngOnInit(): void {
    this.empinfo = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllIncrementalPercentagedata(this.page, this.pageSize);
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo(){
    this.router.events
    .pipe(filter(event => event instanceof NavigationEnd))
    .subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
  
    const routeToInfoMap: { [key: string]: string } = {
      '/pmsconfiguration/increment': MODULE_INFOS.PMS_CONFIGURATION_INCREMENT_PERCENTAGE_MODULE_INFO
    };
  
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  openAdd() {
    this.modalService.open(AddIncrementComponent, {centered: true, backdrop: 'static', size: 'xl'});
  }

  openDelete(content: any, id: any) {
    this.deleteId = id;
    this.modalService.open(content, { centered: true });
  }

  editDetails(data: any) {
    const modalRef = this.modalService.open(UpdateIncrementComponent, {centered: true, backdrop: 'static', size: 'xl'});
    modalRef.componentInstance.updateData = data;
  }

  viewDetails(data: any) {
    const modalRef = this.modalService.open(ViewIncrementComponent, {centered: true, backdrop: 'static', size: 'xl'});
    modalRef.componentInstance.updateData = data;
  }

  openHoldMsg(){
    this.conformationPopup.openErrorModal('Review Cycle kept on hold');
  }

  onSearchTextChange(): void {
    this.page = 1;        
    this.first = 0; 
    this.getAllIncrementalPercentagedata(this.page, this.pageSize);
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.pageSize = event.rows;
    this.first = event.first;
    this.getAllIncrementalPercentagedata(this.page, this.pageSize);
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize = newPageSize;
    this.rows = newPageSize; 
    this.page = 1;
    this.first = 0;
    this.getAllIncrementalPercentagedata(this.page, this.pageSize);
  }

  //function to get the globalpermissions details
  getAllIncrementalPercentagedata(pagenum: number, pagesize: number): void {
    const params: { pageNumber: number; pageSize: number; searchparam?: string } = {
      pageNumber: pagenum,
      pageSize: pagesize,
    };
    
    if (this.searchText) {
      params.searchparam = this.searchText;
    }

    this.dataload = true;
    this.subscription = this.http.getpagentiontData(`IncrementalPercentage`, params).subscribe({
      next: (response: any) => {
        this.IncementalDetailsget = response?.items;
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
      case 'departments':
        return array.map((item: any) => item.departmentName).join(', ');
      case 'subDepartmentName':
        return array.map((item: any) => item.subDepartmentName).join(', ');
      default:
        return '';
    }
  }

  //function to inactivate the incremental persentage
  deleteData() {
    const payLoad = {};
    this.http.postdata(`IncrementalPercentage/delete?id=${this.deleteId}`, payLoad).subscribe({
      next: (response: any) => {
        this.conformationPopup.openSuccessModal('Incremental Percentage Deleted Sucessfully');
        this.getAllIncrementalPercentagedata(this.page, this.pageSize);
      },
      error: (err: any) => {
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
        this.getAllIncrementalPercentagedata(this.page, this.pageSize);
      },
    });
  }

  showIncrementActionDropdown(item: any): boolean {
    return (
      (this.rbac.allowedToAccess('Increment Update(Status - Created).view') &&
        (item?.reviewCycleStatus === 'Created' || item?.reviewCycleStatus === 'Initiated')) ||
      (this.rbac.allowedToAccess('Increment Delete(Status - Created).view') &&
        item?.reviewCycleStatus === 'Created') ||
      (this.rbac.allowedToAccess('Increment View(Status - Initiated).view') &&
        item?.reviewCycleStatus === 'Initiated') ||
      (this.rbac.allowedToAccess('Increment Update(Status - Review On Hold).view') &&
        item?.reviewCycleStatus === 'Review on Hold')
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}