import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../shared/header/header.component";

@Component({
  selector: 'app-preonboarding-layout',
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './preonboarding-layout.component.html',
  styleUrl: './preonboarding-layout.component.scss'
})

export class PreonboardingLayoutComponent {

  constructor(public router: Router) { }

  
}