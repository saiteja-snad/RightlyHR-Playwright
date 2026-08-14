import { Component, OnInit } from '@angular/core';
import { LetterLogoService } from '../../../services/letter-logo.service';

@Component({
  selector: 'app-lettersheader',
  imports: [],
  templateUrl: './lettersheader.component.html',
  styleUrl: './lettersheader.component.scss'
})
export class LettersheaderComponent implements OnInit {
  constructor(public letterLogoService: LetterLogoService) {}

  ngOnInit(): void {
    this.letterLogoService.ensureLogoLoaded();
  }

  get companyLogo(): string {
    return this.letterLogoService.companyLogo;
  }
}
