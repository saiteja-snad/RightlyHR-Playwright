import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';

@Component({
  selector: 'app-desk-request-tabs',
  imports: [TabsModule,RouterModule,CommonModule],
  templateUrl: './desk-request-tabs.component.html',
  styleUrl: './desk-request-tabs.component.scss'
})
export class DeskRequestTabsComponent {
  navTabs=[
    { label: 'For You ', link: 'for-you', },
      { label: 'For Your Role', link: 'for-your-role'}
  ]
}
