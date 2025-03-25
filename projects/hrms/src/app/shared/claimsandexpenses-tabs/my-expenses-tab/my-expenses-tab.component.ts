import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-my-expenses-tab',
  imports: [CommonModule,RouterModule],
  templateUrl: './my-expenses-tab.component.html',
  styleUrl: './my-expenses-tab.component.scss'
})
export class MyExpensesTabComponent {

}
