// favoritos.component.ts
/**
 * GESTOR DE FAVORITOS (Películas y Series)
 * ----------------------------------------
 * Muestra la colección personal del usuario almacenada en Firestore.
 *
 * Diferencias con otras vistas:
 * 1. Carga Híbrida: Acepta tanto objetos de tipo 'Movie' como 'TvShow'.
 * Utiliza la propiedad 'media_type' (guardada previamente) para generar
 * los enlaces correctos.
 * 2. Filtrado Local: Al ser una lista finita, los filtros (ordenar, buscar)
 * se ejecutan en el navegador (JavaScript puro) sin hacer nuevas
 * peticiones al servidor, garantizando una respuesta instantánea.
 */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieService } from '../movie.service'; 
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
  // CAMBIO: Usamos any[] para aceptar tanto Películas como Series
  favorites: any[] = []; 
  filteredFavorites: any[] = []; 
  
  loading = true;
  pending: Set<number> = new Set();
  searchTerm = '';
  orderBy = 'title'; 
  onlyWithOverview = false; 
  releaseDateSince = ''; 

  constructor(public movieService: MovieService, private toast: ToastService) {} 

  async ngOnInit() {
    this.favorites = await this.movieService.getFavorites();
    this.applyFilters();
    this.loading = false;
  }

  async remove(id: number) {
    this.pending.add(id);
    await this.movieService.removeFavorite(id);
    // Filtramos usando el ID
    this.favorites = this.favorites.filter(m => m.id !== id); 
    this.pending.delete(id);
    this.toast.show('❌ Eliminado de favoritos');
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.favorites];

    // 1. Filtro de texto (Buscador híbrido)
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        (item.title && item.title.toLowerCase().includes(term)) || 
        (item.name && item.name.toLowerCase().includes(term))
      );
    }

    // 2. Filtrar solo por sinopsis
    if (this.onlyWithOverview) {
      filtered = filtered.filter(item => item.overview && item.overview.trim() !== '');
    }

    // 3. Filtro de fecha (Soporta release_date y first_air_date)
    if (this.releaseDateSince) {
      const since = new Date(this.releaseDateSince);
      filtered = filtered.filter(item => {
        const dateStr = item.release_date || item.first_air_date;
        return new Date(dateStr) >= since;
      });
    }

    // 4. Ordenamiento híbrido
    if (this.orderBy === 'title') {
      // Ordenar por Título (A-Z)
      filtered.sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name));
    } else if (this.orderBy === '-title') {
      // Ordenar por Título (Z-A)
      filtered.sort((a, b) => (b.title || b.name).localeCompare(a.title || a.name));
    } else if (this.orderBy === 'release_date_desc') { 
      // Estreno (Más reciente primero)
      filtered.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date).getTime();
        const dateB = new Date(b.release_date || b.first_air_date).getTime();
        return dateB - dateA;
      });
    } else if (this.orderBy === 'release_date_asc') { 
      // Estreno (Más antiguo primero)
      filtered.sort((a, b) => {
        const dateA = new Date(a.release_date || a.first_air_date).getTime();
        const dateB = new Date(b.release_date || b.first_air_date).getTime();
        return dateA - dateB;
      });
    } else if (this.orderBy === 'vote_average') { 
      // Rating (Mayor)
       filtered.sort((a, b) => b.vote_average - a.vote_average); 
    }

    this.filteredFavorites = filtered;
  }

  clearFilters() {
    this.searchTerm = '';
    this.orderBy = 'title';
    this.onlyWithOverview = false;
    this.releaseDateSince = '';
    this.applyFilters();
  }
}