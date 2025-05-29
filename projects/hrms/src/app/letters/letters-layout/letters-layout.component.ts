import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LettersTabComponent } from "../../shared/letters-shared-content/letters-tab/letters-tab.component";
import { LettersInfoComponent } from "../../shared/letters-shared-content/letters-info/letters-info.component";

@Component({
  selector: 'app-letters-layout',
  imports: [CommonModule, RouterOutlet, LettersTabComponent, LettersInfoComponent],
  templateUrl: './letters-layout.component.html',
  styleUrl: './letters-layout.component.scss'
})

export class LettersLayoutComponent {

}
