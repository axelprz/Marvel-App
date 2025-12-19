import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register.component';
import { LoginComponent } from './pages/login.component';
import { PeliculasPageComponent } from './pages/peliculas-page.component'; 
import { FavoritosComponent } from './pages/favoritos.component';
import { PeliculaDetalleComponent } from './pages/pelicula-detalle.component'; 

export const routes: Routes = [
    // Redirección por defecto
    { path: '', redirectTo: '/peliculas', pathMatch: 'full' },
    // Rutas de autenticación y vistas generales
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'peliculas', component: PeliculasPageComponent },
    { path: 'favoritos', component: FavoritosComponent },
    // Enrutamiento dinámico
    { path: 'pelicula/:id', component: PeliculaDetalleComponent }, 
    // Ruta comodín, para casos donde se escriban rutas que no existen
    { path: '**', redirectTo: '/peliculas' } 
];