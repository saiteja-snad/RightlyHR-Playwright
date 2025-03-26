import { Component, ViewChild } from '@angular/core';
import { DateformatPipe } from '../../pipes/dateformat.pipe';
import { Select } from 'primeng/select';
import { CountryCodePhoneNumberComponent } from '../../shared/country-code-phone-number/country-code-phone-number.component';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-bank-loan-letter',
  imports: [CommonModule,Select, CountryCodePhoneNumberComponent,ReactiveFormsModule,DateformatPipe],
  templateUrl: './bank-loan-letter.component.html',
  styleUrl: './bank-loan-letter.component.scss'
})
export class BankLoanLetterComponent {
  employeeForm!: FormGroup;
  selectedEmployee: any;
  @ViewChild('success') success: any;

  constructor(private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {

  }

  navigateDashboard() {
    this.router.navigate(['/admin/dashboard'])
  }
}
