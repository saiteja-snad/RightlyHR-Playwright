import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-address-info',
  imports: [CommonModule, ReactiveFormsModule, ],
  templateUrl: './address-info.component.html',
  styleUrl: './address-info.component.scss'
})
export class AddressInfoComponent {
  buttons= false;

  showButtons() {
    this.buttons = !this.buttons
  }
  
}
