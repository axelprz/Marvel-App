import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    // Manejo de errores del navegador
    provideBrowserGlobalErrorListeners(),
    // Optimización de rendimiento
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Habilita el cliente http globalmente
    provideHttpClient(),
    // Inyectamos nuestras rutas
    provideRouter(routes), 
    // Integramos Firebase
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    // Habilitamos la autenticación
    provideAuth(() => getAuth()),
    // Habilitamos la base de datos de Firestore
    provideFirestore(() => getFirestore())
  ]
};
