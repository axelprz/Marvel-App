import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastService } from '../toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  // Usamos FormsModule para usar ngModel y capturar lo que el usuario escribe y RouterLink para el enlace de registro.
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  // Variables vinculadas al HTML
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login(this.email, this.password)
      .then(() => {
        alert('Bienvenido');
        this.router.navigate(['/peliculas']); 
      })
      .catch(error => alert(error.message));
  }
}