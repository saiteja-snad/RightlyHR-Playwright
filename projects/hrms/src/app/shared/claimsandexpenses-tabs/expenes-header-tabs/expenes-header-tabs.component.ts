import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {  RouterModule } from '@angular/router';

@Component({
  selector: 'app-expenes-header-tabs',
  imports: [CommonModule,RouterModule],
  templateUrl: './expenes-header-tabs.component.html',
  styleUrl: './expenes-header-tabs.component.scss'
})
export class ExpenesHeaderTabsComponent {

}
