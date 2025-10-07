import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized-login',
  imports: [],
  templateUrl: './unauthorized-login.component.html',
  styleUrl: './unauthorized-login.component.scss'
})
export class UnauthorizedLoginComponent implements OnInit {
  ngOnInit(): void {
    this.tokenExpiry();
  }

  constructor(private auth: AuthService, private router: Router) {
  }

  tokenExpiry() {
    const tokenString = localStorage.getItem("currentUser");
    const token = tokenString ? JSON.parse(tokenString) : null;

    if (!token || !token.refreshToken) {
      localStorage.clear();
      sessionStorage.clear();
      this.auth.logout();
      this.router.navigate(['/login']);
    }
    else {
      this.auth.refreshToken().subscribe({
        next: (res) => {
          this.router.navigate(['/uservalidation'])
        },
        error: (err) => console.error('Error occurred', err)
      });
    }
  }
}
