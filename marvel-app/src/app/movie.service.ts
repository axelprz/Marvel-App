/**
 * SERVICIO CENTRAL DE LA APLICACIÓN (MovieService)
 * ------------------------------------------------
 * Propósito: Centralizar toda la lógica de datos. Ningún componente
 * debe llamar a la API o a Firebase directamente; todo pasa por aquí.
 *
 * Funcionalidades:
 * 1. API Client (TMDB):
 * - Consume endpoints de Películas y Series.
 * - Gestiona la paginación y la búsqueda.
 * - Utiliza Interfaces (Movie, TvShow) para evitar errores de tipo.
 *
 * 2. Firebase Integration (Firestore):
 * - Gestiona la colección 'users/{uid}/favorites'.
 * - Implementa lógica para añadir/quitar favoritos.
 * - Resuelve problemas de concurrencia usando 'firstValueFrom' y 'authState'
 * para asegurar que el usuario esté cargado antes de pedir datos.
 *
 * Patrón utilizado: Singleton (providedIn: 'root').
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs'; 
import { Firestore, collection, doc, setDoc, deleteDoc, getDoc, getDocs } from '@angular/fire/firestore';
import { Auth, authState } from '@angular/fire/auth'; 
import { environment } from '../environments/environment';
import { take } from 'rxjs/operators';

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

export interface TvShow {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  overview: string;
  vote_average: number;
  genre_ids?: number[];
  vote_count?: number;
}

export interface TvShowListResponse {
  page: number;
  results: TvShow[];
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
  providedIn: 'root'
})
export class MovieService {
  private apiKey = environment.tmdbApiKey; 
  private baseUrl = 'https://api.themoviedb.org/3';
  private imageBaseUrl = 'https://image.tmdb.org/t/p/w500';

  constructor(private http: HttpClient, private firestore: Firestore, private auth: Auth) {}

  getPosterUrl(posterPath: string | null): string {
    if (posterPath) {
      return `${this.imageBaseUrl}${posterPath}`;
    }
    return 'assets/placeholder-image.png'; 
  }

  // --- MÉTODOS PÚBLICOS (API) ---

  getPopularMovies(page: number = 1): Observable<MovieListResponse> {
    const url = `${this.baseUrl}/movie/popular?api_key=${this.apiKey}&language=es-ES&page=${page}`;
    return this.http.get<MovieListResponse>(url);
  }

  searchMovies(name: string, page: number = 1): Observable<MovieListResponse> {
    if (name.trim() === '') return this.getPopularMovies(page); 
    const url = `${this.baseUrl}/search/movie?api_key=${this.apiKey}&language=es-ES&query=${encodeURIComponent(name)}&page=${page}`;
    return this.http.get<MovieListResponse>(url);
  }

  discoverMovies(params: DiscoverParams): Observable<MovieListResponse> {
    let httpParams = new HttpParams();
    httpParams = httpParams.set('api_key', this.apiKey);
    httpParams = httpParams.set('language', 'es-ES');

    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.sort_by) httpParams = httpParams.set('sort_by', params.sort_by);
    if (params.with_genres) httpParams = httpParams.set('with_genres', params.with_genres);
    if (params.primary_release_year) httpParams = httpParams.set('primary_release_year', params.primary_release_year.toString());
    if (params.vote_count_gte) httpParams = httpParams.set('vote_count.gte', params.vote_count_gte.toString());

    const url = `${this.baseUrl}/discover/movie`;
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

  getPopularSeries(page: number = 1): Observable<TvShowListResponse> {
    const url = `${this.baseUrl}/tv/popular?api_key=${this.apiKey}&language=es-ES&page=${page}`;
    return this.http.get<TvShowListResponse>(url);
  }

  searchSeries(name: string, page: number = 1): Observable<TvShowListResponse> {
    if (name.trim() === '') return this.getPopularSeries(page);
    const url = `${this.baseUrl}/search/tv?api_key=${this.apiKey}&language=es-ES&query=${encodeURIComponent(name)}&page=${page}`;
    return this.http.get<TvShowListResponse>(url);
  }

  getSeriesById(id: number): Observable<TvShow> {
    const url = `${this.baseUrl}/tv/${id}?api_key=${this.apiKey}&language=es-ES`;
    return this.http.get<TvShow>(url);
  }

  // --- MÉTODOS PRIVADOS (Helper para obtener usuario) ---
  
  // Espera a que Firebase termine de cargar el usuario antes de devolverlo
  private async getCurrentUser() {
    console.log('⏳ Esperando authState de Firebase...');
    const user = await firstValueFrom(authState(this.auth).pipe(take(1)));
    if (user) {
        console.log('✅ AuthState resuelto: Usuario LOGUEADO ->', user.uid);
    } else {
        console.log('❌ AuthState resuelto: Usuario NO LOGUEADO (null)');
    }
    return user;
  }

  // --- MÉTODOS DE FAVORITOS (FIREBASE) ---

  async addFavorite(item: any, type: 'movie' | 'tv') {
    console.log(`🎬 Intentando agregar favorito. ID: ${item.id}, Tipo: ${type}`);
    const user = await this.getCurrentUser(); // Esperamos al usuario
    
    if (!user) {
        console.error('🚫 Bloqueado: No se detectó usuario en addFavorite');
        throw new Error('Usuario no autenticado'); 
    }
    
    const itemToSave = { ...item, media_type: type };
    const path = `users/${user.uid}/favorites/${item.id}`;
    const ref = doc(this.firestore, path);
    
    console.log(`💾 Escribiendo en Firestore: ${path}`);
    
    try {
        await setDoc(ref, itemToSave); 
        console.log('🎉 Escritura exitosa en Firestore');
    } catch (error: any) {
        console.error('🔥 ERROR CRÍTICO al guardar en Firestore:', error);
        if (error.code === 'permission-denied') {
            console.warn('⚠️ ALERTA: Problema de permisos. Revisa las reglas de seguridad en Firebase Console.');
        }
        throw error;
    }
  }

  async removeFavorite(movieId: number) {
    console.log(`🗑️ Intentando eliminar favorito. ID: ${movieId}`);
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Usuario no autenticado');

    const ref = doc(this.firestore, `users/${user.uid}/favorites/${movieId}`);
    
    try {
        await deleteDoc(ref);
        console.log('🗑️ Eliminación exitosa');
    } catch (error) {
        console.error('🔥 Error al eliminar:', error);
        throw error;
    }
  }

  async isFavorite(movieId: number): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    const ref = doc(this.firestore, `users/${user.uid}/favorites/${movieId}`);
    const snap = await getDoc(ref);
    return snap.exists();
  }

  async getFavorites(): Promise<any[]> {
    console.log('📥 Obteniendo lista de favoritos...');
    const user = await this.getCurrentUser(); 
    if (!user) {
        console.log('📭 No hay usuario, retornando lista vacía.');
        return [];
    }

    const ref = collection(this.firestore, `users/${user.uid}/favorites`);
    try {
        const snap = await getDocs(ref);
        console.log(`📦 Favoritos descargados: ${snap.size} elementos.`);
        return snap.docs.map(doc => doc.data());
    } catch (error) {
        console.error('🔥 Error al leer favoritos:', error);
        return [];
    }
  }

  async getFavoriteIds(): Promise<Set<number>> {
    const user = await this.getCurrentUser();
    if (!user) return new Set();

    const ref = collection(this.firestore, `users/${user.uid}/favorites`);
    try {
        const snap = await getDocs(ref);
        const ids = snap.docs.map(doc => Number(doc.id));
        return new Set(ids);
    } catch (error) {
        console.error('🔥 Error al leer IDs de favoritos:', error);
        return new Set();
    }
  }
}

