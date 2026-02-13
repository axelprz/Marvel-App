/**
 * CONTROLADOR DE LA VISTA DE PELÍCULAS
 * ------------------------------------
 * Este componente gestiona la pantalla principal.
 *
 * Lógica Principal:
 * - ngOnInit: Carga inicial paralela (Géneros, Favoritos y Películas).
 * - Sistema de Filtrado: Detecta si el usuario está buscando o filtrando
 * y decide qué método del servicio llamar (searchMovies vs discoverMovies).
 * - Paginación Manual: Controla el 'offset' y la página actual para
 * navegar por los resultados de la API.
 * - Gestión de Favoritos: Mantiene un Set<number> local de IDs para
 * pintar los corazones rojos instantáneamente sin recargar la página.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService, Movie, DiscoverParams, Genre } from '../movie.service'; 
import { Auth } from '@angular/fire/auth';
import { RouterLink } from '@angular/router';
import { ToastService } from '../toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-peliculas-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './peliculas-page.html'
})
export class PeliculasPageComponent implements OnInit {
  movies: Movie[] = []; 
  genres: Genre[] = []; // Lista de géneros
  loading = true; // Controla el spinner de carga
  searchTerm = '';
  // Variables de paginación
  offset = 0; 
  limit = 20;
  total = 0;
  
  // Filtros
  // Usamos ngModel en el HTML para conectar esto con los inputs
  orderBy: string = 'popularity.desc';
  onlyWithPopular = false;
  releaseYear: number | null = null;
  selectedGenreId: number | null = null; // Filtro de categoría
  
  currentPage: number = 1; 
  totalPages: number = 0;
  //Nos permite verificar si el favorito es 0 o 1
  favorites: Set<number> = new Set();
  // Evita que el usuario clickee muchas veces sobre el bóton de favoritos, evitando errores.
  pending: Set<number> = new Set();

  constructor(public movieService: MovieService, private auth: Auth, private toast: ToastService) {}

  // Al iniciar, cargamos todo en paralelo: favoritos, generos y lista inicial
  ngOnInit() {
    this.markFavorites();
    this.loadGenres();
    this.loadMovies();
  }

  loadGenres() {
    this.movieService.getMovieGenres().subscribe({
      next: (data) => {
        this.genres = data.genres;
      },
      error: (err) => console.error('Error al cargar géneros', err)
    });
  }

  // Sincroniza los corazones rojos con la base de datos al entrar
  async markFavorites() {
    this.favorites = await this.movieService.getFavoriteIds();
  }

  // Esta función decide que endpoint llamar
  loadMovies() {
    this.loading = true;
    const page = Math.floor(this.offset / this.limit) + 1;

    // Si hay búsqueda por texto, usamos el endpoint de búsqueda
    if (this.searchTerm.trim() !== '') {
        this.searchMovies(this.searchTerm, page);
        return;
    }
    
    // Si hay algún filtro activo, usamos discover
    if (this.isFilterActive()) {
        this.discoverMovies(page);
        return;
    }

    // Si no, cargamos populares por defecto
    this.movieService.getPopularMovies(page)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: data => {
          this.processResponse(data);
        },
        error: err => {
          this.toast.show('🔴 Error al cargar películas populares.');
          console.error(err);
        }
      });
  }

  // Método auxiliar para no repetir código
  processResponse(data: any) {
    this.movies = data.results;
    this.total = data.total_results;
    this.currentPage = data.page;
    this.totalPages = data.total_pages;
    this.markFavorites();
  }

  // Verificamos si el usuario tocó algun filtro
  isFilterActive(): boolean {
      return (
          this.orderBy !== 'popularity.desc' ||
          this.onlyWithPopular ||
          this.releaseYear !== null ||
          this.selectedGenreId !== null
      );
  }

  searchMovies(name: string, page: number) {
    this.loading = true;
    this.movieService.searchMovies(name, page)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: data => this.processResponse(data),
        error: err => {
          this.toast.show('🔴 Error en la búsqueda.');
          console.error(err);
        }
      });
  }

  discoverMovies(page: number) {
      this.loading = true;
      // Mapeo las variables locales a paramtros de la API
      const params: DiscoverParams = {
          page: page,
          sort_by: this.orderBy,
      };

      if (this.releaseYear) params.primary_release_year = this.releaseYear;
      if (this.onlyWithPopular) params.vote_count_gte = 100;
      if (this.selectedGenreId) params.with_genres = this.selectedGenreId.toString();
      
      this.movieService.discoverMovies(params)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: data => this.processResponse(data),
          error: err => {
            this.toast.show('🔴 Error en el filtrado.');
            console.error(err);
          }
        });
  }

  // Reseteamos la paginacion al buscar
  onSearch() {
    this.offset = 0; 
    this.loadMovies();
  }

  nextPage() {
    this.offset += this.limit;
    this.loadMovies();
  }

  prevPage() {
    if (this.offset === 0) return;
    this.offset -= this.limit;
    this.loadMovies();
  }

  // Resetea todos los filtros a su estado inicial
  clearFilters() {
    this.orderBy = 'popularity.desc'; 
    this.onlyWithPopular = false;
    this.releaseYear = null; 
    this.selectedGenreId = null; 
    this.searchTerm = '';
    this.offset = 0;
    this.loadMovies();
  }
  
  async toggleFavorite(movie: Movie) { 
    const id = movie.id;
    this.pending.add(id); // Se bloquea el boton visualmente
    try {
      if (this.favorites.has(id)) {
        await this.movieService.removeFavorite(id);
        this.favorites.delete(id); // Actualizamos estado local
        this.toast.show('❌ Eliminado de favoritos');
      } else {
        // CORRECCIÓN: Ahora pasamos 'movie' como segundo argumento
        await this.movieService.addFavorite(movie, 'movie'); 
        this.favorites.add(id); // Actualizamos estado local
        this.toast.show('✅ Agregado a favoritos');
      }
    } catch (e) {
        this.toast.show('🚨 Error. ¿Iniciaste sesión?');
    } finally {
      this.pending.delete(id); // Se desbloquea el botón
    }
  }
}