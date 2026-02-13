/**
 * CONFIGURACIÓN GLOBAL DE LA APP
 * ------------------------------
 * Aquí se inyectan los proveedores globales al arrancar Angular.
 *
 * Configuración Especial de Firebase:
 * - initializeFirestore con 'experimentalForceLongPolling: true':
 * Esto fuerza a Firebase a usar peticiones HTTP estándar en lugar de WebSockets.
 * Es vital para evitar errores de conexión (Offline) en redes corporativas,
 * universitarias o equipos con Antivirus estrictos (como McAfee) que bloquean
 * el protocolo predeterminado de Firestore.
 */

import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { initializeApp, provideFirebaseApp, getApp } from '@angular/fire/app'; // <--- Agregado getApp
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore, initializeFirestore } from '@angular/fire/firestore'; // <--- Agregado initializeFirestore
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
    
    // CAMBIO IMPORTANTE AQUÍ:
    // En lugar de usar getFirestore() directo, usamos initializeFirestore con configuración especial
    // para evitar el error "Offline" y saltar bloqueos de red.
    provideFirestore(() => {
        const app = getApp();
        return initializeFirestore(app, { experimentalForceLongPolling: true });
    })
  ]
};