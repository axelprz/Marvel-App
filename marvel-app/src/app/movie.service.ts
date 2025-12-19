import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Firestore, collection, doc, setDoc, deleteDoc, getDoc, getDocs, where, query } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { environment } from '../environments/environment';

// Definición de interfaces
export interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  genre_ids?: number[]; 
  vote_count?: number;
}

export interface MovieListResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface DiscoverParams {
  page?: number;
  sort_by?: string;
  with_genres?: string;
  primary_release_year?: number;
  vote_count_gte?: number;
}


@Injectable({
  providedIn: 'root' // Una única instancia del servicio para toda la página
})
export class MovieService {
  // Seguridad y configuración de la API
  private apiKey = environment.tmdbApiKey; 
  private baseUrl = 'https://api.themoviedb.org/3';
  private imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  // Inyección de dependencias
  constructor(private http: HttpClient, private firestore: Firestore, private auth: Auth) {}

  // Evita errores visuales si la película no tiene imagen
  getPosterUrl(posterPath: string | null): string {
    if (posterPath) {
      return `${this.imageBaseUrl}${posterPath}`;
    }
    return 'assets/placeholder-image.png'; 
  }

  // Traemos las películas más populares
  getPopularMovies(page: number = 1): Observable<MovieListResponse> {
    const url = `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=es-ES&page=${page}`;
    return this.http.get<MovieListResponse>(url);
  }

  // Metodo para buscar películas
  searchMovies(
    name: string,
    page: number = 1
  ): Observable<MovieListResponse> {
    
    // Si el input está vació o solo tiene espacios, no buscamos nada.
    if (name.trim() === '') {
      return this.getPopularMovies(page); 
    }
    
    // Sanitizamos el texto para que los caracteres especiales no rompan la URL
    const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&language=es-ES&query=${encodeURIComponent(name)}&page=${page}`;
    
    // Devolvemos un Observable para que el componente se suscriba y reaccione a la respuesta
    return this.http.get<MovieListResponse>(url);
  }

  // Filtrado avanzado
  discoverMovies(params: DiscoverParams): Observable<MovieListResponse> {
    // Clase para construir Query Strings de forma segura
    let httpParams = new HttpParams();
    
    // Parametros obligatorios
    httpParams = httpParams.set('api_key', this.apiKey);
    httpParams = httpParams.set('language', 'es-ES');

    // Solo añadimos los parametros que el usuario eligio
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
    if (params.with_genres) httpParams = httpParams.set('with_genres', params.with_genres);
    if (params.primary_release_year) httpParams = httpParams.set('primary_release_year', params.primary_release_year.toString());
    if (params.vote_count_gte) httpParams = httpParams.set('vote_count.gte', params.vote_count_gte.toString());

    const url = `${this.baseUrl}/discover/movie`;

    // Pasamos los params al objeto de opciones del HttpCliente
    return this.http.get<MovieListResponse>(url, { params: httpParams });
  }

  getMovieById(id: number): Observable<Movie> {
    const url = `${this.baseUrl}/movie/${id}?api_key=${this.apiKey}&language=es-ES`;
    return this.http.get<Movie>(url);
  }

  getMovieGenres(): Observable<{ genres: Genre[] }> {
    const url = `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}&language=es-ES`;
    return this.http.get<{ genres: Genre[] }>(url);
  }

  // Usamos promesas para operaciones de base de datos únicas
  async addFavorite(movie: Movie) {
    const user = this.auth.currentUser;
    if (!user) return; // No guardamos si no hay usuario logueado
    
    // Anidamos la estructura para garantizar privacidad de datos por usuario
    const ref = doc(this.firestore, `users/${user.uid}/favorites/${movie.id}`);
    // Creamos el documento si no existe, o lo sobreescribimos si ya está.
    await setDoc(ref, movie); 
  }

  async removeFavorite(movieId: number) {
    const user = this.auth.currentUser;
    if (!user) return;

    // Localizamos el documento exacto por ID y lo eliminamos
    const ref = doc(this.firestore, `users/${user.uid}/favorites/${movieId}`);
    await deleteDoc(ref);
  }

  async isFavorite(movieId: number): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;

    const ref = doc(this.firestore, `users/${user.uid}/favorites/${movieId}`);
    const snap = await getDoc(ref);
    return snap.exists();
  }

  async getFavorites(): Promise<Movie[]> {
    const user = this.auth.currentUser;
    if (!user) return [];

    const ref = collection(this.firestore, `users/${user.uid}/favorites`);
    const snap = await getDocs(ref);
    return snap.docs.map(doc => doc.data() as Movie);
  }

  // Descargamos solo los IDs y los guardamos en un set
  async getFavoriteIds(): Promise<Set<number>> {
    const user = this.auth.currentUser;
    if (!user) return new Set();

    const ref = collection(this.firestore, `users/${user.uid}/favorites`);
    const snap = await getDocs(ref);
    // Mapeamos los documentos a un array de IDs
    const ids = snap.docs.map(doc => Number(doc.id));
    // Retornamos el set
    return new Set(ids);
  }
}