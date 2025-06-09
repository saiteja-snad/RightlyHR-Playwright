import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-data-loader-content',
  imports: [CommonModule,Skeleton],
  templateUrl: './data-loader-content.component.html',
  styleUrl: './data-loader-content.component.scss'
})
export class DataLoaderContentComponent {

}
