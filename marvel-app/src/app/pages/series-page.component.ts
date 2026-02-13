import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MovieService, TvShow } from '../movie.service'; // Importamos la interfaz TvShow
import { RouterLink } from '@angular/router';
import { ToastService } from '../toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-series-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './series-page.html'
})
export class SeriesPageComponent implements OnInit {
  series: TvShow[] = [];
  loading = true;
  searchTerm = '';
  page = 1;

  constructor(public movieService: MovieService, private toast: ToastService) {}

  ngOnInit() {
    this.loadSeries();
  }

  loadSeries() {
    this.loading = true;
    
    // Si hay búsqueda, usamos el endpoint de búsqueda de series
    if (this.searchTerm.trim() !== '') {
      this.movieService.searchSeries(this.searchTerm, this.page)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (data) => {
            this.series = data.results;
          },
          error: (err) => {
            console.error(err);
            this.toast.show('🔴 Error al buscar series.');
          }
        });
    } else {
      // Si no, cargamos series populares
      this.movieService.getPopularSeries(this.page)
        .pipe(finalize(() => this.loading = false))
        .subscribe({
          next: (data) => {
            this.series = data.results;
          },
          error: (err) => {
            console.error(err);
            this.toast.show('🔴 Error al cargar series populares.');
          }
        });
    }
  }

  onSearch() {
    this.page = 1; // Reiniciamos a la primera página al buscar
    this.loadSeries();
  }
}