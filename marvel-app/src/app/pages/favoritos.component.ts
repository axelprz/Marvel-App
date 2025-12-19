// favoritos.component.ts (Antes era favoritos.ts)

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService, Movie } from '../movie.service'; 
import { ToastService } from '../toast.service';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './favoritos.html',
  styleUrl: './favoritos.css'
})
export class FavoritosComponent implements OnInit {
  favorites: Movie[] = []; 
  loading = true;
  pending: Set<number> = new Set();
  searchTerm = '';
  orderBy = 'title'; 
  onlyWithOverview = false; 
  releaseDateSince = ''; 
  filteredFavorites: Movie[] = []; 

  constructor(public movieService: MovieService, private toast: ToastService) {} 

  async ngOnInit() {
    //Traemos todos los favoritos de firebase.
    this.favorites = await this.movieService.getFavorites();
    // Aplicamos filtros iniciales
    this.applyFilters();
    this.loading = false;
  }

  async remove(id: number) {
    this.pending.add(id);
    // Eliminamos de la base de datos
    await this.movieService.removeFavorite(id);
    this.favorites = this.favorites.filter(m => m.id !== id); 
    this.pending.delete(id);
    this.toast.show('❌ Eliminado de favoritos');
    // Recalculamos lo que se ve en pantalla
    this.applyFilters();
  }

  applyFilters() {
    // Creamos copia del array
    let filtered = [...this.favorites];

    // Filtro de texto (buscador)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(movie => movie.title.toLowerCase().includes(term));
    }

    // Filtrar solo por sinopsis
    if (this.onlyWithOverview) {
      filtered = filtered.filter(movie => movie.overview && movie.overview.trim() !== '');
    }

    // Filtro de fecha de estreno
    if (this.releaseDateSince) {
      const since = new Date(this.releaseDateSince);
      // Compara la fecha de estreno (release_date)
      filtered = filtered.filter(movie => new Date(movie.release_date) >= since); 
    }

    // Usamos .sort para ordenar la lista
    if (this.orderBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (this.orderBy === '-title') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    } else if (this.orderBy === 'release_date_desc') { // Estreno (Reciente)
      filtered.sort((a, b) => new Date(b.release_date).getTime() - new Date(a.release_date).getTime());
    } else if (this.orderBy === 'release_date_asc') { // Estreno (Antiguo)
      filtered.sort((a, b) => new Date(a.release_date).getTime() - new Date(b.release_date).getTime());
    } else if (this.orderBy === 'vote_average') { // Rating (Mayor)
       // Comparamos el rating promedio
       filtered.sort((a, b) => b.vote_average - a.vote_average); 
    }

    // Finalmente, actualizamos la vista
    this.filteredFavorites = filtered;
  }

  clearFilters() {
    this.searchTerm = '';
    this.orderBy = 'title';
    this.onlyWithOverview = false;
    this.releaseDateSince = '';
    // Volvemos a actualizar la vista
    this.applyFilters();
  }
}