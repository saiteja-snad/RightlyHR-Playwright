import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
import { SidetabsloadersComponent } from "../../sidetabsloaders/sidetabsloaders.component";

@Component({
  selector: 'app-onbehalfoff-approvals-tabs',
  imports: [RouterModule, CommonModule, TabsModule, SidetabsloadersComponent],
  templateUrl: './onbehalfoff-approvals-tabs.component.html',
  styleUrl: './onbehalfoff-approvals-tabs.component.scss'
})


export class OnbehalfoffApprovalsTabsComponent {
  loading=false
  navTabs:any=[]
ngOnInit(){
  this.loading=true
    this.navTabs = [
    { label: 'Time Off', link: '/time-off/on-behalf-of-approvals/time-off',permission: { feature: 'Time Off (On Behalf Of Approvals)', action: 'view' } },
    { label: 'Comp Off Entitlement', link: '/time-off/on-behalf-of-approvals/entitlement',permission: { feature: 'Comp Off (On Behalf Of Approvals)', action: 'view' } },
    { label: 'WFH', link: '/time-off/on-behalf-of-approvals/wfh',permission: { feature: 'WFH (On Behalf Of Approvals)', action: 'view' } },
    { label: 'Permissions', link: '/time-off/on-behalf-of-approvals/permissions',permission: { feature: 'Permission (On Behalf Of Approvals)', action: 'view' } },
  ];
   this.loading = false;
}

}
