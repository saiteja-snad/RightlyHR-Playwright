import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-offer-letter',
  imports: [CommonModule],
  templateUrl: './offer-letter.component.html',
  styleUrl: './offer-letter.component.scss'
})
export class OfferLetterComponent implements OnInit {

  constructor(private router: Router) {

  }

  ngOnInit(): void {

  }

  navigateExperience(){
    this.router.navigate(['/education-details'])
  }
}