import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-sm mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 class="text-xl font-bold mb-4">Registro</h2>
      <form (ngSubmit)="register()">
        <input [(ngModel)]="email" name="email" type="email" placeholder="Email" class="w-full mb-2 p-2 border rounded" required>
        <input [(ngModel)]="password" name="password" type="password" placeholder="Contraseña" class="w-full mb-4 p-2 border rounded" required>
        <button class="bg-blue-500 w-full text-white p-2 rounded">Registrarse</button>
      </form>
    </div>
  `
})
export class RegisterComponent {
  email = '';
  password = '';

  constructor(private auth: AuthService, private router: Router) {}

  register() {
    this.auth.register(this.email, this.password)
      .then(() => {
        alert('Usuario registrado con éxito');
        this.router.navigate(['/login']);
      })
      .catch(error => alert(error.message));
  }
}
