import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { MovieService, Movie } from '../movie.service'; 

@Component({
  selector: 'app-pelicula-detalle',
  standalone: true,
  imports: [CommonModule], 
  templateUrl: './pelicula-detalle.html',
  styleUrl: './pelicula-detalle.css'
})
export class PeliculaDetalleComponent implements OnInit {
  movie: Movie | undefined;
  loading = true;

  constructor(
    private route: ActivatedRoute, 
    public movieService: MovieService,
    private location: Location
  ) {}

  ngOnInit() {
    this.loadMovieDetail();
  }

  loadMovieDetail() {
    this.loading = true;
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.movieService.getMovieById(id).subscribe({
      next: (data: Movie) => {
        this.movie = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar la película:', err);
        this.loading = false;
        this.movie = undefined;
      }
    });
  }

  volver() {
    this.location.back();
  }
}