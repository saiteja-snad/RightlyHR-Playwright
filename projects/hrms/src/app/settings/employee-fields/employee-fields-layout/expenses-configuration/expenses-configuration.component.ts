import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OpenModalService } from '../../../../services/open-modal.service';
import { HttpService } from '../../../../services/http.service';

@Component({
  selector: 'app-expenses-configuration',
  imports: [CommonModule,ReactiveFormsModule],
  templateUrl: './expenses-configuration.component.html',
  styleUrl: './expenses-configuration.component.scss'
})
export class ExpensesConfigurationComponent {

  expenseForm!:FormGroup

  constructor(public router: Router, private fb: FormBuilder, private conformationPopup: OpenModalService,
    private http: HttpService) { }
    ngOnInit(): void {
  
  
      this.intiationalfrom();
  
    }
  intiationalfrom(){
    this.expenseForm = this.fb.group({
      expenseType: ['', [Validators.required, Validators.maxLength(50)]],
      expensesCode: ['', [Validators.required, Validators.maxLength(50)]],
    });
  }
}
