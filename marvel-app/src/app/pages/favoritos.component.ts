// favoritos.component.ts (Antes era favoritos.ts)

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// 💡 Importamos MovieService y la interfaz Movie
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
  // 💡 Tipamos las listas como Movie[]
  favorites: Movie[] = []; 
  loading = true;
  pending: Set<number> = new Set();
  searchTerm = '';
  // 💡 Nuevos valores para ordenación
  orderBy = 'title'; 
  // 💡 Nueva variable para sinopsis (overview)
  onlyWithOverview = false; 
  // 💡 Nueva variable para fecha de estreno
  releaseDateSince = ''; 
  filteredFavorites: Movie[] = []; 

  // 💡 Hacemos el servicio público y renombramos la variable a 'movieService' (por consistencia)
  constructor(public movieService: MovieService, private toast: ToastService) {} 

  async ngOnInit() {
    // getFavorites ya devuelve Movie[]
    this.favorites = await this.movieService.getFavorites();
    this.applyFilters();
    this.loading = false;
  }

  // 💡 remove ahora es remove(id: number) y usa movieService
  async remove(id: number) {
    this.pending.add(id);
    await this.movieService.removeFavorite(id);
    // Filtramos por movie.id
    this.favorites = this.favorites.filter(m => m.id !== id); 
    this.pending.delete(id);
    this.toast.show('❌ Eliminado de favoritos');
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.favorites];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      // 💡 Filtrar por movie.title
      filtered = filtered.filter(movie => movie.title.toLowerCase().includes(term));
    }

    // 💡 Filtrar por movie.overview (sinopsis)
    if (this.onlyWithOverview) {
      filtered = filtered.filter(movie => movie.overview && movie.overview.trim() !== '');
    }

    // 💡 Filtrar por movie.release_date (fecha de estreno)
    if (this.releaseDateSince) {
      const since = new Date(this.releaseDateSince);
      // Compara la fecha de estreno (release_date)
      filtered = filtered.filter(movie => new Date(movie.release_date) >= since); 
    }

    // 💡 Ajustar la lógica de ordenación a las nuevas propiedades de películas
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

    this.filteredFavorites = filtered;
  }

  clearFilters() {
    this.searchTerm = '';
    // 💡 Valores por defecto actualizados
    this.orderBy = 'title';
    this.onlyWithOverview = false;
    this.releaseDateSince = '';
    this.applyFilters();
  }
}