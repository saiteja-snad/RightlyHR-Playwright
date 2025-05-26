import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-pms-layout',
  imports: [CommonModule,RouterModule],
  templateUrl: './pms-layout.component.html',
  styleUrl: './pms-layout.component.scss',
  encapsulation:ViewEncapsulation.None
})

export class PmsLayoutComponent {

}
