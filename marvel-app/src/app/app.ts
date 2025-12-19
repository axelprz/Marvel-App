import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ElementRef, HostListener } from '@angular/core';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  // Definimos RouterOutlet para renderizar las vistas dinamicamente según la URL
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html'
})
export class App {
  // Solicitamos al inyector de Angular los servicios globales
  constructor(public authService: AuthService, private router: Router, private eRef: ElementRef, public toast: ToastService) {}

  // Estado local para compobar la visibilidad del menú
  menuOpen = false;

  // Lógica de logout con asincronía.
  logout() {
    this.authService.logout().then(() => {
      this.menuOpen = false;
      this.router.navigate(['/login']);
    });
  }

  // Detectamos si el usuario hace click fuera del componente, si es asi, lo cerramos.
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }
}
