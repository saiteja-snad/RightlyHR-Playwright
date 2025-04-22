import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TabsModule } from 'primeng/tabs';
@Component({
  selector: 'app-my-expenses-tab',
  imports: [CommonModule, RouterModule, TabsModule],
  templateUrl: './my-expenses-tab.component.html',
  styleUrl: './my-expenses-tab.component.scss'
})

export class MyExpensesTabComponent {
  navTabs: any[] = [
    { label: 'My Expenes', link: '/claimsandexpenses/expenses' },
  ];
}
