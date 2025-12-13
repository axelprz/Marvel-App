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
  loading = true;
  searchTerm = '';
  offset = 0; 
  limit = 20;
  total = 0;
  
  // Filtros
  orderBy: string = 'popularity.desc';
  onlyWithPopular = false;
  releaseYear: number | null = null;
  selectedGenreId: number | null = null; // Filtro de categoría
  
  currentPage: number = 1; 
  totalPages: number = 0;
  
  favorites: Set<number> = new Set();
  pending: Set<number> = new Set();

  constructor(public movieService: MovieService, private auth: Auth, private toast: ToastService) {}

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

  async markFavorites() {
    this.favorites = await this.movieService.getFavoriteIds();
  }
  
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
    this.pending.add(id);
    try {
      if (this.favorites.has(id)) {
        await this.movieService.removeFavorite(id);
        this.favorites.delete(id);
        this.toast.show('❌ Eliminado de favoritos');
      } else {
        await this.movieService.addFavorite(movie); 
        this.favorites.add(id);
        this.toast.show('✅ Agregado a favoritos');
      }
    } catch (e) {
        this.toast.show('🚨 Error. ¿Iniciaste sesión?');
    } finally {
      this.pending.delete(id);
    }
  }
}