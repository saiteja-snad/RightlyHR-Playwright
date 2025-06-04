import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LettersInfoComponent } from "../../shared/letters-shared-content/letters-info/letters-info.component";
@Component({
  selector: 'app-letters-layout',
  imports: [CommonModule, RouterOutlet, LettersInfoComponent],
  templateUrl: './letters-layout.component.html',
  styleUrl: './letters-layout.component.scss'
})

export class LettersLayoutComponent {

}
