import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-myinfo-header-tabs',
  imports: [RouterModule,CommonModule],
  templateUrl: './myinfo-header-tabs.component.html',
  styleUrl: './myinfo-header-tabs.component.scss'
})
export class MyinfoHeaderTabsComponent {

}
