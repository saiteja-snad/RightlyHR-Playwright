import { Component } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { HttpService } from '../../../services/http.service';
import { RbacService } from '../../../services/rbac.service';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-client-documents-tabs',
  imports: [TabsModule,RouterModule,CommonModule],
  templateUrl: './client-documents-tabs.component.html',
  styleUrl: './client-documents-tabs.component.scss'
})
export class ClientDocumentsTabsComponent {
 filteredTabs: any[] = [];
   statusCounts: any = {};
   projectId: any
   destroy$: Subject<boolean> = new Subject<boolean>();
   navTabs: any[] = [
     {
       label: 'Active', link: '/project-management/clients/details/documents', icon: '/my-info-icons/contact-icon.png', statusKey: 'active',
       permission: { feature: 'Client Documents', action: 'view' }
     },
     {
       label: 'Archived ', link: '/project-management/clients/details/inactivedocuments', icon: 'main-menu-icons/project-management-project.png', statusKey: 'inactive',
       permission: { feature: 'Client Documents', action: 'view' },
     },
    
   ];
 
   constructor(public rbac: RbacService, private router: Router, private http: HttpService, private route: ActivatedRoute,) { }
 
   ngOnInit(): void {
     this.route.queryParams.subscribe(params => {
       const projectId = params['id'];
       if (projectId) {
         this.projectId = parseInt(projectId);
         this.getcountData(this.projectId)
       }
     });
     this.filterTabsByRbac();
     this.http.projectcountdocuments$.subscribe(() => {
       this.getcountData(this.projectId);
     });
   }
 
   filterTabsByRbac(): void {
     this.filteredTabs = this.navTabs.filter(tab => {
       if (!tab.permission) return true;
       const { feature, action } = tab.permission;
       const permissionString = `${feature}.${action}`;
       return this.rbac.allowedToAccess(permissionString);
     });
   }
  statusGroups: any = {
     active: [ 'active'],
     inactive: ['inactive'],
    
   };
 
 getcountData(projectId: any): void {
    const statuses = 'inactive,active';
   this.http.getData(`StatusCount?moduleName=clientdocuments&entityId=${projectId}&statuses=${statuses}`)
     .pipe(takeUntil(this.destroy$))
     .subscribe({
       next: (res: any) => {
         this.statusCounts = {};
         const rawCounts: any = {};
 
         // Step 1: Store all raw counts from API
         res?.data?.forEach((item: any) => {
           rawCounts[item.status.toLowerCase()] = item.count || 0;
         });
 
         // Step 2: Aggregate based on groups
         Object.keys(this.statusGroups).forEach(groupKey => {
           const statuses = this.statusGroups[groupKey];
           let total = 0;
           statuses.forEach((status: string | number) => {
             total += rawCounts[status] || 0; // Add 0 if missing
           });
           this.statusCounts[groupKey] = total;
         });
       },
       error: (err) => {
         console.error('Error fetching phase status count', err);
       }
     });
 }
   isActive(route: string): boolean {
     return this.router.url.includes(route);
   }
}

