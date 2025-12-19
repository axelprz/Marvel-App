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
  loading = true; // Mostrar el spinner de carga mientras traemos los datos

  // Inyectamos dependencias. route nos permite leer la URL actual y location el historia del navegador.
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
    // Tomamos el id de la URL y lo convertimos en número
    const id = Number(this.route.snapshot.paramMap.get('id'));
    // Llamamos al servicio pasando ese ID
    this.movieService.getMovieById(id).subscribe({
      next: (data: Movie) => {
        this.movie = data;
        this.loading = false; // Ocultamos spinner
      },
      error: (err) => {
        console.error('Error al cargar la película:', err);
        this.loading = false;
        this.movie = undefined;
      }
    });
  }

  // Esto nos permite emular el botón de "Atrás" del navegador
  volver() {
    this.location.back();
  }
}