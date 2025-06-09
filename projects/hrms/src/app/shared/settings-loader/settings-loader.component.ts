import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-settings-loader',
  imports: [CommonModule,Skeleton],
  templateUrl: './settings-loader.component.html',
  styleUrl: './settings-loader.component.scss'
})
export class SettingsLoaderComponent {

}
