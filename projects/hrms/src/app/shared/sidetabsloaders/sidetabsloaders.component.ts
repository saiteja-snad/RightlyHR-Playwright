import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-sidetabsloaders',
  standalone: true,
  imports: [CommonModule,Skeleton],
  templateUrl: './sidetabsloaders.component.html',
  styleUrl: './sidetabsloaders.component.scss'
})
export class SidetabsloadersComponent {

}
