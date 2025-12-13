import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register.component';
import { LoginComponent } from './pages/login.component';
import { PeliculasPageComponent } from './pages/peliculas-page.component'; 
import { FavoritosComponent } from './pages/favoritos.component';
import { PeliculaDetalleComponent } from './pages/pelicula-detalle.component'; 

export const routes: Routes = [
    { path: '', redirectTo: '/peliculas', pathMatch: 'full' },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'peliculas', component: PeliculasPageComponent },
    { path: 'favoritos', component: FavoritosComponent },
    { path: 'pelicula/:id', component: PeliculaDetalleComponent }, 
    { path: '**', redirectTo: '/peliculas' } 
];