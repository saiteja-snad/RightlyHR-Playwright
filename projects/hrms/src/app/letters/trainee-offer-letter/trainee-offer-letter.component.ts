import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LettersTabComponent } from "../../shared/letters-tab/letters-tab.component";

@Component({
  selector: 'app-trainee-offer-letter',
  imports: [LettersTabComponent],
  templateUrl: './trainee-offer-letter.component.html',
  styleUrl: './trainee-offer-letter.component.scss'
})
export class TraineeOfferLetterComponent {

  constructor(private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {

  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}
