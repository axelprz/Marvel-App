/**
 * CONFIGURACIÓN DE RUTAS (Routing)
 * --------------------------------
 * Define la navegación de la SPA (Single Page Application).
 *
 * Características:
 * 1. Rutas Públicas: Login, Registro, Home (Peliculas/Series).
 * 2. Rutas Dinámicas: '/pelicula/:id' usa el parámetro :id para cargar detalles.
 * 3. Rutas Protegidas: '/favoritos' implementa un Guard (canActivate) de
 * AngularFire. Si el usuario no está autenticado, lo redirige al Login
 * automáticamente, protegiendo la privacidad de los datos.
 */

import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register.component';
import { LoginComponent } from './pages/login.component';
import { PeliculasPageComponent } from './pages/peliculas-page.component';
import { SeriesPageComponent } from './pages/series-page.component';
import { FavoritosComponent } from './pages/favoritos.component';
import { PeliculaDetalleComponent } from './pages/pelicula-detalle.component';
import { SerieDetalleComponent } from './pages/serie-detalle.component';
// 1. IMPORTAR HERRAMIENTAS DE SEGURIDAD
import { canActivate, redirectUnauthorizedTo } from '@angular/fire/auth-guard';

// 2. DEFINIR REGLA DE SEGURIDAD (Si no está logueado -> ir a /login)
const redirectLogin = () => redirectUnauthorizedTo(['/login']);

export const routes: Routes = [
    // Redirección por defecto
    { path: '', redirectTo: '/peliculas', pathMatch: 'full' },
    
    // Rutas de autenticación y vistas generales
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'peliculas', component: PeliculasPageComponent },
    { path: 'series', component: SeriesPageComponent },
    
    // 3. RUTA PROTEGIDA: Solo entra si tiene sesión iniciada
    { 
        path: 'favoritos', 
        component: FavoritosComponent,
        ...canActivate(redirectLogin) // <--- BLOQUEO ACTIVADO
    },
    
    // Enrutamiento dinámico (Detalles)
    { path: 'pelicula/:id', component: PeliculaDetalleComponent },
    { path: 'serie/:id', component: SerieDetalleComponent },
    
    // Ruta comodín (si escriben cualquier cosa, van al inicio)
    { path: '**', redirectTo: '/peliculas' } 
];