// login.component.ts

import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Aseguramos que CommonModule esté si usamos directivas como *ngIf

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule], // Añadimos CommonModule por buena práctica
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login(this.email, this.password)
      .then(() => {
        alert('Bienvenido');
        // 💡 CAMBIO CRUCIAL: Redirigir a la nueva ruta principal de películas
        this.router.navigate(['/peliculas']); 
      })
      .catch(error => alert(error.message));
  }
}