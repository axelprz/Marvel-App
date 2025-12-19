import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
  // Definimos el mensaje usando BehaviorSubject para que tenga un valor inicial
  private messageSubject = new BehaviorSubject<string | null>(null);
  // Exponemos el mensaje como un Observable para que los elementos se suscriban
  message$ = this.messageSubject.asObservable();

  // Recibe el mensaje y un tiempo opcional (en este caso, 3 segundos)
  show(message: string, duration = 3000) {
    // Emitimos el mensaje a todos los suscriptores
    this.messageSubject.next(message);
    // Pasados los 3 segundos, emitimos null para que el Toast desaparezca
    setTimeout(() => this.messageSubject.next(null), duration);
  }
}
