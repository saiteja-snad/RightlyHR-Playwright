import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-letters-layout',
  imports: [CommonModule,RouterOutlet],
  templateUrl: './letters-layout.component.html',
  styleUrl: './letters-layout.component.scss'
})
export class LettersLayoutComponent {

}
