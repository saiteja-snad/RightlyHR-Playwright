import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})

export class LoginComponent {
  loginfrom!: FormGroup;
  visible: boolean = false;
  changetype: boolean = true;

  constructor(private readonly fb: FormBuilder, public router: Router) { }

  ngOnInit() {
    this.initiallogin();
  }

  initiallogin() {
    this.loginfrom = this.fb.group({
      username: [null, Validators.required],
      password: [null, Validators.required]
    })
  }

  viewpassword() {
    this.visible = !this.visible;
    this.changetype = !this.changetype;
  }

  requestotp() {
    this.router.navigate(['/otp'])
  }
}