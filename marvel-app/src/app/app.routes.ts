import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register';
import { LoginComponent } from './pages/login';
import { MarvelComponent } from './pages/marvel';
import { FavoritosComponent } from './pages/favoritos';
import { PersonajeComponent } from './pages/personaje';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'register', component: RegisterComponent },
    { path: 'login', component: LoginComponent },
    { path: 'marvel', component: MarvelComponent },
    { path: 'favoritos', component: FavoritosComponent },
    { path: 'personaje/:id', component: PersonajeComponent }
];
