import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
@Component({
  selector: 'app-rate-card-layout',
  imports: [CommonModule, RouterModule],
  templateUrl: './rate-card-layout.component.html',
  styleUrl: './rate-card-layout.component.scss'
})

export class RateCardLayoutComponent {
  constructor(public readonly router: Router) { }
}