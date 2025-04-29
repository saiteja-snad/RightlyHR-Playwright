import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RbacService } from '../../../services/rbac.service';

@Component({
  selector: 'app-leave-category-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './leave-category-tabs.component.html',
  styleUrl: './leave-category-tabs.component.scss'
})

export class LeaveCategoryTabsComponent {
  public navLinks: any[] = [];

  constructor(public rbac: RbacService) { }

  allNavLinks = [
    { label: 'Pending', route: '/settings/timeoff-configurations/leave-categoery/pendingleavecategory', },
    { label: 'Published', route: '/settings/timeoff-configurations/leave-categoery/publishedleavecategory'},
  ];
}
