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
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html'
})
export class App {
  constructor(public authService: AuthService, private router: Router, private eRef: ElementRef, public toast: ToastService) {}

  menuOpen = false;

  logout() {
    this.authService.logout().then(() => {
      this.menuOpen = false;
      this.router.navigate(['/login']);
    });
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }
}
