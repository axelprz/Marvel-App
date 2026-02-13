import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MovieService, TvShow } from '../movie.service';
import { finalize } from 'rxjs/operators';
import { Location } from '@angular/common';
import { ToastService } from '../toast.service';

/**
 * COMPONENTE DE DETALLE DE SERIE
 * ------------------------------
 * Este componente se encarga de mostrar la información completa de una serie específica.
 * Funcionalidades principales:
 * 1. Obtener el ID de la serie desde la URL.
 * 2. Cargar los datos desde la API (TMDB).
 * 3. Gestionar el estado de "Favorito" en Firebase (Agregar/Quitar).
 */
@Component({
  selector: 'app-serie-detalle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './serie-detalle.html'
})
export class SerieDetalleComponent implements OnInit {
  // Datos de la serie traídos de la API
  serie: TvShow | null = null;
  
  // Controla el spinner de carga (true = cargando, false = mostrar datos)
  loading = true;
  
  // Estado local del botón de corazón (true = Rojo/Lleno, false = Gris/Vacío)
  isFavorite = false;
  
  // "Semáforo" o bloqueo: Evita que el usuario haga múltiples clics seguidos
  // mientras se procesa la petición a Firebase.
  pending = false;

  constructor(
    private route: ActivatedRoute,    // Para leer el ID de la URL (ej: /serie/123)
    public movieService: MovieService,// Servicio para comunicar con API y Firebase
    private location: Location,       // Para poder volver a la página anterior
    private toast: ToastService       // Para mostrar notificaciones flotantes
  ) {}

  /**
   * Ciclo de vida inicial: Se ejecuta al entrar a la página.
   */
  ngOnInit() {
    // Capturamos el ID de la URL
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id) {
      const numericId = Number(id);
      // Disparamos las dos acciones principales:
      this.getSerie(numericId);         // 1. Traer info de la serie
      this.checkFavoriteStatus(numericId); // 2. Verificar si ya le di like
    }
  }

  /**
   * Llama a la API de TMDB para obtener los detalles.
   * Usa RxJS para manejar la asincronía.
   */
  getSerie(id: number) {
    this.loading = true;
    this.movieService.getSeriesById(id)
      .pipe(
        // 'finalize' se ejecuta SIEMPRE al terminar, haya error o éxito.
        // Es el lugar perfecto para apagar el spinner.
        finalize(() => this.loading = false)
      )
      .subscribe({
        next: (data) => {
          this.serie = data;
        },
        error: (err) => console.error('Error al cargar serie:', err)
      });
  }

  /**
   * Consulta a Firebase si el usuario actual ya tiene esta serie en favoritos.
   * Esto sirve para pintar el corazón de rojo si ya la guardaste antes.
   */
  async checkFavoriteStatus(id: number) {
    // 'await' espera la respuesta de la base de datos
    this.isFavorite = await this.movieService.isFavorite(id);
  }

  /**
   * LÓGICA PRINCIPAL DEL BOTÓN DE FAVORITOS
   * Maneja el evento de click en el corazón.
   */
  async toggleFavorite() {
    // 1. Validación de seguridad:
    // Si la serie no cargó O si ya estamos procesando una petición (pending), no hacemos nada.
    if (!this.serie || this.pending) return;

    // 2. Activamos el bloqueo para evitar doble clic
    this.pending = true;

    try {
      if (this.isFavorite) {
        // --- CASO: QUITAR FAVORITO ---
        await this.movieService.removeFavorite(this.serie.id);
        this.isFavorite = false; // Actualizamos la vista inmediatamente
        this.toast.show('❌ Eliminado de favoritos');
      } else {
        // --- CASO: AGREGAR FAVORITO ---
        // IMPORTANTE: Pasamos 'tv' como segundo argumento para que Firebase sepa que es una SERIE
        await this.movieService.addFavorite(this.serie, 'tv');
        this.isFavorite = true; // Pintamos el corazón inmediatamente
        this.toast.show('✅ Serie agregada a favoritos');
      }
    } catch (e) {
      // Si falla (ej: usuario no logueado), mostramos error
      this.toast.show('🚨 Error. ¿Estás logueado?');
    } finally {
      // 3. Desbloqueamos el botón (siempre se ejecuta al final)
      this.pending = false;
    }
  }

  // Navegación: Vuelve a la página anterior en el historial del navegador
  goBack() {
    this.location.back();
  }
}
