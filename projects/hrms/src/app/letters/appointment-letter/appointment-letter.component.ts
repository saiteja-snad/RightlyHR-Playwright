import { Component } from '@angular/core';
import { LettersTabComponent } from "../../shared/letters-tab/letters-tab.component";
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-appointment-letter',
  imports: [LettersTabComponent,CommonModule],
  templateUrl: './appointment-letter.component.html',
  styleUrl: './appointment-letter.component.scss'
})
export class AppointmentLetterComponent {
  constructor(private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {

  }

  navigateDashboard() {
    this.router.navigate(['/dashboard'])
  }
}
