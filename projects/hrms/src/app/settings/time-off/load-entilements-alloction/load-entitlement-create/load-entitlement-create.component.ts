import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-load-entitlement-create',
  imports: [CommonModule],
  templateUrl: './load-entitlement-create.component.html',
  styleUrl: './load-entitlement-create.component.scss'
})
export class LoadEntitlementCreateComponent {
  navTabs: any[] = [
    { label: '2023',  },
    { label: '2024', },
    { label: '2025', },

  ];
}
