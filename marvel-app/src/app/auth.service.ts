import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { BehaviorSubject } from 'rxjs';

// Garantizamos que exista solo una única instancia de este servicio
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Gestión de estado Reactivo
  private user = new BehaviorSubject<User | null>(null);
  user$ = this.user.asObservable();

  constructor(private auth: Auth) {
    // Persistencia de sesión
    onAuthStateChanged(this.auth, (user) => {
      this.user.next(user);
    });
  }

  // Metodos especificos de registro, login y cierre de sesión
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }
}