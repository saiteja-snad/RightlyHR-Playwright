import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Select } from 'primeng/select';
import { RbacService } from '../../services/rbac.service';
import { HttpService } from '../../services/http.service';
import { filter, Subscription } from 'rxjs';
import { TreeNode } from 'primeng/api'
import { OrganizationChartModule } from 'primeng/organizationchart';
import { FormsModule } from '@angular/forms';
import { NoDataFoundComponent } from "../../shared/no-data-found/no-data-found.component";
import { DomSanitizer } from '@angular/platform-browser';
import { ModuleInformationComponent } from "../../shared/module-information/module-information.component";
import { NavigationEnd, Router } from '@angular/router';
import { MODULE_INFOS } from '../../shared/modules-info';
import { TranslateModule } from '@ngx-translate/core';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { Skeleton } from 'primeng/skeleton';

import { OrgchartService } from './../../services/orgchartservices/orgchart.service';
import { OrgChartGridComponent } from './org-chart-grid/org-chart-grid.component';
import { ModuleInfoIconComponent } from '../../icons/module-info-icon/module-info-icon.component';

@Component({
  selector: 'app-organizationchart',
  imports: [CommonModule, Select, FormsModule, OrganizationChartModule, NgbPopoverModule, NoDataFoundComponent, TranslateModule,
    ModuleInformationComponent, Skeleton, ModuleInformationComponent, OrgChartGridComponent,ModuleInfoIconComponent],
  templateUrl: './organizationchart.component.html',
  styleUrl: './organizationchart.component.scss',
  encapsulation: ViewEncapsulation.None,
})

export class OrganizationchartComponent implements OnInit, OnDestroy {
  moduleinfo: string = '';
  data: TreeNode[] = [];
  subscription!: Subscription;
  activeEmplist = [] as any;
  selectedEmployeeId: number | null = null;
  employeedata: any;
  compensationyesorno = false;
  compensationOptions = [
    { label: 'Yes', value: true },
    { label: 'No', value: false }
  ];
  dataload = false;
  isDataPresent = false;

  constructor(private http: HttpService, private sanitizer: DomSanitizer, public rbac: RbacService,
    public readonly router: Router, private OrgchartService: OrgchartService) { }

  ngOnInit(): void {
    this.employeedata = JSON.parse(localStorage.getItem('rightlyHrUser') || '{}');
    this.getAllEmployeeDetails()
    this.getAllEmployeeDetailsformanger();
    if (this.selectedEmployeeId === null) {
      this.getOrghierarchy(this.employeedata.employeeId)
    }
    this.updateModuleInfo();
    this.initiateUpdateModuleInfo();
  }

  initiateUpdateModuleInfo() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(() => {
      this.updateModuleInfo();
    });
  }

  updateModuleInfo() {
    const url = this.router.url;
    const routeToInfoMap: { [key: string]: string } = {
      '/organization-chart': MODULE_INFOS.ORGANIZATIONAL_HIERARCHY_MODULE_INFO
    };
    const matchedEntry = Object.entries(routeToInfoMap).find(([route]) => url.includes(route));
    this.moduleinfo = matchedEntry ? matchedEntry[1] : '';
  }

  // Org Feature Functions
  compact() {
    this.OrgchartService.triggerAction('toggleCompact');
  }
  
  swap() {
    this.OrgchartService.triggerAction('swapLayout');
  }

  exportImg() {
    this.OrgchartService.triggerAction('exportImg');
  }

  exportFullImg() {
    this.OrgchartService.triggerAction('exportFullImg');
  }

  exportSvg() {
    this.OrgchartService.triggerAction('exportSvg');
  }

  expandAll() {
    this.OrgchartService.triggerAction('expandAll');
  }

  collapseAll() {
    this.OrgchartService.triggerAction('collapseAll');
  }

  downloadPdf() {
    this.OrgchartService.triggerAction('downloadPdf');
  }
  
  onCompensationChange(value: boolean) {
  this.OrgchartService.setCompensationAmount(value);
}

  // function to get the data of employees by hierarchy
getAllEmployeeDetails() {
  const status = ['Active', 'Trainee Active'];
  this.subscription = this.http.getData(`Employeedata/v3/Getallemployees?statuses=${status}`).subscribe({
    next: (res: any) => {
      this.activeEmplist = res
        .map((employee: any) => ({
          label: `${employee.fusionEmpId ?? ''} - ${employee.firstName ?? ''} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName ?? ''}`.trim(),
          value: employee.employeeId
        }))
        .sort((a: any, b: any) => {
          const idA = parseInt((a.label.split('-')[0] ?? '').replace(/\D/g, ''), 10) || 0;
          const idB = parseInt((b.label.split('-')[0] ?? '').replace(/\D/g, ''), 10) || 0;
          return idA - idB;
        });
    }
  });
}


mangeractiveEmplist: any[] = [];

getAllEmployeeDetailsformanger() {
  const EmployeeId = this.employeedata.employeeId;
  this.subscription = this.http.getData(`Employeedata/getEmployeesByhierarchy/${EmployeeId}`).subscribe({
    next: (res: any) => {
      this.mangeractiveEmplist = res
        .map((employee: any) => ({
          ...employee,
          fullName: `${employee.fusionEmpId ? employee.fusionEmpId + ' - ' : ''}${employee.firstName ?? ''} ${employee.middleName ? employee.middleName + ' ' : ''}${employee.lastName ?? ''}`.trim(),
          employeeid: employee.employeeId
        }))
        .sort((a: any, b: any) => {
          const idA = parseInt((a.fusionEmpId ?? '').replace(/\D/g, ''), 10) || 0;
          const idB = parseInt((b.fusionEmpId ?? '').replace(/\D/g, ''), 10) || 0;
          return idA - idB;
        });
    }
  });
}


  onEmployeeChange(event: any) {
    this.selectedEmployeeId = event.value.value;
    this.getOrghierarchy(this.selectedEmployeeId)
  }

  private flattenTree(node: any, parentId: number | null = null, flat: any[] = []): any[] {
    const n = node.data || node;
    flat.push({
      id: n.employeeId,
      parentId: parentId,
      name: n.name,
      title: n.title,
      department: n.department,
      doj: n.doj,
      Compensation: n.compensationamount || 0,
      image: n.image || '',
      imageUrl: n.imageUrl || '', // default initially
    });
    const children = n.children || [];
    for (const child of children) {
      this.flattenTree(child, n.employeeId, flat);
    }
    return flat;
  }

  getOrghierarchy(employeeId?: any) {
    this.dataload = true;
    if (!employeeId) {
      employeeId = this.employeedata.employeeId;
    }
    this.subscription = this.http.getData(`Employeedata/getOrganizationalhierarchybyid/${employeeId}`).subscribe({
      next: (response: any) => {
        this.dataload = false;
        if (Array.isArray(response) && response.length > 0) {
          const rawTree = response[0]; // response is an array with one root object
          const flatData = this.flattenTree(rawTree); // convert nested to flat
          this.data = flatData;
          this.isDataPresent = false;
        } else {
          this.data = [];
          this.isDataPresent = true;
          this.dataload = false;
        }
      },
      error: () => {
        this.dataload = false;
      },
      complete: () => {
        this.dataload = false;
      }
    });
  }
  processEmployeeNode(node: any): void {
    // Handle different node structures
    const employeeData = node.data ? node.data : node;

    // Fetch image for current node
    // if (employeeData.image) {
    //   this.onSelectprofilePicDownload(employeeData.image).subscribe((imageUrl: string) => {
    //     employeeData.imageUrl = imageUrl;
    //   });
    // }

    // Process children - handle both node.children and nested node.data.children
    const children = node.children || (node.data && node.data.children);

    if (children && children.length > 0) {
      children.forEach((child: any) => {
        // For children, we need to process the child.data object
        if (child.data) {
          this.processEmployeeNode(child);
        } else {
          // Handle case where child might not have data wrapper
          this.processEmployeeNode({ data: child });
        }
      });
    }
  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}