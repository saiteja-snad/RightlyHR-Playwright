import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-claimsandexpenes-pending-approval-tabs',
  imports: [RouterModule,TabsModule,CommonModule],
  templateUrl: './claimsandexpenes-pending-approval-tabs.component.html',
  styleUrl: './claimsandexpenes-pending-approval-tabs.component.scss'
})
export class ClaimsandexpenesPendingApprovalTabsComponent {
  navTabs: any[] = [
    { label: 'For You ', link: 'for-you', count: 9 },
    { label: 'For Your Role', link: 'for-your-role', count: 9 },
   
  ];
}
